---
title: Cool ways to use AI when coding
description: ""
date: 2026-04-11
tags: ['ai']
image: ''
draft: false
authors:
    - iedo
---

I believe the most important thing I learned over the last year is that **there is no right way to use AI**, no matter how cool the LinkedIn speaker sounds.

But there is one pattern in LLM workflows that seems pretty standard:

**CONTEXT!!!!!!!!!!**
 
RAG, Skills, MCPs, spec-driven development: all of these follow this recipe in different ways: **GIVE. CONTEXT.**

Like you would to human developers, in normal circumstances. The answer will be significantly better.

This thing is a token eater and a token shitter. Of course, LLMs are trained on massive amounts of internet data, but you still need to give them context about the product you're building.

The Cloudflare engineering director who built vinext, a Next.js-compatible framework, told the agents to use the Next.js source and tests as a behavioral reference:

https://github.com/cloudflare/vinext/blob/main/AGENTS.md#development-workflow

```
Adding a New Feature
Check if Next.js has it — look at Next.js source to understand expected behavior
Search the Next.js test suite — before writing code, search test/e2e/ and test/unit/ in the Next.js repo for related test files (see below)
Add tests first — put test cases in the appropriate tests/*.test.ts file

Fixing Bugs
Always verify Next.js behavior first. Before writing a fix, confirm how Next.js handles the same scenario. This applies to security fixes, bug reports, and behavioral changes. We have repeatedly shipped fixes that diverged from Next.js because this step was skipped. Specific things to check:
```

For the rest of this post, I will give a few examples using [Skills](https://support.claude.com/en/articles/12512176-what-are-skills). If you don't know what they are, they are worth learning.

## Don't ask the AI to follow best practices, feed them to it.

Best practices have always been conflicting.

- Some people love Clean Code like it's God, others understand the suggestions [are not always applicable](https://qntm.org/clean)
- "SOLID is the right way!" until [CUPID](https://dannorth.net/blog/cupid-for-joyful-coding/) appeared.

The thing is, you need to define which best practices will be followed in the codebase. This is true even with human engineers.

Bigger companies usually have internal coding guidelines. Smaller ones often just copy from bigger companies.

Putting those guidelines inside the project's CLAUDE.md, or in a global .md file, is a good starting point for this.

## Some MCPs can be replaced by a skill
If the API you want to integrate has a CLI, an MCP can sometimes be replaced with a Skill file that explains how to use that CLI.

The nice thing is that some CLI projects already ship skills for you, like [Resend](https://github.com/resend/resend-cli/blob/main/skills/resend-cli/SKILL.md).

## Mini-RAG
I copied a skill from [leandronsp](https://leandronsp.com/) that uses [QMD](https://github.com/tobi/qmd) to search content in my notes vault.

It's pretty useful. I can make it search for documents about a specific topic, and it will take the time to dig through them.

- [Example](https://github.com/joseiedo/.dotfiles/blob/main/claude/.claude/skills/vault/SKILL.md)

## TDD / Pair programming
Sometimes I'm studying something new. I can pair-program with AI, so I'm the driver while I have a wise copilot talking with me and answering questions with context from my codebase.

It's pretty useful, and it can work with TDD to create tests or suggest test cases for me to implement.

- [Example](https://github.com/joseiedo/.dotfiles/blob/main/claude/.claude/skills/pair/SKILL.md)

## LeetCode (or any subject) guide
This is similar to the TDD idea. By giving the AI the role of a "pair programming" partner, it can help me learn LeetCode problems without just solving them for me.

- [Example](https://github.com/joseiedo/.dotfiles/blob/main/claude/.claude/skills/leetcode-teacher/SKILL.md)

## Conclusion
Most other ideas I have are just reusing the same thing I already said:

- If you want to build a frontend, get real websites to use as context and define a guideline. The same applies to anything else.
- If you're implementing a new API, feed the documentation to the AI.

The point is not to ask the AI to magically know what good means. Give it examples, constraints, and the shape of the work you want.
