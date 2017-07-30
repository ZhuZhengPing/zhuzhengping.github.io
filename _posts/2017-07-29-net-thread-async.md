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
// 创建一个 CanellationTokenSource
var cts1 = new CancellationTokenSource();
cts1.Token.Register(() => Console.WriteLine("cts1 canceled"));

// 创建另一个 CancellationTokenSource
var cts2 = new CancellationTokenSource();
cts2.Token.Register(() => Console.WriteLine("cts2 canceled"));

// 创建一个新的 CancellationTokenSource,它在 cts1 或 cts2 取消时取消
var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(cts1.Token,cts2.Token);
linkedCts.Token.Register(()=>Console.WriteLine("linkedCts canceled"));

// 取消其中一个 CancellationTokenSource对象
cts2.Cancel();

// 显示哪个 CancellationTokenSource 对象被取消了
Console.WriteLine("cts1 canceled={0},cts2 canceled={1},linkedCts={2}",cts1.IsCancellationRequested,cts2.IsCancellationRequested,linkedCts.IsCancellationRequested);
```

运行上述代码得到以下输出

```
linkedCts canceled
cts2 canceled
cts1 canceled=False,cts2 canceled=True,linkedCts=True
```

很多情况下，我们需要在过一段时间之后才取消操作。例如，服务器应用程序可能会根据客户端的请求而开始计算。但必须在2秒钟之内有响应，无论此时工作是否已经完成。有的时候，与其等待漫长时间获得一个完整的结果，还不如在短时间内报错，或者用部分计算好的结果进行响应。幸好，CancellationTokenSource 提供了在指定时间后自动取消的机制。为了利用这个机制，要么用接受延时参数的构造器构造一个 CancellationTokenSource 对象，要么调用 CancellationTokenSource 的 CancelAfter 方法。

```c#
public sealed class CancellationTokenSource:IDisposable{
	public CancellationTokenSource(Int32 millisecondsDelay);
	public CancellationTokenSource(TimeSpan delay);
	public void CancelAfter(Int32 millisecondsDelay);
	public void CancelAfter(TimeSpan delay);
}
```

### 任务

很容易调用 ThreadPool 的 QueueUserWorkItem 方法发起一次异步请求。但这技术有许多限制。最大的问题是没有内建的机制让你知道操作是在什么时候完成，也没有机制在操作完成时获得返回值。为了克服这些限制，Microsoft 引入了任务的概念。我们通过 System.Threading.Tasks 命名空间中的类型来使用任务。

所以，不是调用 ThreadPool 的 QueueUserWorkItem 方法，而是用任务来做相同的事情：

```c#
	ThreadPool.QueueUserWorkItem(ComputeBoundOp,5);
	new Task(ComputeBoundOp,5).Start();
	Task.Run(()=>ComputeBoundOp(5));
```

第二行代码创建 Task 对象并立即调用 Start 来调度任务。当然，也可先创建好 Task 对象再调用 Start。为了创建一个 Task，需要调用构造器并传递一个 Action 或 Action<Ojbect> 委托。调用 Run 时可以传递一个 Action 或 Func<TResult> 委托来指定想要执行的操作。无论调用构造器还是 Run，都可选择传递一个 CancellationToken,它使 task 能在调度前取消。

你可以向构造器传递一些 TaskCreationOptions 标志来控制 Task 的执行方式。TaskCreationOptions 枚举类型定义了一组可按 OR 的标志。

```c#
[Flags,Serializable]
public enum TaskCreationOptions{
	None = 0x0000, //默认
	
	// 提议 TaskScheduler 你希望该任务尽快执行
	PreferFairness = 0x0001,
	
	// 提议 TaskScheduler 应尽可能地创建线程池线程
	LongRunning = 0x0002,
	
	// 该提议总被采纳：将一个 Task 和它的父 Task 关联
	AttachedToParent = 0x0004,
	
	// 该提议总被采纳：如果一个任务试图和这个父任务连接，它就是一个普通任务，而不是子任务
	DenyChildAttach = 0x0008,
	
