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

在 Parallel.For()的方法体中，把索引、任务标识符和线程标识符写入控制台中，从输出可以看出，顺序是打乱的。如果再次运行这个程序，可以看到不同的结果。

```
0,task: 1, thread: 1
2,task: 2, thread: 3
4,task: 3, thread: 4
6,task: 4, thread: 5
8,task: 5, thread: 6
5,task: 3, thread: 4
7,task: 4, thread: 5
9,task: 5, thread: 6
3,task: 2, thread: 3
1,task: 1, thread: 1
Is completed: True
```

在前面的例子中，使用了.NET 4.5中新增的 Thread.Sleep 方法，而不是 Task.Delay 方法。Task.Delay 是一个异步方法，用于释放线程供其他任务使用。下面的代码使用 await 关键字，所以一旦完成延迟，就立即开始调用这些代码。延迟后执行的代码和延迟前执行的代码可以运行在不同的线程中。

```c#
ParallelLoopResult result = Parallel.For(0, 10, async i =>
{
	Console.WriteLine("{0}, task: {1}, thread: {2}", i, Task.CurrentId, Thread.CurrentThread.ManagedThreadId);

	await Task.Delay(1000);
	Console.WriteLine("{0}, task: {1}, thread: {2}", i, Task.CurrentId, Thread.CurrentThread.ManagedThreadId);
});
Console.WriteLine("is completed: {0}", result.IsCompleted);
```

在输出中可以看到，调用 Thread.Delay 方法后，线程发生了变化。例如，在循环迭代2 在延迟前的线程 ID 为3，在延迟后的线程 ID 为4.在输出中还可以看到，任务不再存在，只有线程留下了，而且这里重用了前面的线程。另外一个重要的方面是，Parallel 类的 For 方法并没有等待延迟，而是直接完成。Parallel 类只等待它创建的任务，而不等待其他后台活动。在延迟后，也有可能完全看不到方法的输出，出现这种情况的原因是主线程结束，所有的后台线程被终止

```
0,task: 1, thread: 1
2,task: 2, thread: 3
4,task: 3, thread: 4
6,task: 4, thread: 5
8,task: 5, thread: 6
5,task: 3, thread: 4
7,task: 4, thread: 5
9,task: 5, thread: 6
3,task: 2, thread: 3
1,task: 1, thread: 1
Is completed: True
5,task: , thread: 6
6,task: , thread: 6
7,task: , thread: 6
3,task: , thread: 6
8,task: , thread: 6
4,task: , thread: 6
0,task: , thread: 6
9,task: , thread: 6
2,task: , thread: 6
1,task: , thread: 6
```

也可以提前中断 Parallel.For()方法，而不是完成所有迭代。For()方法的一个重载版本接受第3个 Action<int,ParallelLoopState>类型的参数。使用这些参数定义一个方法，就可以调用 ParallelLoopState 和 Break()或Stop()方法，以影响循环的结果。

```c#
ParallelLoopResult result = Parallel.For(10,40,async(int i,ParallelLoopState pls)=>
{
	Console.WriteLine("i: {0} task {1}",i,Task.CurrentId);
	await Task.Delay(1000);
	if (i > 15)
		pls.Break();
});

Console.WriteLine("Is completed: {0}",result.IsCompleted);
Console.WriteLine("lowest break iteration: {0}",result.LowestBreakIteration);
```

应用程序的运行说明，迭代的值大于15时中断，但其他任务可以同时运行，有其他值的任务也可以运行。利用 LowestBreakIteration 属性，可以忽略其他任务的结果。

```
10 task 1
24 task 3
31 task 4
38 task 5
17 task 2
11 task 1
12 task 1
13 task 1
14 task 1
15 task 1
16 task 1
Is completed: False
lowest break iteration: 16
```

Parallel.For()方法可能使用几个线程来执行循环。如果需要对每个线程进行初始化，就可以使用 Parallel.For<TLocal>()方法。除了 from 和 to 对应的值之外，For()方法的泛型版本还接受3个委托参数。第一个参数的类型是 Func<TLocal>，因为这里的例子对于 TLocal 使用字符串，所以该方法需要定义为 Func<string>，即返回 string 的方法。这个方法仅对用于执行迭代的每个线程调用一次。

