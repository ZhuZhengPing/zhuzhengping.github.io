---
layout: post
title:  "多线程应用程序和异步委托"
date:   2016-07-24 16:32:18 +0800
categories: .net
tags: .net 多线程 委托
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
```

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
	Console.WriteLine("ID of current Context: {0}",Thread.CurrentContext.ContextID);

	// 输出线程的一些信息
	Console.WriteLine("Thread Name: {0}",primaryThread.Name);
	Console.WriteLine("Has thread started?: {0}",primaryThread.IsAlive);
	Console.WriteLine("Priority Level: {0}",primaryThread.Priority);
	Console.WriteLine("Thread State: {0}",primaryThread.ThreadState);

	Console.ReadLine();
}
```

下面显示了这个程序的输出结果：

```
Name of current AppDomain:CTest.vshost.exe
ID of current Context: 0
Thread Name: ThePrimaryThread
Has thread started?: True
Priority Level: Normal
Thread State: Running
```

### Name 属性

虽然上述代码或多或少有自描述的性质，但是请注意Thread类支持Name属性。如果没有设置这个值的话，Name将返回一个空的字符串。然而，一旦为一个给定的线程对象指定一个友好的字符串名字，在调试的时候就简单多了。如果使用Visual Studio ,可以在调试的时候访问Threads窗口(在菜单上选择Debug->Windows->Threads)。

### Priority属性

接下来，注意Thread类型定义了一个名为Priority的属性，默认情况下，所有线程的优先级都处于Normal级别。但是，在线程生命周期的任何时候，都可以使用ThreadPriority属性修改线程的优先级

```c#
public enum ThreadPriority
{
	Lowest,
	BelowNormal,
	Normal, // 默认值
	AboveNormal,
	Highest
}
```

如果给线程的优先级指定一个非默认值(默认值为ThreadPriority.Normal)，应当知道这并不能控制线程调度器切换线程的过程。实际上，一个线程的优先级仅仅是把线程活动的重要程度提供给CLR。因此，一个带有ThreadPriority.Highest优先级的线程并不一定保证能得到最高的优先级。

此外，如果线程调度器被某个人物(比如同步对象、切换线程或线程移动)抢占了，那么线程的优先级别很有可能因此会被修改。这个时候，CLR将会读取这些值，并指示线程调度器如何最好地分配时间片。总地来说，有着相同优先调度级别的线程应当得到相同数量的时间来执行任务。

### 以编程方式创建次线程

当希望以编程方式创建次线程以分担一些任务时，可以遵从下面预订的步骤。

>1. 创建一个方法作为新线程的入口点
>2. 创建一个 ParameterizedThreadStart(或者 ThreadStart)委托，并把在上一步所定义方法的地址传给委托的构造函数。
>3. 创建一个 Thread 对象，并把 ParameterizedThreadStart 或 ThreadStart作为构造函数的参数。
>4. 建立任意初始化线程的特性(名称、优先级等)。
>5. 调用Thread.Start()方法。在第2个步骤中建立委托所指向的方法将在线程中尽快开始执行。

### 使用 ThreadStart 委托

举例说明构建多线程程序的过程，我们创建一个控制台程序，它能够让用户选择是采用单线程还是两个分离的线程来执行任务。

```c#
public class Printer
{
	public void PrintNumbers()
	{
		// 显示 Thread 信息
		Console.WriteLine("-> {0} is executing PrintNumbers()",Thread.CurrentThread.Name);

		// 输出数字
		Console.Write("Your numbers: ");
		for (int i = 0; i < 10; i++)
		{
			Console.Write("{0} ,",i);
			Thread.Sleep(2000);
		}
		Console.WriteLine();
	}
}
```