	// 该提议总被采纳：强迫子任务使用默认调度器而不是父任务的调度器
	HideScheduler = 0x0010
}
```

#### 等待任务完成并获取结果

可等待任务完成并获取结果。例如，以下 Sum 方法在 n 值很大的时候会执行较长时间：

```c#
private static Int32 Sum(Int32 n){
	Int32 sum=0;
	for(;n>0;n--){
		checked{sum+=n;}  // 如果n太大，会抛出 System.OverflowException
	}
	return sum;
}
```

现在可以构造一个 Task<TResult>对象，并为泛型 TResult 参数传递计算限制操作的返回类型。开始任务之后，可等待它完成并获得结果

```c#
	// 创建一个 Task(现在还没开始运行)
	Task<Int32> t = new Task<int>(n => Sum((Int32)n), 100000000);
	
	// 可以后再开启任务
	t.Start();
	
	// 可选择显示等待任务完成
	t.Wait();
	
	// 可获得结果(Result 属性内部会调用 Wait)
	Console.WriteLine("The Sum is :"+t.Result);
```

如果计算限制的任务抛出未处理的异常，异常会被“吞噬”并存储到一个集合中，而线程池线程可以返回到线程池中。调用 Wait 方法或者 Result 属性时，这些成员会抛出一个 System.AggregateException 对象。

除了等待单个任务，Task 类还提供了两个静态方法，运行线程等待一个 Task 对象数组。其中，Task 的静态 WaitAny 方法会阻塞调用线程，直到数组中的任何Task对象完成。方法返回 Int32 数组索引值，指明完成的是哪个 Task 对象。方法返回后，线程被唤醒并继续运行。如果发生超时，方法将返回-1.如果 WaitAny 通过一个 CancellationToken 取消，会抛出一个 OperationCanceledException。

类似地，Task 类还有一个静态 WaitAll 方法，它阻塞调用线程，直到数组中的所有 Task 对象完成。如果所有 Task 对象都完成，WaitAll 方法返回 true。发生超时则返回 false。如果 WaitAll 通过一个 CancellationToken 取消，会抛出一个 OperationCanceledException 异常。

#### 取消任务

可用一个 CancellationTokenSource 取消Task。首先必须修订前面的 Sum 方法，让它接受一个 CancellationToken:

```c#
private static Int32 Sum(CancellationToken ct,Int32 n)
{
	Int32 sum = 0;
	for (; n > 0; n--)
	{
		// 在取消标志引用的 CancellationTokenSource 上调用 Cancel，
		// 下面这行代码就会抛出 OperationCanceledException
		ct.ThrowIfCancellationRequested();
		checked { sum += n; }  // 如果n太大，会抛出 System.OverflowException
	}
	return sum;
}
```

像下面这样创建 CancellationTokenSource 和 Task 对象：

```c#
	CancellationTokenSource cts = new CancellationTokenSource();
	Task<Int32> t = new Task<int>(n => Sum(cts.Token,(Int32)n), 10000);

	// 在之后的某个时间，取消 CancellationTokenSource 以取消 Task
	cts.Cancel();

	try
	{
		Console.WriteLine("The Sum is :" + t.Result);
	}
	catch (AggregateException x)
	{
		x.Handle(e => e is OperationCanceledException);

		// 所有异常处理好之后，执行下面这一行
		Console.WriteLine("Sum was canceled");
	}
```

#### 任务完成时自动启用新任务

调用 Wait,或者在任务尚未完成时查询任务的 Result 属性，极有可能造成线程池创建新线程，这增大了资源的消耗，也不利于性能的伸缩性。下面重写了之前的代码

```c#
 // 创建并启动一个 Task,继续另一个任务
 Task<Int32> t = Task.Run(() => Sum(CancellationToken.None, 10000));

 // ContinueWith 返回一个 Task，但一般都不需要再使用该对象
 Task cwt = t.ContinueWith(task => Console.WriteLine("The sum is:" + task.Result));