第二个委托参数为循环体定义了委托。在示例中，该参数的类型是 Func<int,ParallelLoopState,string,string>。其中第一个参数是循环迭代，第二个参数 ParallelLoopState 允许停止循环。循环方法通过第三个参数接收返回的值，循环体方法还需要返回一个值，其类型是用泛型 for 参数定义的。

For()方法的最后一个参数指定一个委托 Action<TLocal>，在该示例中，接收一个字符串。这个方法仅对于每个线程调用一次，这是一个线程退出方法。

```c#
Parallel.For<string>(0, 20, () =>
{
	// invoked once for each thread
	Console.WriteLine("init thread {0}, task {1}", Thread.CurrentThread.ManagedThreadId, Task.CurrentId);
	return String.Format("t{0}", Thread.CurrentThread.ManagedThreadId);
}, (i, pls, str1) =>
{
	// invoked for each member
	Console.WriteLine("body i {0} str1 {1} thread {2} task {3}", i, str1, Thread.CurrentThread.ManagedThreadId, Task.CurrentId);
	Thread.Sleep(10);
	return String.Format("i {0}", i);
}, (str1) => 
{
	// final action on each thread
	Console.WriteLine("finally {0}",str1);
});
```

运行一次这个程序的结果如下：

```
body i 10 str1 t11 thread 11 task 3
init thread 12, task 4
body i 15 str1 t12 thread 12 task 4
init thread 13, task 5
body i 3 str1 t13 thread 13 task 5
body i 6 str1 i 5 thread 10 task 2
body i 2 str1 i 1 thread 9 task 1
body i 16 str1 i 15 thread 12 task 4
body i 11 str1 i 10 thread 11 task 3
body i 4 str1 i 3 thread 13 task 5
body i 8 str1 i 4 thread 13 task 5
body i 17 str1 i 16 thread 12 task 4
body i 12 str1 i 11 thread 11 task 3
body i 7 str1 i 6 thread 10 task 2
body i 13 str1 i 2 thread 9 task 1
body i 14 str1 i 13 thread 9 task 1
body i 18 str1 i 12 thread 11 task 3
body i 9 str1 i 8 thread 13 task 5
finally i 17
finally i 7
body i 19 str1 i 18 thread 11 task 3
finally i 14
finally i 9
finally i 19
```

### 使用 Parallel.ForEach()方法循环

Parallel.ForEach()方法遍历实现了 IEnumerable 的集合，其方式类似于 foreach 语句，但以异步方式遍历。这里也没有确定遍历顺序。

```c#
string[] data = { "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve" };
ParallelLoopResult result = Parallel.ForEach<string>(data, s => 
{
	Console.WriteLine(s);
});
```

如果需要中断循环，可以使用 ForEach()方法的重载版本和 ParallelLoopState 参数。其使用方法与前面的 For()方法相同。ForEach()方法的一个重载版本也可以用于访问索引器，从而获得迭代次数。

```c#
Parallel.ForEach<string>(data,(s,pls,l)=>{
	Console.WriteLine("{0} {1}",s,l);
});
```

如果多个任务应用并行运行，就可以使用 Parallel.Invoke()方法，它提供了任务并行性模式。Parallel.Invoke()方法可以传递一个 Action 委托数组，在其中指定运行的方法。

```c#
static void ParallelInvoke()
{
	Parallel.Invoke(Foo,Bar);
}

static void Foo()
{
	Console.WriteLine("foo");
}

static void Bar()
{
	Console.WriteLine("bar");
}
```

### 任务

为了更好地控制并行动作，可以使用 System.Threading.Task 命名空间中的 Task 类。任务表示应该完成的某个工作单元，这个工作单元可以在单独的线程中运行，也可以以同步的方式启动一个任务，需要等待主调线程。使用任务不仅可以获得一个抽象层，还可以对底层线程进行很多控制。

在安排需要完成的工作时，任务提供了非常大的灵活性。例如，可以定义连续的工作(在一个任务完成后该执行什么工作).这可以根据任务成功与否来区别。另外，还可以在层次结构中安排任务。例如，父任务可以创建新的子任务。这可以创建一种依赖关系，这样，取消父任务，也会取消其子任务。

要启动任务，可以使用 TaskFactory 类或 Task 类的构造函数和 Start()方法。Task类的构造函数在创建任务上很灵活。


