---
title: AQS系列之ReentrantLock源码阅读
date: 2020-01-24 21:14:16
tags: [Java]
categories: Java
---
在上一篇文章中我们讲到了volatile的作用和Unsafe类提供给我们的CAS原子更新变量和线程的挂起和唤醒；这一篇主要贴一些ReentrantLock源码和注释，把个人觉得晦涩的地方讨论一下。