```

Task 对象内部包含了 ContinueWith 任务的一个集合。所以，实际可以用一个 Task 对象来多次调用 ContinueWith。任务完成时，所以 ContinueWith 任务都会进入线程池的队列中。此外，可在调用 ContinueWith 时传递对一组 TaskContinuationOptions 枚举值进行按OR运算的结果。前6个标志与之前描述的 TaskCreationOptions 枚举类型提供的标志完全一致

```c#
// 摘要: 
//     为通过使用 System.Threading.Tasks.Task.ContinueWith(System.Action<System.Threading.Tasks.Task>,System.Threading.CancellationToken,System.Threading.Tasks.TaskContinuationOptions,System.Threading.Tasks.TaskScheduler)
//     或 System.Threading.Tasks.Task<TResult>.ContinueWith(System.Action<System.Threading.Tasks.Task<TResult>>,System.Threading.Tasks.TaskContinuationOptions)
//     方法创建的任务指定行为。
[Serializable]
[Flags]
public enum TaskContinuationOptions
{
	//     默认情况下，完成前面的任务之后将安排运行延续任务，而不考虑前面任务的最终 System.Threading.Tasks.TaskStatus。
	None = 0,
	//     提示 System.Threading.Tasks.TaskScheduler 以一种尽可能公平的方式安排任务，这意味着较早安排的任务将更可能较早运行，而较晚安排运行的任务将更可能较晚运行。
	PreferFairness = 1,
	//     指定某个任务将是运行时间长、粗粒度的操作。 它会向 System.Threading.Tasks.TaskScheduler 提示，过度订阅可能是合理的。
	LongRunning = 2,
	//     指定将任务附加到任务层次结构中的某个父级。
	AttachedToParent = 4,
	//     如果尝试附有子任务到创建的任务，指定 System.InvalidOperationException 将被引发。
	DenyChildAttach = 8,
	//     防止环境计划程序被视为已创建任务的当前计划程序。 这意味着像 StartNew 或 ContinueWith 创建任务的执行操作将被视为 System.Threading.Tasks.TaskScheduler.Default
	//     当前计划程序。
	HideScheduler = 16,
	//     在延续取消的情况下，防止延续的完成直到完成先前的任务。
	LazyCancellation = 32,
	//     指定不应在延续任务前面的任务已完成运行的情况下安排延续任务。 此选项对多任务延续无效。
	NotOnRanToCompletion = 65536,
	//     指定不应在延续任务前面的任务引发了未处理异常的情况下安排延续任务。 此选项对多任务延续无效。
	NotOnFaulted = 131072,
	//     指定只应在延续任务前面的任务已取消的情况下才安排延续任务。 此选项对多任务延续无效。
	OnlyOnCanceled = 196608,
	//     指定不应在延续任务前面的任务已取消的情况下安排延续任务。 此选项对多任务延续无效。
	NotOnCanceled = 262144,
	//     指定只应在延续任务前面的任务引发了未处理异常的情况下才安排延续任务。 此选项对多任务延续无效。
	OnlyOnFaulted = 327680,
	//     指定只应在延续任务前面的任务已完成运行的情况下才安排延续任务。 此选项对多任务延续无效。
	OnlyOnRanToCompletion = 393216,
	//     指定应同步执行延续任务。 指定此选项后，延续任务将在导致前面的任务转换为其最终状态的相同线程上运行。 如果在创建延续任务时已经完成前面的任务，则延续任务将在创建此延续任务的线程上运行。
	//     只应同步执行运行时间非常短的延续任务。
	ExecuteSynchronously = 524288,
}
```

调用 ContinueWith 时，可用 TaskContinuationOptions.OnlyOnCanceled 标志指定新任务，只有在第一个任务被取消时才执行。类似地，TaskContinuationOptions.OnlyOnFaulted 标志指定新任务只有在第一个任务抛出未处理异常时才执行。

```c#
 // 创建并启动一个 Task,继续另一个任务
 Task<Int32> t = Task.Run(() => Sum(10000));

 // ContinueWith 返回一个 Task，但一般都不需要再使用该对象
 t.ContinueWith(task => Console.WriteLine("The sum is:" + task.Result),TaskContinuationOptions.OnlyOnRanToCompletion);

 t.ContinueWith(task => Console.WriteLine("Sum threw:" + task.Exception.InnerException), TaskContinuationOptions.OnlyOnFaulted);

 t.ContinueWith(task => Console.WriteLine("Sum was canceled" + task.Result), TaskContinuationOptions.OnlyOnCanceled);
```

#### 任务可以启动子任务

最后，任务支持父/子关系，如以下代码所示

```c#
Task<Int32[]> parent = new Task<int[]>(() => {
	var results = new Int32[3];

	// 这个任务创建并启动3个子任务
	new Task(() => results[0] = Sum(10000), TaskCreationOptions.AttachedToParent).Start();
	new Task(() => results[1] = Sum(20000), TaskCreationOptions.AttachedToParent).Start();
	new Task(() => results[2] = Sum(30000), TaskCreationOptions.AttachedToParent).Start();

	return results;
});

// 父任务及其子任务完成后，用一个延续任务显示结果
var cwt = parent.ContinueWith(parentTask=>Array.ForEach(parentTask.Result,Console.WriteLine));