在启动任务时，会创建 Task 类的一个实例，利用 Action 或 `Action<object>`委托(不带参数或带一个 object 参数),可以指定运行的代码。下面定义的方法带一个参数。在实现代码中，把任务的 ID 和线程的 ID 写入控制台中，并且如果线程来自一个线程池，或者线程是一个后台线程，也要写入相关的信息。把多条消息写入控制台的操作是使用 lock 关键字和 taskMethodLock 同步对象进行同步的。这样，就可以并行调用 TaskMethod,而且多次写入控制台的操作也不会彼此交叉。否则，title可能由一个任务写入，而线程信息由另一个任务写入

```c#
static object taskMethodLock = new object();
static void TaskMethod(object title)
{
	lock (taskMethodLock)
	{
		Console.WriteLine(title);
		Console.WriteLine("Task id: {0}, thread: {1}", Task.CurrentId == null ? "no task" : Task.CurrentId.ToString(), Thread.CurrentThread.IsThreadPoolThread);
		Console.WriteLine("is pooled thread: {0}",Thread.CurrentThread.IsThreadPoolThread);
	}
}
```

创建任务的第一种方式是使用实例化的 TaskFactory 类，把 TaskMethod 方法传递给 StartNew 方法，就会立即启动任务。第二种方式是使用 Task 类的静态属性 Factory 来访问 TaskFactory,以及调用 StartNew()方法。第三种方式是使用 Task 类的构造函数。实例化 Task 对象时，任务不会立即执行，而是指定 Created 状态。接着调用 Task 类的 Start()方法。第四种方式是 .NET 4.5新增的，即调用 Task 类的 Run 方法，立即启动任务。

```c#
static void TasksUsingThreadPool()
{
	var tf = new TaskFactory();
	Task t1 = tf.StartNew(TaskMethod, "using a task factory");

	Task t2 = Task.Factory.StartNew(TaskMethod, "factory via a task");

	Task t3 = new Task(TaskMethod, "using a task constructor and Start");
	t3.Start();

	Task t4 = Task.Run(() => TaskMethod("using the Run method"));
}
```

这些版本返回的输出如下所示。它们都创建一个新任务，并使用线程池中的一个线程

```
using a task factory
Task id: 1, thread: True
is pooled thread: True

factory via a task
Task id: 2, thread: True
is pooled thread: True

using a task constructor and Start
Task id: 3, thread: True
is pooled thread: True

using the Run method
Task id: 4, thread: True
is pooled thread: True
```

使用 Task 构造函数和 TaskFactory 的 StartNew 方法时，可以传递 TaskCreationOptions 枚举中的值。利用这个创建选项，可以改变任务的行为

任务不一定要使用线程池中的线程，也可以使用其他线程。任务也可以同步，以相同的线程作为主调线程。下面的代码段使用了 Task 类的 RunSynchronously 方法

```c#
private static void RunSynchronousTask()
{
	TaskMethod("just the main thread");
	var t1 = new Task(TaskMethod, "run sync");
	t1.RunSynchronously();
}
```

这里 TaskMethod 方法首先在主线程上直接调用，然后在新创建的 Task 上调用。主线程是一个前台线程，没有任务 ID，也不是线程池中的线程。调用 RunSynchronously 方法时，会使用相同的线程作为主调线程，但是如果以前没有创建任务，就会创建一个任务

```
just the main thread
Task id: no task, thread: False
is pooled thread: False

run sync
Task id: 1, thread: False
is pooled thread: False
```

如果任务的代码应该长时间运行，就应该使用 TaskCreationOptions.LongRunning 告诉任务调度器创建一个新线程，而不是使用线程池中的线程。此时线程可以不由线程池管理。当线程来自线程池时，任务调度器可以决定等待已经运行的任务完成，然后使用这个线程，而不是在线程池中创建一个新线程。对于长时间运行的线程，任务调度器会立即知道等待它们完成是不正确的。下面的代码创建了一个长时间运行的任务

```c#
private static void LongRunningTask()
{
	var t1 = new Task(TaskMethod, "long running", TaskCreationOptions.LongRunning);
	t1.Start();
}
```

实际上，使用 TaskCreationOptions.LongRunning 选项时，不会使用线程池中的线程，而是会创建一个新线程

### Future-任务的结果

