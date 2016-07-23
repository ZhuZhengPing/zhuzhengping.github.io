---
layout: post
title:  "进程、应用程序域和对象上下文"
date:   2016-07-23 16:32:18 +0800
categories: .net
tags: .net 进程 应用程序域 对象上下文
author: Zhengping Zhu
---

* content
{:toc}

## 概念

简单地说，进程可以承载一组相关的.NET程序集，而应用程序域(简称AppDomain)是对该进程的逻辑细分。你将看到，一个应用程序域进一步被细分成多个上下文边界，这些边界用来分组目的相似的.NET对象。使用上下文的概念，CLR便能够确保恰当地控制那些带特殊运行时要求的对象。

尽管大多数的日常编程任务可能不会直接使用进程、应用程序域或对象上下文，但在使用很多.NET API时，理解这些话题是非常重要的，如WCF、多线程和并行处理以及对象序列化。






### Windows 进程的作用

简单地说，进程是一个运行程序。正式地说，进程是一个操作系统级别的概念，用来描述一组资源(比如外部代码库和主线程)和程序运行所必须的内存分配。对于每个被加载到内存的*.exe，在它的生命周期中操作系统会为之创建一个单独且隔离的进程。

由于一个进程的失败不会影响其他进程，使用这种隔离方式，运行库和环境将更加健壮和稳定。此外，一个进程无法访问另外一个进程中的数据，除非使用WCF这种分布式计算编程的API。

现在每一个Windows进程都有一个唯一的进程标识符(PID)，当需要时，它们能被操作系统加载或卸载(也可通过编程调用)。在Windows任务管理器的Processes选项卡中，我们能够看到机器上正在运行进程的统计信息

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f63tzs7n53j30fk0bvacf.jpg" style="width:70%" />

### 线程的作用

每一个Windows进程都恰好包含一个用作程序入口点(entry point)的主线程。首先，线程是进程中的基本单元。正式的说法是：进程的入口点创建的第一个线程被称为主线程。.NET执行程序使用Main()方法作为程序入口点。当调用该方法时，会自动创建全线程

仅包含一个主线程的进程是线程安全的，这是由于在某个特定时刻只有一个线程访问程序中的数据。然而，如果这个线程正在执行一个复杂的操作，那么这个线程所在的进程(特别是GUI程序)对用户来说会显得像没有响应一样。

由于单线程程序的这个潜在的缺陷，Windows API(和.NET平台)可让主线程使用如CreateThread()之类的Windows API函数另外产生次线程(术语也称为工作线程，worker thread)。每一个线程(无论是主线程还是次线程)都是进程中的一个独立执行单元，它们能同时访问这些共享数据。

开发者使用多线程有助于改善程序的总体响应性。如果单个进程中的线程太多的话，性能反而会下降，因为CPU需要花费不少时间在这些活动的线程之间来回切换

在一些机器上，多线程是操作系统带给我们最常见的一种假象。单CPU的计算机并没有能力在同一时间运行多个线程。确切地说，在一个单位时间内，单CPU只能根据线程优先级执行一个线程。当一个线程的时间片用完的时候，它会被挂起，以便执行其它线程。

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f63ujbs66nj30h606jmy9.jpg" style="width:70%" />

### .NET平台下与进程进行交互

System.Diagnostics 命名空间定义了许多类型，它们允许我们以编程方式访问进程和许多与诊断相关的类型，比如系统事务日志和性能计数器。

类型				|作用
Process				|提供了访问本地和远程进程的功能，允许通过编程的方式开始或结束进程
ProcessModule		|代表一个加载到特定进程的模块(*.dll或*.exe)。它能够表示任何模块，基于COM、基于.NET或基于传统C的二进制程序
ProcessModuleCollection		|	提供ProcessModule对象的强类型集合
ProcessStartInfo			|	指定通过Process.Start()方法启动进程时使用的一组值
ProcessThread				|	代表指定进程中的线程。它用于诊断一个进程的线程情况，并不用在进程中创建线程
ProcessThreadCollection		|提供ProcessThread对象的强类型集合

