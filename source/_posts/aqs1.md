---
title: AQS前传
date: 2020-01-16 17:57:26
tags: [Java]
categories: Java
---
我来填坑，我们通常会说AQS是一个框架，是各种锁的基础。ReentrantLock、ReentrantReadWriteLock底层都是基于AQS来实现的。从代码角度来说，AQS是父类，然后子重写父类提供的一些方法，就可以很简单的实现自己的一个锁，用于生产。第一篇打算先说清楚AQS的一些相关知识。这样后续在看AQS会比较流畅。
<!-- more -->

#### volatile 关键字
我们都知道volatile关键字，是通过内存屏障实现了两个特性：
- 可见性：假设两个线程A和B同时从主内存中读取了同一个变量c，线程A修改了变量c，会及时写回主内存，并且使线程B持有的变量c失效，然后线程B从主内存读取到被线程A修改过的变量。这样就保证了可见性；
- 避免指令重排序，这个就是在volatile变量前后加了内存屏障，可以当成一个标识，在这个标识前后的指令，不能进行重排序。

来看第一段代码，证明一下可见性：
```
public class VolatileTest2 {
    private static volatile Integer c = 0;

    public static void main(String[] args) throws Exception {
        new Thread(() -> {
            while (true) {
                if (c == 0) {
                    System.out.println("ac = " + c);
                } else {
                    System.out.println("bc = " + c);
                    break;
                }
            }

        }).start();

        new Thread(() -> {
            c = 1;
        }).start();
        
    }
}
```

重点在第二段代码，想说明的是volatile修饰的变量不仅影响变量自身，而且会影响他前后变量。