任务结束时，它可以把一些有用的状态信息写到共享对象中。这个共享对象必须是线程安全的。另一个选项是使用返回某个任务的结果。这种任务也叫 future，因为它在将返回一个结果。任务返回结果的方法可以声明为任何返回类型。下面的示例方法 TaskWithResult()利用一个元组返回两个 int 值。该方法的输入可以是 void 或 object 类型，如下所示

```c#
static Tuple<int, int> TaskWithResult(object division)
{
	Tuple<int, int> div = (Tuple<int, int>)division;
	int result = div.Item1 / div.Item2;
	int reminder = div.Item1 % div.Item2;
	Console.WriteLine("task creates a result...");
	return Tuple.Create<int, int>(result, reminder);
}
```

定义一个调用 TaskWithResult()方法的任务时，要使用泛型类 Task<TResult>。泛型参数定义了返回类型。通过构造函数，把这个方法传递给 Func 委托，第二个参数定义了输入值。因为这个任务在 object 参数中需要输入两个值，所以还创建了一个元组。接着启动该任务。

```c#
var t1 = new Task<Tuple<int, int>>(TaskWithResult, Tuple.Create<int, int>(8, 3));
t1.Start();
Console.WriteLine(t1.Result);
t1.Wait();
Console.WriteLine("result from task: {0} {1}",t1.Result.Item1,t1.Result.Item2);
```

### 连续的任务

通过任务，可以指定在任务完成后，开始运行另一个特定的任务，任务处理程序或者不带参数，或者带一个参数，而连续处理程序有一个 Task 类型的参数，这里可以访问起始任务相关的信息

```c#
static void DoOnFirst()
{
	Console.WriteLine("doing some task {0}",Task.CurrentId);
	Thread.Sleep(3000);
}

static void DoOnSecond(Task t)
{
	Console.WriteLine("task {0} finished",t.Id);
	Console.WriteLine("this task id {0}",Task.CurrentId);
	Console.WriteLine("do some cleanup");
	Thread.Sleep(3000);
}
```

连续任务通过在任务上调用 ContinueWith()方法来定义。也可以使用 TaskFactory 类来定义。t1.OnContinueWith(DoOnSecond)方法表示，调用 DoOnSecond()方法的新任务在任务 t1 结束时立即启动。在一个任务结束时，可以启动多个任务，连续任务也可以有另一个连续任务，如下面的例子所示

```c#
Task t1 = new Task(DoOnFirst);
Task t2 = t1.ContinueWith(DoOnSecond);
Task t3 = t1.ContinueWith(DoOnSecond);
Task t4 = t2.ContinueWith(DoOnSecond);
```

无论前一个任务是如何结束的，前面连续任务总是在前一个任务结束时启动。使用 TaskContinuationOptions 枚举中的值，可以指定，连续任务只有在起始任务成功(或失败)结束时启动。一些可能的值是 OnlyOnFaulted、NotOnFaulted、OnlyOnCanceled、NotOnCanceled 和 OnlyOnRanToCompletion。

```c#
Task t5 = t1.ContinueWith(DoOnError, TaskContinuationOptions.OnlyOnFaulted);
```

利用任务连续性，可以在一个任务结束后启动另一个任务。任务也可以构成一个层次结构。一个任务启动一个新任务时，就启动了一个父/子层次结构。

下面的代码段在父任务内部新建一个任务对象并启动任务。创建子任务的代码与创建父任务的代码相同，唯一的区别是这个任务从另一个任务内部创建。

```c#
static void ParentAndChild()
{
	var parent = new Task(ParentTask);
	parent.Start();
	Thread.Sleep(2000);
	Console.WriteLine(parent.Status);
	Thread.Sleep(4000);
	Console.WriteLine(parent.Status);
}

static void ParentTask()
{
	Console.WriteLine("task id {0}",Task.CurrentId);
	var child = new Task(ChildTask);
	child.Start();
	Thread.Sleep(1000);
	Console.WriteLine("parent started child");
}

static void ChildTask()
{
	Console.WriteLine("child");
	Thread.Sleep(5000);
	Console.WriteLine("child finished");
}
```

### 取消任务

.NET 4.5 包含一个取消架构，允许取消长时间运行任务。每个阻塞调用都应支持这种机制。取消方法接收一个 CancellationToken 参数。这个类定义了 IsCancellationRequested 属性，其中长时间运行的操作可以检查它是否应终止。长时间运行的操作检查取消的其他方式有：取消标记时，使用标记的 WaitHandle 属性，或者使用 Register()方法。Register()方法接受 Action 和 ICancelableOperation 类型的参数。Action 委托应用的方法在取消标记时调用。这类似于 ICancelableOperation 类似的参数。在取消标记时调用 Action 委托引用的方法。

