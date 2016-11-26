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

任务结束时，它可以把一些有用的状态信息写到共享对象中。这个共享对象必须是线程安全的。另一个选项是使用返回某个任务的结果。这种任务也叫 future，因为它在将来




