System.Diagnostics.Process类用于分析运行于(本地或远程)机器上的进程。Process类也提供了成员，可用来以编程方式开始、结束进程，设定进程优先级，以及获得进程中活动线程的列表并且加载给定进程的模块。

*Process类型的部分成员*

成员			|作用
ExitTime		|获取终止进程相关的时间戳(类型是DateTime)
Handle			|返回操作系统分配给进程的句柄(由IntPtr表示)。当构建与非托管代码交互的.NET程序时，该属性很有用
Id				|获得关联进程的PID
MachineName		|获取关联进程运行的计算机名称
MainWindowTitle	|获取进程主窗口的标题(如果进程没有主窗口，则返回空字符串)
Modules			|可以访问强类型ProcessModuleCollection,后者表示一组加载到当前进程的模块(*.dll或*.exe)
ProcessName		|获取进程的名称(也就是应用程序本身的名称)
Responding		|指示进程的用户界面是否响应用户输入(或者当前是否被挂起)
StartTime		|获取关联进程开始的世界(通过DateTime类型)
Threads			|获取运行在关联进程中的一组线程的设置(由ProcessThread对象的集合表示)
CloseMainWindow()	|通过向进程的主窗口发送关闭消息来关闭拥有用户界面的进程
GetCurrentProcess()	|这个静态方法返回新的Process对象以表示当前活动的进程
GetProcesses()		|这个静态方法返回运行在给定计算机上的新Process对象
Kill()			|立即停止关联的进程
Start()			|启动一个进程

### 列举运行中的进程

为了说明如何操作Process类型，下面在Program类中定义了以下静态方法

```c#
static void ListAllRunningProcesses()
{
	// 得到本机的所有进程,按PID排序
	var runningProcs = from proc in Process.GetProcesses(".")
					   orderby proc.Id
					   select proc;

	// 输出每个进程的PID和名称
	foreach (var p in runningProcs)
	{
		string info = string.Format("-> PID: {0}\tName: {1}", p.Id, p.ProcessName);
		Console.WriteLine(info);
	}
}
```

注意，今天方法Process.GetProcesses()返回了一个Process对象数组，这个数组代表目标机器上运行的进程(这里显示的"."符号表示本机)。

```
-> PID:0		Name:Idle
-> PID:4		Name:System
-> PID:164		Name:svchost
...
```

### 特定的进程

除了能够获得给定机器上所有运行的进程列表以外，静态方法Process.GetProcessById()还可以通过关联的PID获得当个Process对象。如果请求的PID不存在，就会引发ArgumentException异常。

```c#
// 如果PID为987的进程不存在，将会引发运行时错误
static void GetSpecificProcess()
{
	Process theProc = null;

	try
	{
		theProc = Process.GetProcessById(987);
	}
	catch (ArgumentException ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```

### 进程的线程集合

这组线程通过ProcessThreadCollection强类型集合来表示，包含了许多单个的ProcessThread对象。

```c#
static void EnumThreadsForPid(int pID)
{
	Process theProc = null;

	try
	{
		theProc = Process.GetProcessById(pID);
	}
	catch (ArgumentException ex)
	{
		Console.WriteLine(ex.Message);
		return;
	}

	// 列出指定进程中每个线程的统计数字
	Console.WriteLine("Here are the threads used by: {0}", theProc.ProcessName);

	ProcessThreadCollection theThreads = theProc.Threads;

	foreach (ProcessThread pt in theThreads)
	{
		string info = string.Format("-> Thread ID: {0}\tStart Time: {1}\tPriority: {2}", pt.Id, pt.StartTime.ToShortDateString(), pt.PriorityLevel);
		Console.WriteLine(info);
	}
}
```

运行程序，输入机器中任意进程的PID，就可以查看其线程了。

```
PID:108
Here are the threads used by: iexplore
-> Thread ID: 680		Start Time: 9:05 AM		Priority: Normal
-> Thread ID: 2040		Start Time: 9:05 AM		Priority: Normal
-> Thread ID: 880		Start Time: 9:05 AM		Priority: Normal
-> Thread ID: 3380		Start Time: 9:05 AM		Priority: Normal
...
```