Parallel 类提供了 For()方法的重载版本，在重载版本中，可以传递 ParallelOptions 类型的参数。使用 ParallelOptions 类型，可以传递一个 CancellationToken 参数。CancellationToken 参数通过创建 CancellationTokenSource 来生成。由于 CancellationTokenSource 实现了 ICancelableOperation 接口，因此可以用 CancellationToken 注册，并允许使用 Cancel()方法取消操作。本例没有直接调用 Cancel 方法，而是使用了 .NET 4.5 中的一个新方法 CancelAfter,在500毫秒后取消标记。

在 For()循环的实现代码，Parallel 类验证 CancellationToken 的结果，并取消操作。一旦取消操作，For()方法就抛出一个 OperationCanceledException 类型的异常，这是本例捕获的异常。使用 CancellationToken 可以注册取消操作时的信息。为此，需要调用 Register()方法，并传递一个仔取消操作时调用的委托

```c#
var cts = new CancellationTokenSource();
cts.Token.Register(() => Console.WriteLine("*** token canceled"));

// send a cancel after 500 ms
cts.CancelAfter(500);

try
{
	ParallelLoopResult result = Parallel.For(0, 100, new ParallelOptions()
	{
		CancellationToken = cts.Token,
	}, x =>
	{
		Console.WriteLine("loop {0} started", x);
		int sum = 0;
		for (int i = 0; i < 100; i++)
		{
			Thread.Sleep(2);
			sum += i;
		}
		Console.WriteLine("loop {0} finished", x);
	});
}
catch (OperationCanceledException ex)
{
	Console.WriteLine(ex.Message);
}
```

运行应用程序，会得到如下结果，第0、25、50、75和1次迭代都启动了。这在一个有4个内核 CPU 的系统上运行。通过取消操作，所有其他迭代操作都在启动之前就取消了。

```
loop 0 started
loop 25 started
loop 50 started
loop 75 started
loop 1 started
*** token canceled
loop 0 finished
loop 50 finished
loop 75 finished
loop 1 finished
loop 25 finished
已取消该操作。
```

同样的取消模式也可以用于任务。首先，新建一个 CancellationTokenSource。如果仅需要取消一个标记，就可以访问 Task.Factory.CancellationToken，以使用默认的取消标记。接着，与前面的代码类似，在500毫秒后取消任务。在循环中执行主要工作的任务通过 TaskFactory 对象接受取消标记。在构造函数中，把取消标记赋予 TaskFactory。

```c#
static void CancelTask()
{
	var cts = new CancellationTokenSource();
	cts.Token.Register(() => Console.WriteLine("*** task cancelled"));

	// send a cancel after 500 ms
	cts.CancelAfter(500);

	Task t1 = Task.Run(() => 
	{
		Console.WriteLine("in task");
		for (int i = 0; i < 20; i++)
		{
			Thread.Sleep(100);
			CancellationToken token = cts.Token;
			if (token.IsCancellationRequested)
			{
				Console.WriteLine("cancelling was requested, cancelling from within the task");
				token.ThrowIfCancellationRequested();
				break;
			}
			Console.WriteLine("in loop");
		}
		Console.WriteLine("task finished without cancellation");
	},cts.Token);

	try
	{
		t1.Wait();
	}
	catch (AggregateException ex)
	{
		Console.WriteLine("exception: {0}, {1}",ex.GetType().Name,ex.Message);
		foreach (var innerException in ex.InnerExceptions)
		{
			Console.WriteLine("inner excepion: {0}, {1}",ex.InnerException.GetType().Name,ex.InnerException.Message);
		}
	}
}
```

运行应用程序，可以看到任务启动了，运行了几个循环，并获得了取消请求。之后取消任务，并抛出 TaskCanceledException 异常，它是从方法调用 ThrowIfCancellationRequested()中启动的。调用者等等任务时，会捕获 AggregateException 异常，它包含内部异常 TaskCanceledException。例如，如果在一个也被取消的任务中运行 Parallel.For()方法，这就可以用于取消的层次结构。任务的最终状态是 Canceled。

