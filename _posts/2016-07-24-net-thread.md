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

如果调用线程(这里指主线程)有被阻塞的可能，那么异步委托就毫无优势可言。为了让调用线程能够发现异步调用是否完成，IAsyncResult提供了IsCompleted属性。使用这个成员，调用线程再调用EndInvoke()之前，便能够判断异步调用是否真正完成。

如果方法没有完成，IsCompleted返回false，这时调用线程可以自由地做其他事情。如果IsCompleted返回true，调用线程便可能以最小的阻塞代价获得返回结果。

```c#
delegate int BinaryOp(int x,int y);
static int Add(int x, int y)
{
	Console.WriteLine("Add() invoked on thead {0}",Thread.CurrentThread.ManagedThreadId);
	// 模拟添加耗时 5秒
	Thread.Sleep(5000);
	return x + y;
}
static void Main(string[] args)
{

	// 输出正在执行中的线程
	Console.WriteLine("Main() invoked on thread {0}",Thread.CurrentThread.ManagedThreadId);

	// 在次线程中调用Add
	BinaryOp b = new BinaryOp(Add);

	// 一旦下一跳语句被处理，调用线程在BeginInvoke()完成之前就被阻塞了
	IAsyncResult iftAR = b.BeginInvoke(10, 10, null, null);

	// 直到Add()方法完成，消息才会显示出来
	while (!iftAR.IsCompleted)
	{
		Console.WriteLine("Doing more work in Main()");
		Thread.Sleep(1000);
	}

	// 现在我知道Add()完成了
	int answer = b.EndInvoke(iftAR);
	Console.WriteLine("10 + 10 is {0}",answer);

	Console.ReadLine();
}
```

这里，在次线程完成之前，循环将不断地执行 Console.WriteLine()语句。一旦次线程完成，我们便能够确信Add()方法真正完成了，从而获得Add()方法的返回值。以下是输出值

```
Main() invoked on thread 8.
Doing more work in Main()!
Add() more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
```

除IsCompleted属性之外，IAsyncResult接口提供了AsyncWaitHandle属性以实现更加灵活的等待逻辑。这个属性返回一个WaitHandle类型的实例，该实例公开了一个名为WaitOne()的方法。使用WaitHandle.WaitOne()的好处是可以指定最长等待时间。如果超时，WaitOne()返回false。

```c#
while(!iftAR.AsyncWaitHandle.WaitOne(1000,true))
{
	Console.WriteLine("Doing more work in Main()!");
}

虽然IAsyncResult的这些属性提供了同步调用线程的方式，但是这不是最高效的方式

### AsyncCallback委托的作用

不通过轮询一个委托来确定异步调用方法执行是否结束，而是在任务完成时由次线程主动通知调用线程的方式，这样更好。

和所有委托一样，AsyncCallback委托仅仅能够调用那些符合特定模式的方法，这个方法只有一个参数IAsyncResult，并且没有返回值。

```c#
// AsynCallback 的目标必须和下面的模式匹配
void MyAsyncCallbackMethod(IAsyncResult itfAR);
```

我们重新修改了Main方法

```c#
private static bool isDone = false;
delegate int BinaryOp(int x,int y);
static int Add(int x, int y)
{
	Console.WriteLine("Add() invoked on thead {0}",Thread.CurrentThread.ManagedThreadId);
	// 模拟添加耗时 5秒
	Thread.Sleep(5000);
	return x + y;
}
static void AddComplete(IAsyncResult itfAR)
{
	Console.WriteLine("AddComplete() invoked on thread {0}.",Thread.CurrentThread.ManagedThreadId);
	Console.WriteLine("Your addition is complete");
	isDone = true;
}

static void Main(string[] args)
{

	// 输出正在执行中的线程
	Console.WriteLine("Main() invoked on thread {0}",Thread.CurrentThread.ManagedThreadId);

	// 在次线程中调用Add
	BinaryOp b = new BinaryOp(Add);

	// 一旦下一跳语句被处理，调用线程在BeginInvoke()完成之前就被阻塞了
	IAsyncResult iftAR = b.BeginInvoke(10, 10, new AsyncCallback(AddComplete), null);

	// 这里可以做其他事

	// 直到Add()方法完成，消息才会显示出来
	while (!isDone)
	{
		Thread.Sleep(1000);
		Console.WriteLine("Doing more work in Main()");
	}
	
	Console.ReadLine();
}
```

当Add()执行完成的时候，AsyncCallback委托将调用静态的AddComplete()方法。如果运行上面的程序，可以确定次线程是回调AddComplete()的线程

```
Main() invoked on thread 8.
Add() more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
AddComplete() invoked on thread 11.
Your addition is complete
```

### AsyncResult 类的作用

当前，AddComplete()方法并没有输出操作(两个数的和)的实际结果。这样做的原因是：AsyncCallback委托的目标(即本例的AddComplete())无法访问在Main()中创建的BinaryOp委托。因此，不能在AddComplete()中调用EndInvoke()。

虽然可以把BinaryOp定义成静态的，以便两个方法都能访问相同的对象，但更好的解决方案是采用IAsncResult输入参数。

```c#
static void AddComplete(IAsyncResult itfAR)
{
	Console.WriteLine("AddComplete() invoked on thread {0}.",Thread.CurrentThread.ManagedThreadId);
	Console.WriteLine("Your addition is complete");

	// 现在得到结果
	AsyncResult ar = (AsyncResult)itfAR;
	BinaryOp b = (BinaryOp)ar.AsyncDelegate;
	Console.WriteLine("10 + 10 is {0}", b.EndInvoke(itfAR));
	isDone = true;
}
```

### 传递和接收自定义状态数据

异步委托的最后一个需要关注的地方是BeginInvoke()方法的最后一个参数(默认为null)。该参数允许从主线程传递额外的状态信息给回调方法。因为这个参数类型是System.Object，所以而已传入任何回调方法希望的类型数据。

```c#
...
IAsyncResult iftAR = b.BeginInvoke(10, 10, 
	new AsyncCallback(AddComplete), 
	"Main() thanks you for adding these numbers.");
