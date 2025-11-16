---
title: "There's no such thing as Random Numbers (for now)"
description: ''
date: 2025-01-31
tags: ['algorithms']
image: ''
draft: false
authors: ['iedo']
---

To generate random numbers in Java, you do something like this:

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random random = new Random();
        System.out.println(random.nextInt()); // outputs some random number
    }
}
```

You can also pass a seed to the `Random` class constructor, which directly affects the sequence of generated numbers.

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random random = new Random(123);
        System.out.println(random.nextInt());
        System.out.println(random.nextInt());
        System.out.println(random.nextInt());
    }
}
```

Well, these numbers aren’t truly random. Let's take a look at how the `Random` class works.

```java
private static final long multiplier = 0x5DEECE66DL;
private static final long addend = 0xBL;
private static final long mask = (1L << 48) - 1;

public Random() {
    this(seedUniquifier() ^ System.nanoTime());
}

public int nextInt() {
    return next(32);
}

protected int next(int bits) {
    long oldseed, nextseed;
    AtomicLong seed = this.seed;
    do {
        oldseed = seed.get();
        nextseed = (oldseed * multiplier + addend) & mask;
    } while (!seed.compareAndSet(oldseed, nextseed));
    return (int)(nextseed >>> (48 - bits));
}
```

1. If no seed is passed to the constructor, the seed is automatically generated based on the current timestamp.
2. The `nextInt` method calls the `next` method, passing the number of bits of an `Integer`.
3. The `next` method then calculates the next seed using a [linear congruential generator (LCG)](https://en.wikipedia.org/wiki/Linear_congruential_generator) formula.
4. The most significant bits are returned, using a right shift of `48 - 32` bits.

**Using the same seed and the same algorithm will produce the same sequence of numbers**

You can test this code on your own, and you will see the same sequence as me.

```java
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        long seed = 1000;
        Random random1 = new Random(seed);
        Random random2 = new Random(seed);

        for (int i = 0; i < 4; i++) {
          System.out.println(random1.nextInt() + "  " + random2.nextInt());
        }
    }
}
```

Output:

```bash
-1244746321  -1244746321
1060493871  1060493871
-1826063944  -1826063944
1976922248  1976922248
```

## Other interesting Random Number Algorithms

### Perlin Noise

The difference with this algorithm is that the sequence "makes sense," having a smooth transition from one number to another.
This makes it useful for generating textures, effects, and even game worlds.

### Gaussian Distribution

With this algorithm, the probability of each number occurring follows a normal distribution,
based on its distance from the mean.

I created two sketches with p5.js to showcase the difference between 3 random number generators:

- [https://editor.p5js.org/iedoduarte1/sketches/vg4HQSOWB](https://editor.p5js.org/iedoduarte1/sketches/vg4HQSOWB)
- [https://editor.p5js.org/iedoduarte1/sketches/EPBJI0eeq](https://editor.p5js.org/iedoduarte1/sketches/EPBJI0eeq)

There is much more out there, and I encourage you to check them out.

And FYI, REAL random numbers generators would exist if we had quantic computing power.
