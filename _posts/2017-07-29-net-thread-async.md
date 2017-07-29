---
layout: post
title:  "线程异步操作"
date:   2017-07-29 16:32:18 +0800
categories: .net
tags: .net 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

创建和销毁线程是一个昂贵的操作，要耗费大量时间。另外，太多的线程会浪费内存资源。由于操作系统必须调度可运行的线程并执行上下文切换，所以太多的线程还对性能不利。
为了改善这个情况，CLR 包含了代码来管理它自己的线程池。线程池是你的应用程序能使用的线程集合。每 CLR 一个线程池；这个线程池由 CLR 控制的所有 AppDomain 共享。
如果一个进程中加载了多个 CLR，那么每个 CLR 都有它自己的线程池。

CLR 初始化时，线程池中没有线程的。在内部，线程池维护了一个操作请求队列。应用程序执行一个异步操作时，就调用某个方法，将一个记录项追加到线程池的队列中。线程池的
代码从这个队列中提取记录项，将这个记录项派发给一个线程池线程。如果线程池中没有线程，就创建一个新线程。创建线程会造成一定的性能损失。然而，当线程池线程完成任务后，
线程不会被销毁。相反，线程会返回线程池，在那里进入空闲状态，等待响应另一个请求。由于线程不销毁自身，所以不再产生额外的性能损失。

如果你的应用程序向线程池发出许多请求，线程池会尝试只用这一个线程来服务所有请求。然而，如果你的应用程序发出请求的速度超过了线程池处理它们的速度，就会创建额外
的线程。最终，你的应用程序的所有请求都能由少量线程处理，所以线程池不必创建大量线程。

如果你的应用程序停止向线程池发出请求，池中会出现大量什么也不做的线程。这是对内存的资源浪费。所以，当一个线程池线程闲着没事一段时间后，线程会自己醒来终止自己以
释放资源。线程终止自己会产生一定的性能损失。然而，线程终止自己是因为它闲得慌，表明应用程序本身就没有做太多的事情，所以这个性能损失关系不大。

线程池可以只容纳少量线程，从而避免浪费资源；也可以容纳更多的线程，以利用多处理器、超线程处理器和多核处理器。它能在这两种不同的状态之间从容地切换。线程池是启发式的。
如果应用程序需要执行许多任务，同时有可用的 CPU，那么线程池会创建更多的线程。应用程序负载减轻，线程池线程就终止它们自己。











### 执行简单的计算限制操作

要将一个异步的计算限制操作放到线程池的队列中，通常可以调用 ThreadPool 类定义的以下方法之一：

```c#
 static Boolean QueueUserWorkItem(WaitCallback callBack);
 static Boolean QueueUserWorkItem(WaitCallback callBack,object state);
```

这些方法向线程池的队列添加一个“工作项”以及可选的状态数据。然而，所有方法会立即返回。工作项其实就是由 callBack 参数标识的一个方法，该方法将由线程池线程调用。
可向方法传递一个 state 实参。无 state 参数的那个版本的 QueueUserWorkItem 则向回调方法传递 null。最终，池中的某个线程会处理工作项，造成你指定的方法被调用。
你写的回调方法必须匹配 System.Threading.WaitCallback 委托类型，后者定义如下：

```c#
 delegate void WaitCallback(object state);
```

以下代码演示了如何让一个线程池线程以异步方式调用一个方法

```c#
public static void Main(string[] args)
{
	Console.WriteLine("Main thread:queuing an asynchronous operation");
	ThreadPool.QueueUserWorkItem(ComputeBoundOp, 5);
	Console.WriteLine("Main thread: Doing other work here...");
	Thread.Sleep(10000); // 模拟其他工作(10秒)
	Console.WriteLine("Hit <Enter> to end this program...");
	Console.ReadLine();
}

private static void ComputeBoundOp(object state)
{
	// 这个方法由一个专用线程执行

	Console.WriteLine("In ComputeBoundOp: state={0}", state);
	Thread.Sleep(1000);  // 模拟其它工作

	// 这个方法返回后，线程回到池中
}
```

编译并运行上述代码得到以下输出：

```
Main thread:queuing an asynchronous operation
Main thread: Doing other work here...
In ComputeBoundOp: state=5
Hit <Enter> to end this program...
```

### 执行上下文

每个线程都关联了一个执行上下文数据结构。执行上下文包括的东西有安全设置（压缩栈、Thread和Principal属性和Windows身份）、宿主设置以及逻辑调用上下文数据。
线程执行它的代码时，一些操作会受到线程执行上下文设置的影响。理想情况下，每当一个线程使用另一个线程执行任务时，前者的执行上下文应该流向辅助线程。

System.Threading 命名空间有一个 ExecutionContext 类，它允许你控制线程的执行上下文如何从一个线程流向另一个。下面展示了这个类的样子：

