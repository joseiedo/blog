---
title: Does Every Optimization Makes Sense?
description: ""
date: 2025-11-12
tags: 
    - algorithms
image: ''
draft: false
authors: 
    - iedo
---

Some weeks ago, I started writing a simple [webserver](https://github.com/joseiedo/mini-webserver-exs) in Elixir.
One of the challenges was building a JSON deserializer. To keep things organized, I separated the logic into two steps:

**tokenize → parse**

Elixir is a functional language with immutable variables and no traditional *loops*.
To iterate, you rely on **recursion** and **creating new values**. This becomes important when dealing with performance.

## The Problem: Parsing Lists in Elixir

Take this simplified version of my `parse_list` function:

```elixir
defp parse_list([{token_type, value} | rest], list) do
  case token_type do
    type when type in [:string, :number] ->
      parse_list(rest, [value | list])  # append at the head (O(1))

    # other cases...
  end
end
```

In Elixir, lists are linked lists.
Appending to the end (`list ++ [value]`) is **O(n)**, so we prepend instead (`[value | list]`) which is **O(1)**.

But this introduces a problem:

* Input: `[1, 2, 3]`
* Parsed result: `[3, 2, 1]` (**it's reversed**)

To fix this, I reversed the list again once parsing was finished:

```elixir
defp parse_list([{token_type, value} | rest], list) do
  case token_type do
    :closed_list ->
      {rest, Enum.reverse(list)}

    type when type in [:string, :number] ->
      parse_list(rest, [value | list])

    # ...
  end
end
```

This got me thinking:

> If I have a *huge* JSON list, I traverse it once… and then reverse it again.
> That’s two full passes. Is this slow? Should I optimize further (e.g., use a stack)?

Time to benchmark.


# Talking Is Easy, Show me the data.

Let’s process **10 million** JSON items.

```elixir
test "kaboom" do
  list =
    0..9_999_999
    |> Enum.map(fn _ -> "\"a\"" end)
    |> Enum.join(",")

  input = ~s({
    "foo": [#{list}]
  })

  tokens = JsonParser.tokenize(input)

  {microseconds, json} =
    :timer.tc(fn ->
      JsonParser.parse(tokens)
    end)

  milliseconds = microseconds / 1_000
  IO.puts("Parse time: #{milliseconds} ms")

  assert Map.has_key?(json, :foo)
  assert length(json.foo) == 10_000_000
end
```

The output:

```bash
466.635 ms
```

Not bad for parsing 10 million items. But what if I remove the final `Enum.reverse(list)` step?

**The performance improved by… **only ~30 ms**.**

*fuck.*

```bash
⡴⠒⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣼⠉⠳⡆⠀
⣇⠰⠉⢙⡄⠀⠀⣴⠖⢦⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⣆⠁⠙⡆
⠘⡇⢠⠞⠉⠙⣾⠃⢀⡼⠀⠀⠀⠀⠀⠀⠀⢀⣼⡀⠄⢷⣄⣀⠀⠀⠀⠀⠀⠀⠀⠰⠒⠲⡄⠀⣏⣆⣀⡍
⠀⢠⡏⠀⡤⠒⠃⠀⡜⠀⠀⠀⠀⠀⢀⣴⠾⠛⡁⠀⠀⢀⣈⡉⠙⠳⣤⡀⠀⠀⠀⠘⣆⠀⣇⡼⢋⠀⠀⢱
⠀⠘⣇⠀⠀⠀⠀⠀⡇⠀⠀⠀⠀⡴⢋⡣⠊⡩⠋⠀⠀⠀⠣⡉⠲⣄⠀⠙⢆⠀⠀⠀⣸⠀⢉⠀⢀⠿⠀⢸
⠀⠀⠸⡄⠀⠈⢳⣄⡇⠀⠀⢀⡞⠀⠈⠀⢀⣴⣾⣿⣿⣿⣿⣦⡀⠀⠀⠀⠈⢧⠀⠀⢳⣰⠁⠀⠀⠀⣠⠃
⠀⠀⠀⠘⢄⣀⣸⠃⠀⠀⠀⡸⠀⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣆⠀⠀⠀⠈⣇⠀⠀⠙⢄⣀⠤⠚⠁⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⠀⢠⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡄⠀⠀⠀⢹⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡀⠀⠀⢘⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡇⠀⢰⣿⣿⣿⡿⠛⠁⠀⠉⠛⢿⣿⣿⣿⣧⠀⠀⣼⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢠⡀⣸⣿⣿⠟⠀⠀⠀⠀⠀⠀⠀⢻⣿⣿⣿⡀⢀⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠘⡇⠹⠿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡿⠁⡏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣤⣞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢢⣀⣠⠇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠲⢤⣀⣀⠀⢀⣀⣀⠤⠒⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
```

30 ms across 10 million elements is… almost nothing.
You can’t see it. You can’t feel it.
Your program will not suddenly become a rocket ship.

Yes, reversing a list makes the algorithm technically slower.
But the difference is **not meaningful** for most workloads.

So, the lesson here is:

**Benchmark your code before optimizing what doesn’t matter.**
