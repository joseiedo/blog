---
title: I tried emulator development
description: ""
date: 2025-11-10
tags:
  - emulator
image: ""
draft: false
authors:
  - iedo
---

I have some *FOMO* whenever I see something about programming that’s ***not web programming***.  
For some reason, I feel the need to study it because ~I don’t touch grass~ I like to believe it’s a way to evolve my skills.

There are some great courses out there, like [nand2tetris](https://www.nand2tetris.org/).  It’s really good _but I’m too lazy to commit to a full course just to play around._
So I did the most recommended thing on the [r/EmuDev](https://www.reddit.com/r/EmuDev/) subreddit:  **build a CHIP-8 emulator**, following [Tobias V. Langhoff](https://tobiasvl.github.io/blog/write-a-chip-8-emulator/)'s guide.

He doesn’t give away implementation code, but he has great tips and simplifies the specification a lot.

## Emulating the Components

CHIP-8 has the following components:

- **Memory:** 4 KB of RAM  
- **Display:** 64×32 pixels (or 128×64 for SUPER-CHIP), monochrome (black/white)  
- **Program Counter (PC):** Points to the current instruction in memory  
- **Index Register (I):** A single 16-bit register used to point to memory locations  
- **Stack:** Used for subroutine calls (16-level deep)  
- **Delay Timer:** 8-bit timer, decremented 60 times per second  
- **Sound Timer:** Same as delay timer, but beeps while non-zero  
- **Registers:** 16 general-purpose 8-bit registers (V0–VF)

This sounds hard at first, but don’t overthink it.  
In practice, it’s just a bunch of variables and arrays, like this:

```java
private byte[] display = new byte[64 * 32];
private int PC;
private int I;
private int[] stack = new int[16];
private byte[] memory = new byte[4096];
private int[] V = new int[16];
private int delayTimer;
private int soundTimer;
```

## Memory Layout

When the emulator starts, memory is divided into sections (with specific address ranges):

```
+---------------------------+ 0xFFF  (4095)
| Display memory (optional) |
+---------------------------+ 0xF00
| Stack / scratch area      |
+---------------------------+ 0xEA0
| Program data / code       | <-- where ROMs are loaded
| ...                       |
+---------------------------+ 0x200
| Fontset (sprites 0–F)     |
+---------------------------+ 0x050
| Reserved (interpreter)    |
+---------------------------+ 0x000
```

These memory addresses (like 0x200 for program data) can be emulated easily in our memory array.  
Each index stores one byte.

We then load an array of bytes (the ROM) and store it starting at address 0x200:

```java
public void loadGame() throws IOException {
    byte[] program = Files.readAllBytes(Paths.get("roms/9-pong.ch8"));
    arraycopy(program, 0, memory, 0x200, program.length);
}
```

That’s it! our ROM is now sitting right where CHIP-8 expects it to be.

## CPU Cycle and Reading Instructions (the Assembly-Like Stuff)

The CHIP-8 CPU follows the _fetch–decode–execute_ flow. In _Computer Architecture_ classes, we learn that CPUs run in cycles.  
We need to emulate this here and guess what? It’s simple.

```java
final int CLOCK_HZ = 700; // ~700 cycles per second
final long NS_PER_CYCLE = 1_000_000_000L / CLOCK_HZ;

long lastCycle = System.nanoTime();

while (true) {
    long now = System.nanoTime();
    if (now - lastCycle >= NS_PER_CYCLE) {
        fetchOpCode();
        decodeAndExecute();
        lastCycle += NS_PER_CYCLE;
    }

    Thread.sleep(1); // prevent 100% CPU usage
}
```

For the ***fetch*** step, we need to read the memory location where the **Program Counter** is pointing.

```java
private void fetchOpCode() {
    int pc = programCounter.getCurrent();
    opcode = ((memory[pc] & 0xFF) << 8) | (memory[pc + 1] & 0xFF);
    programCounter.next();
}
```

And for the ***decodeAndExecute*** step, it’s just a bunch of bit masking and one gigantic switch statement.

_Look at this beautifully ugly switch statement_

```java
private void decodeAndExecute() {
    int X = (opcode & 0x0F00) >> 8;
    int Y = (opcode & 0x00F0) >> 4;
    int N = opcode & 0x000F;
    int NN = opcode & 0x00FF;
    int NNN = opcode & 0x0FFF;

    switch (opcode & 0xF000) {
        case 0x0000:
            switch (N) {
                case 0x0: // 0x00E0: clear screen
                    display.clearScreen();
                    break;
                case 0xE: // 0x00EE: return from subroutine
                    programCounter.jump(stack[--sp]);
                    break;
            }
            break;
        case 0x1000: // 1NNN: jump
            programCounter.jump(NNN);
            break;
        case 0x2000: // 2NNN: call subroutine
            stack[sp++] = programCounter.getCurrent();
            programCounter.jump(NNN);
            break;
        case 0x3000: // 3XNN: skip if VX == NN
            if (V[X] == NN) programCounter.next();
            break;
        case 0x4000: // 4XNN: skip if VX != NN
            if (V[X] != NN) programCounter.next();
            break;
        case 0x5000: // 5XY0: skip if VX == VY
            if (V[X] == V[Y]) programCounter.next();
            break;
        case 0x9000: // 9XY0: skip if VX != VY
            if (V[X] != V[Y]) programCounter.next();
            break;
        case 0x6000: // 6XNN: set
            V[X] = NN & 0xFF;
            break;
        case 0x7000: // 7XNN: add
            V[X] = (V[X] + NN) & 0xFF;
            break;

        // ...and yes, there’s more.
    }
}
```

Our goal is simply to implement each instruction according to the specification. Yeah, it's tedious.

## Final thoughts

Developing emulators requires way too much work.  
You really have to care about what you’re emulating, that’s the only thing that’ll keep you going.

I don’t plan to do this again, unless I retire and decide I want to suffer.