```c#
public sealed class ExecutionContext : IDisposable, ISerializable{
	[SecurityCritical] 
	public static AsyncFlowControl SuppressFlow();
	public static void RestoreFlow();
	public static Boolean IsFlowSuppressed();
}
```

可用这个类阻止执行上下文流动以提升应用程序的性能。对于服务器应用程序，性能的提升可能非常显著。但客户端应用程序的性能提升不了多少。

下例展示了向CLR的线程池队列添加一个工作项的时候，如何通过阻止执行上下文的流动来影响线程逻辑调用上下文中的数据：

```c#
public static void Main(string[] args){
	// 将一些数据放到 Main 线程的逻辑调用上下文中
	CallContext.LogicalSetData("Name", "Jeffrey");

	// 初始化要由一个线程池线程做的一些工作，
	// 线程池线程能访问逻辑调用上下文数据
	ThreadPool.QueueUserWorkItem(state => Console.WriteLine("Name={0}", CallContext.LogicalGetData("Name")));

	// 现在，阻止Main线程的执行上下文的流动
	ExecutionContext.SuppressFlow();

	// 初始化要由线程池做的工作
	// 线程池线程不能访问逻辑调用上下文数据
	ThreadPool.QueueUserWorkItem(state => Console.WriteLine("Name={0}", CallContext.LogicalGetData("Name")));

	// 恢复Main线程的执行上下文的流动，
	// 以免将来使用更多的线程池线程
	ExecutionContext.RestoreFlow();
	...
	Console.ReadLine();
}
```			

编译并运行上述代码得到以下输出结果

```
Name=Jeffrey
Name=
```

### 协作式取消和超时

Microsoft.Net Framework 提供了标准的取消操作模式。取消操作首先要创建一个 System.Threading.CancellationTokenSource 对象。

```c#
public sealed class CancellationTokenSource:IDisposable{
	public CancellationTokenSource();
	public void Dispose(); 
	
	public Boolean IsCancellationRequested{get;}
	public CancellationTokenSource Token{get;}
	
	public void Cancel();
	public void Cancel(Boolean throwOnFirstException);
	...
}
```

这个对象包含了和管理取消有关的所有状态。构造好一个 CancellationTokenSource 之后，可从它的 Token 属性获取一个或多个 CancellationToken 实例，并传给你的
操作，使操作可以取消。

```c#
public struct CancellationToken{
	public static CancellationToken None{get;}
	
	public Boolean IsCancellationRequested{get;}   // 由非通过Task调用的操作调用
	public void ThrowIfCancellationRequested();    // 通过Task调用的操作调用
	
	// CancellationTokenSource 取消时，WaitHandle 会收到信号
	public WaitHandle WaitHandle{get;}
	
	public Boolean CanBeCanceled{get;}
	
	public CancellationTokenRegistration Register(Action<object> callback,object state,Boolean useSynchronizationContext);
}
```

以下代码将这些概念梳理了一遍：

```c#
public static void Go()
{
	CancellationTokenSource cts = new CancellationTokenSource();

	ThreadPool.QueueUserWorkItem(o => Count(cts.Token, 1000));

	Console.WriteLine("Press <Enter> to cancel the operation.");
	Console.ReadLine();
	cts.Cancel();  // 如果 Count 方法已返回，Cancel 没有任何效果
	// Cancel 立即返回，方法从这里继续

	Console.ReadLine();
}

private static void Count(CancellationToken token, Int32 countTo)
{
	for(Int32 count=0;count<countTo;count++)
	{
		if (token.IsCancellationRequested)
		{
			Console.WriteLine("Count is cancelled");
			break;
		}
		Console.WriteLine(count);
		Thread.Sleep(200);
	}
	Console.WriteLine("Count is done");
}
```

CancellationToken 的 Register 方法返回一个 CancellationTokenRegistration, 如下图所示：

```c#
public struct CancellationTokenRegistration:IEnumerable<CancellationTokenRegistration>,IDisposable{
	public void Dispose();
}
```

可以调用 Dispose 从关联的 CancellationTokenSource 中删除已登记的回调；这样一来，在调用 Cancel 时，便不会再调用这个回调。

```c#
 var cts = new CancellationTokenSource();
 cts.Token.Register(()=>Console.WriteLine("Canceled 1"));
 cts.Token.Register(()=>Console.WriteLine("Canceled 2"));
 
 // 出于测试的目的，我们取消它，以便执行2个回调
 cts.Cancel();
```

运行上述代码，一旦调用 Cancel 方法，就会得到如下输出：

```
Canceled 2
Canceled 1
```

最后，可以通过链接另一组 CancellationTokenSource 来新建一个 CancellationTokenSource 对象。任何一个链接的 CancellationTokenSource 被取消，这个新的
CancellationTokenSource 对象就会被取消。

```c#
var cts1 = new CancellationTokenSource();
cts1.Token.Register(() => Console.WriteLine("cts1 canceled"));
```









