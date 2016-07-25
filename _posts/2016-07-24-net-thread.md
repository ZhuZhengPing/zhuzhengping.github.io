---
layout: post
title:  "构建多线程应用程序"
date:   2016-07-24 16:32:18 +0800
categories: .net
tags: .net 多线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

线程被定义为可执行应用程序中的基本执行单元。虽然很多.NET程序在单线程模式下运行得很好，但程序集的主线程(在Main()方法执行时由CLR产生的)能够创建次线程，并由它们来执行一些额外的工作。采用这些新增的线程，能构建出相应更快的应用程序。






若想要通过编程得到对当前(正在执行某段代码的)线程的引用，只需要调用静态属性Thread.CurrentThread:

```c#
static void ExtractExecutingThread()
{
	// 得到正在执行这个方法的线程
	Thread currThread = Thread.CurrentThread;
}
```

在.NET平台下，应用程序域和线程之间并不是一一对应的。在任何时间内，一个应用程序域内都可能有多个线程。而且，一个特定的线程在它的生命周期内并不一定被限定在一个应用程序域中。Windows线程调度程序和CLR会根据需要让线程能够自由地跨越应用程序域的边界。

虽然活动的线程能够跨越多个应用程序域边界，但是在任何一个时间点上，一个线程只能运行在一个应用程序域中(也就是说，一个线程同时在多个应用程序域上执行任务是不可能的)。当希望访问应用程序域时，请调用静态方法Thread.GetDomain():

```c#
static void ExtractAppDomainHostingThread()
{
	// 获得正则承载当前线程的应用程序域
	AppDomain ad = Thread.GetDomain();
}
```

在任何特定的时刻，一个线程也可以移动到一个特定的上下文中，并且它可以由CLR重新部署在一个新的上下文中。要获得正在执行中的线程的当前上下文，请调用静态属性Thread.CurrentContext

```c#
static void ExtractCurrentThreadContext()
{
	// 获取当前操作线程所在的上下文
	Context ctx = Thread.CurrentContext;
}
```

### 并发问题

多线程的“乐趣”之一是：几乎无法控制底层操作系统和CLR对线程的调度。举例来说，如果精心编写一段创建一个新线程的代码，你不能保证这个线程被立即执行。

此外，既然通过CLR线程可以在应用程序域和上下文边界之间移动，就必须留下应用程序中的线程不稳定操作和原子型(atomic)操作。

举例来说，假设有一个线程正在调用某个特定对象的一个方法，为了让另一个线程也访问同一对象的同一方法，线程调度程序将发出指令挂起第一个线程。而此时，如果前一个线程没有全部完成当前的操作，那么后来的线程可能看到对象处于被部分修改状态。这样它所读到的数据基本上是虚假的，这时也会产生很奇怪的bug。

### 线程同步的作用

多线程应用程序域本身是相当不稳定的，因为在同一时间，多个线程都能运行共享的功能块。为了保护应用程序的资源不被破坏，.NET开发者必须使用线程的各种原语(比如lock、monitor和[Synchronization]特性)来控制线程对他们的访问。

### 委托的异步性 BeginInvoke()和EndInvoke()方法

```
public sealed class BinaryOp: System.MulticastDelegate
{
...
	// 用于异步调用方法
	public IAsyncResult BeginInvoke(int x,int y,AsyncCallback cb,object state);
	
	// 用于获取被调用方法的返回值
	public int EndInvoke(IAsyncResult result);
}
```

传入 BeginInvoke()的参数必须符合C#委托约定(对于BinaryOp,就两个整形)。

### System.IAsyncResult 接口

BeginInvoke()返回的对象实现了IAsyncResult接口，而EndInvoke()需要一个IAsyncResult兼容(即实现了IAsyncResult接口的类型)类型作为它唯一的参数。由BeginInvoke()返回的IAsyncResult兼容对象主要是一种耦合机制，它允许调用的线程在稍后通过EndInvoke()获取异步方法调用的结果。IAsyncResult接口的定义如下：

```c#
public interface IAsyncResult
{
	object AsyncState{get;set;}
	WaitHandle AsyncWaitHandle { get; }
	bool CompletedSynchronously { get; }
	bool IsCompleted { get; }
}
```

### 异步调用方法

```c#
delegate int BinaryOp(int x,int y);
static int Add(int x, int y)
{
	Console.WriteLine("Add() invoked on thead {0}",Thread.CurrentThread.ManagedThreadId);
	return x + y;
}
static void Main(string[] args)
{

	// 输出正在执行中的线程
	Console.WriteLine("Main() invoked on thread {0}",Thread.CurrentThread.ManagedThreadId);

	// 在次线程中调用Add
	BinaryOp b = new BinaryOp(Add);
	IAsyncResult iftAR = b.BeginInvoke(10, 10, null, null);

	// 在主线程中做其他的事
	Console.WriteLine("Doing more work in Main()");

	// 当执行完后获取Add()方法的结果
	int answer = b.EndInvoke(iftAR);
	Console.WriteLine("10 + 10 is {0}",answer);

	Console.ReadLine();
}
```

运行这个程序，我们将发现两个不同的ID值，这说明当前应用程序域中有两个线程在运行

```
Main() invoked on thread 9
Doing more work in Main()
Add() invoked on thread 10
10 + 10 is 20
```

### 同步调用线程

如果仔细思考一下Main()的实现，可能意识到BeginInvoke()和EndInvoke()之间的时间间隔明显小于5秒钟，因此，在"Doing more work in Main()!" 被输出到控制台后，主线程将会被阻塞，并一直等到次线程完成才能获得Add()方法的结果。这样效率似乎不太好，我们需要做另一个同步调用。















