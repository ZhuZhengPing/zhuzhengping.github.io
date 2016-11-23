---
layout: post
title:  "任务、线程和同步"
date:   2016-11-23 16:32:18 +0800
categories: .net
tags: .net 多线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

有几个原因需要线程，假设从应用程序中进行网络调用需要一定的时间。我们不希望用户界面停止响应，让用户一直等待直到从服务器返回一个响应。用户可以同时执行一个其他一些操作，或者甚至取消发送给服务器的请求。这些都可以使用线程来实现。






进程包含资源，如 Window 句柄、文件系统句柄或其他内核对象。每个进程都分配了虚拟内存。一个进程至少包含一个线程。操作系统会调度线程。线程有一个优先级，每个线程都有自己的栈，但程序代码的内存和堆由一个进程的所有线程共享。这使一个进程的所有线程之间的通信非常快，但是这也使处理比较困难，因为多个线程可以修改同一个内存位置。

进程管理的资源包括虚拟内存和 Window 句柄，其中至少包含一个线程。线程是运行程序所必须的。在.NET 4之前，必须直接使用 Thread 类和 ThreadPool 类编写线程。现在，.NET 对这两个类做了抽象，允许使用 Parallel 类和 Task 类。

为编写多线程的代码，必须区别两种主要的场景：任务并行性和数据并行性。对于任务并行性，使用 CPU 的代码被并行化。CPU 的多个核心会被利用起来，更快速地完成包含多个任务的活动，而不是在一个核心中按顺序一个一个地执行任务。对于数据并行性，则使用了数据集合。在集合上执行的工作被划分为多个任务。当然，任务并行性和数据并行性可以混合起来。

### Parallel 类

Parallel 类定义了并行的 for 和 foreach 的静态方法。Parallel.For()方法可以并行迭代，它返回的类型是 ParallelLoopResult 结构。

```c#
ParallelLoopResult result = Parallel.For(0,10,i=>{
	Console.WriteLine("{0},task: {1}, thread: {2}",i,Task.CurrentId,Thread.CurrentThread.ManagedThreadId);
	Thread.Sleep(10);
});
Console.WriteLine("Is completed: {0}",result.IsCompleted);
```














