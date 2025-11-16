---
title: Where java dump my variables?
description: ""
date: 2025-02-26
tags:
  - java
image: ''
draft: false
authors:
  - iedo
---

## Heap
The heap is where the JVM stores class instance fields, static fields, and array elements. Objects without references in use are eventually removed by the garbage collector.

The heap is divided into three regions:
- **Young Generation** – New objects are allocated here.
- **Old Generation** – Long-lived objects, such as cached data and static configurations, reside here.
- **Metaspace (Java 8+)** – Stores class metadata.

Some examples of objects stored in the heap:
```java
String name = "Kowalski";
List<Object> objects = new ArrayList<>();
Person person = new Person();
```
### String Pool
When a `string` literal is declared, the JVM caches it in the String Pool. If the same string is declared again, the reference to the existing instance is returned, reducing memory usage.

```java
String foo = "Shrek";
String bar = "Shrek";
System.out.println(foo == bar); // true

String fizz = "Shrek";
String buzz = new String("Shrek");
System.out.println(fizz == buzz); // false, because a new instance is created.
```

The JVM applies similar optimizations to certain [wrapper classes](https://en.wikipedia.org/wiki/Primitive_wrapper_class_in_Java), depending on their values.

### String Concatenation and Memory Usage
Every time a new string is created by concatenation, a new instance is allocated in memory. This can lead to excessive memory usage, especially in loops.

For example, a loop that repeatedly adds characters to a string creates multiple instances:

```java
String text = "yoho";
for (int i = 0; i < 100; i++) {
    text += text.charAt(2);
    text += text.charAt(3);
}
System.out.println(text);
```

This results in **a LOT** of instances!
![A screenshot in IntelliJ showing many instances of String](https://i.imgur.com/zfRWT5P.png)

Using a [StringBuilder](https://docs.oracle.com/javase/8/docs/api/java/lang/StringBuilder.html) is a more memory-efficient approach:

```java
StringBuilder text = new StringBuilder();
String baseText = "yoho";
text.append(baseText);
for (int i = 0; i < 100; i++) {
    text.append(baseText.charAt(2));
    text.append(baseText.charAt(3));
}
System.out.println(text.toString());
```

Since `StringBuilder` uses a buffer, there are no unexpected extra 100+ `String` instances!

## Stack
Each thread has its own stack, which stores method calls, parameters, return addresses, and local variables. When a function returns or a thread terminates, the stack frame is popped, freeing memory.

```java
public int add(int a, int b) {
    // Parameters 'a' and 'b' are stored in the stack.
    int sum = a + b;  // The local variable 'sum' is also stored in the stack.
    return sum;  // The stack frame is removed after returning.
}
```

## Escape Analysis
The JVM performs escape analysis to determine whether an object can be safely allocated on the stack instead of the heap. If an object is only used within a method and does not escape, the JVM may optimize memory allocation by keeping it on the stack, avoiding the need for garbage collection.

Example:
```java
public void process() {
    Data data = new Data(42); // This object may be allocated on the stack
    System.out.println(data.getValue());
}
```

If `data` does not escape the method, the JVM may optimize it as a stack allocation instead of a heap allocation, improving performance.

## CPU Cache (L1/L2)
The L1/L2 cache is the fastest memory in a system, located within CPU cores. Managed by the CPU, it stores frequently accessed data and instructions, reducing access time compared to main memory.

Since it's small, you need to consider your objects' sizes (to estimate, sum the bytes of each field).  
In 99% of cases, this isn’t a concern—especially if your classes follow the single-responsibility principle and your code is modular.

You also can use a library like [JOL](https://www.baeldung.com/java-memory-layout) to see the memory layout of your objects.

## Conclusion
It's very interesting to know what java does under the hood. If I learn something new about its magics i'm gonna add here or in a new blogpost.