再 Main() 方法中，首先要提示用户，让他来确定是用一个还是两个线程来执行任务。如果用户需要一个单线程，那么在主线程上调用 PrintNumbers() 方法就可以了。但是，如果用户指定需要两个线程，那么创建一个指向 PrintNumbers()方法的 ThreadStart 委托，接着把这个委托对象传给一个新创建的 Thread 对象的构造函数，并且调用这个 Thread 对象的 Start() 方法以通知 CLR:线程已经准备好执行了。下面是完整的 Main()方法

```c#
static void Main(string[] args)
{

	Console.Write("Do you want [1] or [2] threads? ");
	string threadCount = Console.ReadLine();

	// 命名当前线程
	Thread primaryThread = Thread.CurrentThread;
	primaryThread.Name = "Primary";

	// 显示线程的信息
	Console.WriteLine("-> {0} is executing Main()",Thread.CurrentThread.Name);

	// 创建执行任务类
	Printer p = new Printer();

	switch (threadCount)
	{
		case "2":
			// 设置线程
			Thread backgroundThread = new Thread(new ThreadStart(p.PrintNumbers));
			backgroundThread.Name = "Secondary";
			backgroundThread.Start();
			break;
		case "1":
			p.PrintNumbers();
			break;
		default:
			Console.WriteLine("I don't know what you want ...you get 1 thread.");
			goto case "1";
	}

	// 做其他一些工作
	MessageBox.Show("I'm busy!", "Wor on main thread...");

	Console.ReadLine();
}

public class Printer
{
	public void PrintNumbers()
	{
		// 显示 Thread 信息
		Console.WriteLine("-> {0} is executing PrintNumbers()",Thread.CurrentThread.Name);

		// 输出数字
		Console.Write("Your numbers: ");
		for (int i = 0; i < 10; i++)
		{
			Console.Write("{0} ,",i);
			Thread.Sleep(2000);
		}
		Console.WriteLine();
	}
}
```

如果以单线程运行这个程序，将发现知道全部数字输出到控制台上后，消息(对话框)才被显示出来。由于在每个数字输出来后都需要暂停大约两秒钟，所以这是很不好的用户体验。然而，如果选择两个线程，消息对话框就会立刻显示出来。

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f67lsjex3qj30iw08vq3z.jpg" style="width:100%" />

### 使用 ParameterizedThreadStart 委托

ThreadStart 委托不仅仅指向无返回值、无参数的方法。虽然这能满足大多数情况的要求，但是，如果想把数据传递给在次线程上执行的方法，则需要使用 ParameterizedThreadStart 委托类型。

```c#
class AddParams
{
	public int a, b;
	public AddParams(int numb1, int numb2)
	{
		a = numb1;
		b = numb2;
	}
}
```

接下来，在 Program 类中创建一个静态方法，这个方法使用 AddParams 类型作为参数，用于输出每次相加的结果：

```c#
static void Add(object data)
{
	if (data is AddParams)
	{
		Console.WriteLine("ID of thread in Add(): {0}",Thread.CurrentThread.ManagedThreadId);

		AddParams ap = (AddParams)data;
		Console.WriteLine("{0} + {1} is {2}",ap.a,ap.b,ap.a+ap.b);
	}
}
```

Main() 中的代码直截了当，使用 ParameterizedThreadStart比使用 ThreadStart 更加简单：

```c#
static void Main(string[] args)
{

	Console.WriteLine("ID of thread in Main(): {0}",Thread.CurrentThread.ManagedThreadId);

	// 建立 AddParams 对象，将其传给次线程
	AddParams ap = new AddParams(10, 10);
	Thread t = new Thread(new ParameterizedThreadStart(Add));
	t.Start(ap);

	// 强制等待以让其他线程结束
	Thread.Sleep(5);

	Console.ReadLine();
}
```

运行该程序，输出结果如下

```
ID of thread in Main(): 9
ID of thread in Main(): 10
10 + 10 is 20
```

### AutoResetEvent 类

在学习异步委托时，我们使用了一个简单的 bool 变量作为开关，但这并不是推荐的解决方案，因为两个线程都能访问相同的数据点，并且这将导致数据损坏。一个较安全但不可取的方法是调用 Thread.Sleep(),等待一段固定的时间。