```
in task
in loop
in loop
in loop
in loop
*** task cancelled
cancelling was requested, cancelling from within the task
exception: AggregateException, 发生一个或多个错误。
inner excepion: TaskCanceledException, 已取消一个任务。
```

### 线程池

创建线程需要时间。如果有不同的短任务要完成，就可以实现创建许多线程，在完成这些任务时发出请求。

不需要自己创建一个这样的列表。该列表由 ThreadPool 类托管。这个类会在需要时增减池中线程的线程数，直到最大的线程数。池中的最大线程数是可配置的。在四核CPU中，默认设置为 1023 个工作线程和 1000个 I/O 线程。也可以指定在创建线程池应立即启动的最小线程数，以及线程池中可用的最大线程数。如果有更多的作业要处理，线程池中线程的个数也到了极限，最新的作业就要排队，且必须等待线程完成其任务。

下面的示例应用程序首先要读取工作线程和 I/O 线程的最大线程数，把这些信息写入控制台中。接着在 for 循环中，调用 ThreadPool.QueueUserWorkItem()方法，传递一个 WaitCallback 类型的委托，把 JobForAThread()方法赋予线程池中的线程。线程池收到这个请求后，就会从池中选择一个线程，来调用该方法。如果线程池还没有运行，就会创建一个线程池，并启动第一个线程。如果线程池已经在运行，且有一个空闲线程来完成该任务，就把该任务传递给这个线程。

```c#
class Program
{
	static void Main(string[] args)
	{
		int nWorkerThreads;
		int nCompletionPortThreads;
		ThreadPool.GetMaxThreads(out nWorkerThreads, out nCompletionPortThreads);
		Console.WriteLine("Max worker threads: {0}, I/O completion threads: {1}",nWorkerThreads,nCompletionPortThreads);

		for (int i = 0; i < 5; i++)
		{
			ThreadPool.QueueUserWorkItem(JobForAThread);
		}
		Thread.Sleep(3000);
		Console.ReadKey();
	}

	static void JobForAThread(object state)
	{
		for (int i = 0; i < 3; i++)
		{
			Console.WriteLine("loop {0},running inside pooled thread {1}",i,Thread.CurrentThread.ManagedThreadId);
			Thread.Sleep(50);
		}
	}
}
```

运行应用程序时，可以看到 1023 个工作线程和当前设置。5个任务只由4个线程池中的线程处理，读者运行该程序的结果可能与此不同。也可以改变任务的睡眠时间和要处理的任务数，得到完全不同的结果。

```
Max worker threads: 32767, I/O completion threads: 1000
loop 0,running inside pooled thread 12
loop 0,running inside pooled thread 13
loop 0,running inside pooled thread 11
loop 0,running inside pooled thread 14
loop 1,running inside pooled thread 11
loop 1,running inside pooled thread 14
loop 1,running inside pooled thread 12
loop 1,running inside pooled thread 13
loop 2,running inside pooled thread 12
loop 2,running inside pooled thread 13
loop 2,running inside pooled thread 11
loop 2,running inside pooled thread 14
loop 0,running inside pooled thread 13
loop 1,running inside pooled thread 13
loop 2,running inside pooled thread 13
```

线程池使用起来很简单，但它有一些限制:

>* 线程池中的所有线程都是后台线程。如果进程的所有前台线程都结束了，所有的后台线程就会停止。不能把入池的线程改为前台线程。
>* 不能给入池的线程设置优先级或名称。
>* 对于COM对象，入池的所有线程都是多线程单元线程。许多COM对象都需要单线程单元线程。
>* 入池的线程只能用于时间较短的任务。如果线程要一直运行(如 Word 的拼写检查器线程),就应使用 Thread 类创建一个线程。

### Thread类

如果需要更多控制，可以使用 Thread 类。该类允许创建前台线程，以及设置线程的优先级。使用 Thread 类可以创建和控制线程。下面的代码是创建和启动一个新线程的简单例子。Thread 类的构造函数重载为接受 ThreadStart 和 ParameterizedThreadStart 类型的委托参数。ThreadStart 委托定义了一个返回类型为 void 的无参数方法。在创建 Thread 对象后，就可以用 Start()方法启动线程

```c#
static void Main(string[] args)
{
	var t1 = new Thread(ThreadMain);
	t1.Start();
	Console.ReadKey();
}

static void ThreadMain()
{
	Console.WriteLine("Running in a thread.");
}
```