// 启动父任务，便于它启动它的子任务
parent.Start();
```

在本例中，父任务创建并启动三个 Task 对象。一个任务创建的一个或多个 Task 对象默认是顶级任务，它们与创建它们的任务无关。但 TaskContinuationOptions.AttachedToParent 标志将一个 Task 和 创建它的 Task 关联，结果是排除所有子任务结束运行，否则创建任务不认为已经结束。

#### 任务内部揭秘

虽然任务很有用，但它并不是没有代价的。必须为所有这些状态分配内存。如果不需要任务的附加功能，那么使用 ThreadPool.QueueUserWorkItem 能获得更好的资源利用率。

在一个 Task 对象存在期间，可查询 Task 的只读 Status 属性了解它在其生存期的什么位置。

```c#
public enum TaskStatus
{
	//     该任务已初始化，但尚未被计划。
	Created = 0,
	//     该任务正在等待 .NET Framework 基础结构在内部将其激活并进行计划。
	WaitingForActivation = 1,
	//     该任务已被计划执行，但尚未开始执行。
	WaitingToRun = 2,
	//     该任务正在运行，但尚未完成。
	Running = 3,
	//     该任务已完成执行，正在隐式等待附加的子任务完成。
	WaitingForChildrenToComplete = 4,
	//     已成功完成执行的任务。
	RanToCompletion = 5,
	//     该任务已通过对其自身的 CancellationToken 引发 OperationCanceledException 对取消进行了确认，此时该标记处于已发送信号状态；或者在该任务开始执行之前，已向该任务的
	//     CancellationToken 发出了信号。 有关更多信息，请参见任务取消。
	Canceled = 6,
	//     由于未处理异常的原因而完成的任务。
	Faulted = 7,
}
```

首次构造 Task 对象时，它的状态是 Created. 以后，当任务启动时，它的状态变成 WaitingToRun. Task 实际在一个线程上运行，它的状态就变成了 Running。任务停止运行，并等待它的任何子任务时，状态变成 WaitingForChildrenToComplete。任务完成时进入以下状态之一：RanToCompletion(运行完成)，Canceled或Faulted。如果运行完成，可通过 `Task<TResult>` 的 Result 属性来查询任务结果.判定一个 Task 是否完成最简单的办法是

```c#
 if(task.Status == TaskStatus.RanToCompletion)...
```

#### 任务工厂

有时需要创建一组共享相同配置的 Task 对象。为避免机械地将相同的参数传给每个 Task 构造器，可创建一个任务工厂来封装通用的配置。

```c#
Task parent = new Task(() => {
	CancellationTokenSource cts = new CancellationTokenSource();
	var tf = new TaskFactory<Int32>(cts.Token,
		TaskCreationOptions.AttachedToParent,
		TaskContinuationOptions.ExecuteSynchronously,
		TaskScheduler.Default);

	// 这个任务创建并启动3个子任务
	var childTasks = new[] { 
		tf.StartNew(()=>Sum(cts.Token,10000)),
		tf.StartNew(()=>Sum(cts.Token,20000)),
		tf.StartNew(()=>Sum(cts.Token,Int32.MaxValue)) // 太大，抛出 overflowexception
	};

	// 任何子任务抛出异常，就取消其余子任务
	for (Int32 task = 0; task < childTasks.Length; task++)
	{
		childTasks[task].ContinueWith(t => cts.Cancel(), TaskContinuationOptions.OnlyOnFaulted);
	}

	// 所有子任务完成后，从未出错/未取消的任务获取返回的最大值，
	// 然后将最大值传给另一个任务来显示最大结果
	tf.ContinueWhenAll(
		childTasks,
		completedTasks => completedTasks.Where(t => !t.IsFaulted && !t.IsCanceled).Max(t => t.Result),
		CancellationToken.None)
		.ContinueWith(t => Console.WriteLine("The maximun is: " + t.Result),
		TaskContinuationOptions.ExecuteSynchronously);
});

// 子任务完成后，也显示任何未处理的异常
parent.ContinueWith(p => { 
	// 我将所有文本放到一个 StringBuilder中，并只调用 Console.WriteLine 一次，
	// 因为这个任务可能和上面的任务并行，而我不希望任务的输出变得不连续
	StringBuilder sb = new StringBuilder("The following exception(s) occurred:"+Environment.NewLine);

	foreach (var e in p.Exception.Flatten().InnerExceptions)
	{
		sb.AppendLine(" " + e.GetType().ToString());
	}
	Console.WriteLine(sb.ToString());
},TaskContinuationOptions.OnlyOnFaulted);

// 启动父任务，使它能启动子任务
parent.Start();
```


