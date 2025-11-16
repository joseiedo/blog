---
title: 'Fibonacci, Integer overflow and Memoization'
description: ''
date: 2025-02-12
tags: ['algorithms']
image: ''
draft: false
authors: ['iedo']
---

Let's do an exercise.

Below is a code snippet that returns the number at position _n_ in the Fibonacci sequence:

```java
public static int fib(int n){
   if (n <= 1){
     return n;
   }
   return fib(n-1) + fib(n-2);
}
```

How about trying to display all Fibonacci numbers less than 2147483647 in our terminal?

```java
public static int fib(int n){
    if (n <= 1){
        return n;
    }
    return fib(n-1) + fib(n-2);
}

public static void main(String[] args) {
    int position = 1;
    int currentNumber = fib(position);

    while (currentNumber < 2147483647) {
        System.out.println(currentNumber);
        position++;
        currentNumber = fib(position);
    }
}
```

## The Problems

When running the code, you will notice two main issues:

- Our loop never stops, and strangely, negative numbers start appearing in the console.  
  ![Console output showing negative numbers](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s3dfoy24ru65199dhy41.png)

- The code gets slower and slower as time goes on.  
  ![At some point, it takes 40 seconds to calculate a single number](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1u3e5nfk6ct4e7f27by2.png)

### Problem 1: The Negative Numbers

Forget about Fibonacci for a moment and take a look at this code:

```java
public static void main(String[] args) {
   int a = 2_000_000_000;
   int b = 2_000_000_000;
   System.out.println(a + b);
}
```

How much do you think the result will be? 2 billion + 2 billion = 4 billion, right?  
So in our code, the result should be 4 billion... right?

**WRONG!**

The actual output was:
![Console output showing -294967296](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/y6q8xq297qdd13m74dn8.png)
The reason for this result is **integer overflow**. The `int` type has a maximum limit of 2147483647 (or 2³¹ - 1).
When this limit is exceeded, the value "wraps around" to the minimum possible value for `int`, which is -2147483648.

#### Why Didn't Our Loop Stop?

Our loop was supposed to stop when we reached a number greater than or equal to 2147483647.
But since the Fibonacci values exceeded the `int` limit, negative numbers started being generated.
Since we never reached a number greater than 2147483647, the loop never stopped.

#### Solution to Problem 1

To keep things simple, we just need to change the return type of our `fib` function from `int` to `long`,
which has a much higher limit. Our code will look like this:

```java
public static long fib(long n){
    if (n <= 1){
        return n;
    }
    return fib(n-1) + fib(n-2);
}

public static void main(String[] args) {
    long position = 1;
    long currentNumber = fib(position);

    while (currentNumber < Integer.MAX_VALUE) {
        System.out.println(currentNumber);
        position++;
        currentNumber = fib(position);
    }
}
```

Now, with the `long` type, we can correctly print Fibonacci numbers up to the largest number less than 2147483647.

![Terminal output showing all Fibonacci numbers up to 1836311903](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/9d1iccezaw34apshd19i.png)

### Problem 2: Slowness

Have you noticed something?  
On every loop iteration, the `fib` function **recalculates all previous numbers in the sequence**.
In other words, we are repeating unnecessary calculations.

How can we avoid redundant calculations? Introducing: [Memoization](https://www.geeksforgeeks.org/what-is-memoization-a-complete-tutorial/).  
Memoization is a technique for storing already computed results so we don't have to recalculate them.

Let's implement a `HashMap` to store the values we have already found, where the key is the position,
and the value is the Fibonacci number itself.

```java
static HashMap<Long, Long> memo = new HashMap<>();

public static long fib(long n) {
    if (memo.containsKey(n)) {
        return memo.get(n);
    }
    if (n <= 1) {
        return n;
    }
    long result = fib(n - 1) + fib(n - 2);
    memo.put(n, result);
    return result;
}

public static void main(String[] args) {
    long position = 1;
    long currentNumber = fib(position);

    while (currentNumber < 2147483647) {
        System.out.println(currentNumber);
        position++;
        currentNumber = fib(position);
    }
}
```

Beautiful! Now our code runs much faster, and we have solved our problem.

### A simpler approach

In reality, **memoization was not necessary** here. I just wanted to introduce the concept.  
We could have simply calculated each Fibonacci number iteratively, using dynamic programming like this:

```java
public static void main(String[] args) {
    long prev1 = 0;
    long prev2 = 1;
    long current;

    System.out.println(prev1);

    while (prev2 < 2147483647) {
        System.out.println(prev2);
        current = prev1 + prev2;
        prev1 = prev2;
        prev2 = current;
    }
}
```

Did I ruin the fun? Sorry! But I hope you learned something new.