一个简单、线程安全的方法是使用 AutoResetEvent 类，强制线程等待，直到其他线程结束。

```c#
private static AutoResetEvent waitHandle = new AutoResetEvent(false);
static void Main(string[] args)
{

	Console.WriteLine("ID of thread in Main(): {0}",Thread.CurrentThread.ManagedThreadId);
	AddParams ap = new AddParams(10, 10);
	Thread t = new Thread(new ParameterizedThreadStart(Add));
	t.Start(ap);

	// 等待，直到收到通知
	waitHandle.WaitOne();
	Console.WriteLine("Other thread is done!");

	Console.ReadLine();
}
```

当其他线程完成任务时，将调用同一个 AutoResetEvent 类型实例的 Set() 方法：

```c#
static void Add(object data)
{
	if (data is AddParams)
	{
		Console.WriteLine("ID of thread in Add(): {0}",Thread.CurrentThread.ManagedThreadId);

		AddParams ap = (AddParams)data;
		Console.WriteLine("{0} + {1} is {2}",ap.a,ap.b,ap.a+ap.b);

		// 通知其他线程，该线程已结束
		waitHandle.Set();
	}
}
```

### 前台线程和后台线程

了解如何使用 System.Threading 命名空间创建新的线程之后，下面来正式看一看前台线程和后台线程的区别。

>* 前台线程能阻止应用程序的终结。一直到所有前台线程终止后，CLR 才能关闭应用程序(即卸载承载的应用程序域)
>* 后台线程被CLR认为是线程执行中可作出牺牲的途径，即在任何时候都可能被忽略。因此，如果所有的前台线程终止，当应用程序域卸载时，所有的后台线程也会被自动终止。

值得重点注意的是，前台线程和后台线程并不等于同于主线程和工作者线程。默认情况下，所用通过 Thread.Start() 方法创建的线程都自动成为前台线程。这意味着，直到所有的线程本身单元的工作都执行完成了，应用程序域才会卸载。

```c#
static void Main(string[] args)
{

	Printer p = new Printer();
	Thread bgroundThread = new Thread(new ThreadStart(p.PrintNumbers));

	// 这是后台线程
	bgroundThread.IsBackground = true;
	bgroundThread.Start();
}
```

### 并发问题

在构建多线程应用程序时，需要确保任何共享数据都处于被保护状态，以防止多个线程修改它的值。由于一个应用程序域中的所有线程都能够并发访问共享数据，由于线程调度器会随机挂起线程，所以如果线程 A 在完成之间被挂起了，线程 B 读到的就是一个不稳定的数据。

```c#
public class Printer
{
	public void PrintNumbers()
	{
...
		for (int i = 0; i < 10; i++)
		{
			// 使线程休眠数秒
			Random r = new Random();
			Thread.Sleep(1000*r.Next(5));
			Console.Write("{0} ,",i);
		}
		Console.WriteLine();
	}
}
```

Main() 方法负责创建一个拥有10个 Thread 对象的数组，并且每一个对象都调用 Printer 对象的同一个实例：

```c#
static void Main(string[] args)
{

	Printer p = new Printer();

	// 使 10个线程全部指向同一对象的同一方法
	Thread[] threads = new Thread[10];
	for (int i = 0; i < 10; i++)
	{
		threads[i] = new Thread(new ThreadStart(p.PrintNumbers));
		threads[i].Name = string.Format("Worker thread #{0}", i);
	}

	// 现在开始每一个线程
	foreach (Thread t in threads)
	{
		t.Start();
	}
	Console.ReadLine();
}
```

再看运行结果之前，我们归纳下问题：在应用程序域中的主线程产生了10个工作线程，每个工作线程执行同一个 Printer 实例的 PrintNumbers() 方法。

<img src="" style="width:100%" />