除了 Id,StartTime 和 PriorityLevel外，ProcessThread类型还有一些有趣的成员。

成员				|作用
CurrentPriority		|获取线程的当前优先级
Id					|获取线程的唯一标识符
IdealProcessor		|设置线程运行的首选处理器
PriorityLevel		|获取或设置线程的优先级别
ProcessorAffinity	|设置关联线程可以运行的处理器
StartAddress		|获取操作系统启动线程要调用的函数的内存地址
StartTime			|获取操作系统启动线程的时间
ThreadState			|获取线程的当前状态
TotalProcessorTime	|获取线程使用处理器的时间总量
WaitReason			|获取线程等待的原因

请记住在.NET平台下，ProcessThread类型并不用于创建、挂起或停止线程，ProcessThread是一种用来获取运行进程中活动Windows线程诊断信息的手段。

### 进程中的模块集合

接下来，看看如何对承载在进程中的加载模块的数量进行迭代。当通过Process.Modules属性访问ProcessModuleCollection时，可以列举出承载在进程中的所有模块

```c#
static void EnumModsForPid(int pID)
{
	Process theProc = null;
	try
	{
		theProc = Process.GetProcessById(pID);
	}
	catch (ArgumentException ex)
	{
		Console.WriteLine(ex.Message);
		return;
	}

	Console.WriteLine("Here are the loaded modules for: {0}",theProc.ProcessName);
	ProcessModuleCollection theMods = theProc.Modules;
	foreach (ProcessModule pm in theMods)
	{
		string info = string.Format("-> Mod Name: {0}", pm.ModuleName);
		Console.WriteLine(info);
	}
}
```

为了看到输出结果，我们测试一个进程

```
-> Mod Name: ProcessMainpulator.exe
-> Mod Name: ntdll.dll
-> Mod Name: MSCOREE.DLL
...
```

### 以编程的方式启动或结束进程

对于System.Diagnostics.Process类，最后再来看看它的Start()和Kill()方法。仅从名字上就能看出，他们提供了启动和结束进程的编程方法

```c#
static void StartAndKillProcess()
{
	Process ggProc = null;

	// 启动谷歌浏览器，进入 百度
	try
	{
		ggProc = Process.Start("chrome.exe", "www.baidu.com");
	}
	catch (InvalidOperationException ex)
	{
		Console.WriteLine(ex.Message);
	}

	Console.WriteLine("--> Hit enter to kill {0}...",ggProc.ProcessName);
	Console.ReadLine();

	// 结束chrome.exe进程
	try
	{
		ggProc.Kill();
	}
	catch (InvalidOperationException ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```

### 使用ProcessStartInfo类控制进程的启动

Start()方法还允许传入一个System.Diagnostics.ProcessStartInfo类型，说明一些关于进程如何被激活的额外信息。下面是ProcessStartInfo的正式定义

```c#
public sealed class ProcessStartInfo
{
	public ProcessStartInfo();
	public ProcessStartInfo(string fileName);
	public ProcessStartInfo(string fileName, string arguments);
	public string Arguments { get; set; }
	public bool CreateNoWindow { get; set; }
	public string Domain { get; set; }
	public StringDictionary EnvironmentVariables { get; }
	public IntPtr ErrorDialogParentHandle { get; set; }
	public string FileName { get; set; }
	public SecureString Password { get; set; }
	public bool RedirectStandardInput { get; set; }
	public bool RedirectStandardOutput { get; set; }
	public Encoding StandardErrorEncoding { get; set; }
	public Encoding StandardOutputEncoding { get; set; }
	public string UserName { get; set; }
	public bool UseShellExecute { get; set; }
	public string Verb { get; set; }
	public string[] Verbs { get; }
	public ProcessWindowStyle WindowStyle { get; set; }
	public string WorkingDirectory { get; set; }
}
```