...
```

为了在AddComplete()中获取数据，使用传入IAsyncResult参数的AsyncState属性。

```c#
static void AddComplete(IAsyncResult itfAR)
{
...
	// 获取消息对象，并转换成string
	string msg = (string)itfAR.AsyncState;
	Console.WriteLine(msg);
	isDone = true;
}
```

下面显示了当前程序的输出结果

```
Main() invoked on thread 8.
Add() more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
Doing more work in Main()!
AddComplete() invoked on thread 11.
Your addition is complete
10 + 10 is 20
Main() thanks you for adding these numbers.
Doing more work in Main()!
```

### System.Threading命名空间

在.NET平台下，System.Threading命名空间提供了许多类型用来构建多线程应用程序。除了和特殊的CLR线程进行交互的类型外，这个命名空间还定义了许多其他类型，这些类型允许访问CLR维护的线程池、一个简单(无界面的)Timer类，以及大量用来同步访问共享资源的类型。

类型					|作用
Interlocked				|为被多个线程共享访问的类型提供原子操作
Monitor					|使用锁定和等待信号来同步线程对象。C#的lock关键字在后台使用的就是Monitor对象
Mutex					|互斥体，可用于应用程序域边界之间的同步
ParameterizedThreadStart|委托，它允许线程调用包含任意多个参数的方法
Semaphore				|用于限制对一个资源或一类资源的并发访问的线程数量
Thread					|代表CLR中执行的线程。使用这个类型，能够在初始的应用程序域中创建额外的线程
ThreadPool				|用于和一个进程中的(由CLR维护的)线程池交互
ThreadPriority			|代表了线程调度的优先级别(Highest、Normal等)
ThreadStart				|该委托用于定义一个线程所调用的方法。和ParameterizedThreadStart委托不同，这个方法的目标必须符合一种固定的原型
ThreadState				|代表线程处于的状态(Running、Aborted等)
Timer					|提供以指定的时间间隔执行方法的机制
TimerCallback			|该委托类型应与Timer类型一起使用

### System.Threading.Thread类

System.Threading命名空间中最基本的类型是Thread。它是一个面向对象的包装器，包装特定应用程序域中的某个执行单元。Thread类型中定义了许多方法，使用这些方法能够在当前应用程序域中创建、挂起、停止和销毁线程。

静态成员					|作用
CurrentContext				|只读属性，返回当前线程的上下文
CurrentThread				|只读属性，返回当前线程的引用
GetDomain()和GetDomainID()	|返回当前应用程序域的引用或当前线程正在运行的域的ID
Sleep()						|将当前线程挂起指定的时间

Thread类也支持部分实例级的成员

实例级成员			|作用
IsAlive				|返回Boolean值，指示线程是否开始了
IsBackground		|获取或设置一个值，指示线程是否为后台线程
Name				|给线程指定的友好的名字
Priority			|获取或设置线程的调度优先级。它是ThreadPriority枚举中的值之一
ThreadState			|获取当前线程的状态。它是ThreadState枚举中的值之一
About()				|通知CLR尽快终止本线程
Interrupt()			|中断当前线程，唤醒处于等待中的线程
Join()				|阻塞调用线程，直到某个(调用Join()的)线程终止为止
Resume()			|使已挂起的线程继续执行
Start()				|通知CLR尽快执行本线程
Suspend()			|挂起当前线程，如果线程已挂起，则不起作用

### 获得当前线程的统计信息

回想一下，可执行程序集的入口点(即Main()方法)是运行在主线程上的。为举例说明Thread类型的基本用法，假定有一个名为ThreadStats的控制台程序。静态的Thread.CurrentThread属性找到表示当前正在执行线程的Thread对象。一旦获得当前线程，便能输出各种统计信息

```c#
static void Main(string[] args)
{

	// 获取当前线程的名字
	Thread primaryThread = Thread.CurrentThread;
	primaryThread.Name = "ThePrimaryThread";

	// 显示承载的应用程序域和上下文的详细信息
	Console.WriteLine("Name of current AppDomain:{0}",Thread.GetDomain().FriendlyName);

	Console.ReadLine();
}
```






