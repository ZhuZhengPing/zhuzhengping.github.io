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

为了演示如何控制进程的启动，我们修改了StartAndKillProcess()

```c#
static void StartAndKillProcess()
{
	Process ggProc = null;

	// 启动谷歌浏览器，进入 百度
	try
	{
		ProcessStartInfo startInfo = new ProcessStartInfo("chrome.exe", "www.baidu.com");
		// 窗口最大化
		startInfo.WindowStyle = ProcessWindowStyle.Maximized;

		ggProc = Process.Start(startInfo);
	}
	catch (InvalidOperationException ex)
	{
		Console.WriteLine(ex.Message);
	}
...
}
```

### .NET 应用程序域

在.NET平台下，可执行程序并没有直接承载在Windows进程中，而传统的非托管程序是直接承载的。实际上，.NET可执行程序承载在进程的一个逻辑分区中，术语称为应用程序域。可见，一个进程可以包含多个应用程序域，每一个应用程序域中承载一个.NET可执行程序。这种对传统的Windows进程的进一步分区具有几个好处

>* 应用程序域是.NET平台操作系统独立性的关键特性。这种逻辑分区将不同操作系统表现加载可执行程序的差异抽象化了。
>* 和一个完整的进程相比，应用程序域的CPU和内存占用都要小得多。因此CLR加载和卸载应用程序域比起完整的进程来说也快得多，并且可以快速提升服务器应用程序的可扩展性。
>* 应用程序域为承载的应用程序提供了深度的隔离。如果进程中一个应用程序域失败了，剩下的应用程序域也能保持正常。

单个进程可以承载多个应用程序域，其中每一个程序域都和该进程(或其它进程)中其他的程序域完全隔离开。由此，如果不使用分布式编程协议(如WCF)，运行在某个应用程序域中的应用程序将无法访问其他应用程序域中的任何数据(无论是全局变量还是静态字段)

虽然单个进程可以承载多个应用程序域，但是情况也有例外。至少操作系统只能承载默认的应用程序域。在进程启动的时候，CLR将自动创建这个特定的应用程序域。此后，CLR能够根据需求创建其他的应用程序域。

### System.AppDomain类

.NET平台允许我们使用mscorlib.dll中System命名空间下的AppDomain类，以编程的方式监控应用程序域、在运行时新建应用程序域、向应用程序域加载程序集等多种任务。

*AppDomain的主要成员*

成员					|作用
CreateDomain()			|该静态方法在当前进程中创建一个新的应用程序域
CreateInstance()	|在加载程序集到调用的应用程序域时，在外部程序集文件中创建指定类型的新实例
ExecuteAssembly()	|根据文件名在应用程序域中执行程序集
GetAssemblies()		|获取已经加载到此应用程序域中的.NET程序集(基于COM和C的二进制文本除外)
GetCurrentThreadId()	|该静态方法返回当前应用程序域上活动的线程ID
Load()			|动态加载程序集到当前的应用程序域
UnLoad			|该静态方法在进程中卸载指定的应用程序域

.NET平台不允许从内存中卸载指定的程序集。以编程方式卸载库的唯一方式是使用Unload()方法销毁承载的应用程序域。

此外，AppDomain类还定义了一些属性，用来监控给定应用程序域的活动。

属性				|作用
BaseDirectory		|获取目录路径，程序集解决程序用它来探测程序集
CurrentDomain		|该静态属性获取当前执行线程所在的应用程序域
FriendlyName		|获取当前应用程序的友好名称
MonitoringIsEnabled	|获取或设置一个值，该值指示是否对当前进程启用应用程序域的CPU和内存监控。一旦对进程启用了监控，则无法将其禁用
SetupInfomation		|获取给定应用程序域的配置信息，表示为一个AppDomainSetup对象

最后，AppDomain类支持一组事件，对应于应用程序域生命周期中的不同部分。

事件				|作用
AssemblyLoad		|在加载程序集到内存时发生
AssemblyResolve		|在对程序集的解析失败时发生
DomainUnload		|在即将从主进程中卸载AppDomain时发生
FirstChanceException|在应用程序域抛出异常时，该事件将在CLR找到合适的catch语句之前触发
ProcessExit			|当默认应用程序域的父进程退出时，在默认的应用程序域上发生
UnhandledException	|在异常处理程序未捕捉到异常时发生

### 与默认应用程序域进行交互

当一个.NET可执行文件启动时，CLR会自动将其放置到宿主进程的默认应用程序域中。该过程是自动且透明的，你不需要编写任何代码。但你可以使用AppDomain.CurrentDomain属性来访问这个默认的应用程序域。有了这个访问点，就可以捕捉任何感兴趣的事件。

```c#
static void DisplayDADStats()
{
	// 访问当前线程的应用程序域
	AppDomain defaultAD = AppDomain.CurrentDomain;

	// 打印该域中的不同状态
	Console.WriteLine("Name of this domain: {0}",defaultAD.FriendlyName);
	Console.WriteLine("ID of domain in this process: {0}",defaultAD.Id);
	Console.WriteLine("Is this the default domain?: {0}",defaultAD.IsDefaultAppDomain());
	Console.WriteLine("Base direct of this domain: {0}",defaultAD.BaseDirectory);
}
```

该示例输出结果如下：

```
Name of this domain: CTest.vshost.exe
ID of domain in this process: 1
Is this the default domain?: True
Base direct of this domain: F:\c#\CTest\bin\Debug\
```

### 枚举加载的程序集

你还可以使用GetAssemblies()实例方法，获取给定应用程序域中所加载的.NET程序集。该方法返回Assembly对象的数组，该数组是System.Reflection命名空间的成员。

```c#
static void ListAllAssembliesInAppDomain()
{
	// 访问当前线程的应用程序域
	AppDomain defaultAD = AppDomain.CurrentDomain;

	// 获取默认应用程序域中所有家长的程序集
	Assembly[] loadedAssemblies = defaultAD.GetAssemblies();
	Console.WriteLine("Here are the assemblies loaded in {0}",defaultAD.FriendlyName);
	foreach (Assembly a in loadedAssemblies)
	{
		Console.WriteLine("-> Name: {0}",a.GetName().Name);
		Console.WriteLine("-> Version: {0}\n",a.GetName().Version);
	}
}
```

更新Main()方法以调用该成员，可以看到承载可执行文件的应用程序域使用了如下所示的.NET程序集：

```
Here are the assemblies loaded in CTest.vshost
-> Name: mscorlib
-> Version: 4.0.0.0

-> Name: DefaultAppDomainApp
-> Version: 1.0.0.0
...
```

### 接收程序集加载通知

如果想接收CLR在给定的应用程序域中加载新程序集时所发出的通知，可以处理Assembly-Load事件。该事件的类型为AssemblyLoadEventHandler委托。

```c#
static void InitDAD()
{
	// 这段逻辑将在应用程序域创建后，打印加载到应用程序域的程序集名称
	AppDomain defaultAD = AppDomain.CurrentDomain;
	defaultAD.AssemblyLoad += (o, s) => {
		Console.WriteLine("{0} has been loaded!",s.LoadedAssembly.GetName().Name);
	};
}
```

### 创建新的应用程序域

单个进程可以通过AppDomain.CreateDomain()静态方法承载多个应用程序域。尽管对大多数.NET应用程序来说，在运行时新建应用程序域是十分罕见的，但理解其原理还是十分重要的。

```c#
static void Main(string[] args)
{

	// 访问当前线程的应用程序域
	AppDomain defaultAD = AppDomain.CurrentDomain;
	ListAllAssembliesInAppDomain(defaultAD);

	// 创建一个行的应用程序域
	MakeNewAppDomain();
	Console.ReadLine();
}

static void MakeNewAppDomain()
{
	// 在当前进程中新建一个AppDomain,并列出它所加载的程序集
	AppDomain newAD = AppDomain.CreateDomain("SecondAppDomain");
	ListAllAssembliesInAppDomain(newAD);
}

static void ListAllAssembliesInAppDomain(AppDomain ad)
{
	// 获取默认应用程序域中所有家长的程序集
	var loadedAssemblies = from a in ad.GetAssemblies() orderby a.GetName().Name select a;
	Console.WriteLine("Here are the assemblies loaded in {0}", ad.FriendlyName);
	foreach (Assembly a in loadedAssemblies)
	{
		Console.WriteLine("-> Name: {0}", a.GetName().Name);
		Console.WriteLine("-> Version: {0}\n", a.GetName().Version);
	}
}
```

运行当前示例结果如下

```
Here are the assemblies loaded in CTest.vshost
-> Name: mscorlib
-> Version: 4.0.0.0

-> Name: DefaultAppDomainApp
-> Version: 1.0.0.0
...

Here are the assemblies loaded in SecondAppDomain
-> Name: mscorlib
-> Version: 4.0.0.0
```

### 在自定义应用程序域中加载程序集

CLR可随时向默认的应用程序域中加载程序集。如果手工创建了应用程序域，可以使用AppDomain.Load()方法向其加载程序集。

```c#
static void MakeNewAppDomain()
{
	// 在当前进程中新建一个AppDomain,并列出它所加载的程序集
	AppDomain newAD = AppDomain.CreateDomain("SecondAppDomain");

	try
	{
		// 将CarLibrary.dll 加载到新域中
		newAD.Load("CarLibrary");
	}
	catch (FileNotFoundException ex)
	{
		Console.WriteLine(ex.Message);
	}

	ListAllAssembliesInAppDomain(newAD);
}
```

这时程序的输出结果如下(注意CarLibrary.dll)

```
Here are the assemblies loaded in SecondAppDomain
-> Name: CarLibrary
-> Version: 1.0.0.0

-> Name: mscorlib
-> Version: 4.0.0.0
```

### 以编程的方式卸载应用程序域

CLR并不允许卸载单独的.NET程序集。然而，使用AppDomain.Unload()方法，我们可以选择从承载的过程中卸载指定的应用程序域。

```c#
static void MakeNewAppDomain()
{
	// 在当前进程中新建一个AppDomain,并列出它所加载的程序集
	AppDomain newAD = AppDomain.CreateDomain("SecondAppDomain");
	newAD.DomainUnload += (o, s) =>
	{
		Console.WriteLine("The second app domain has been unloaded");
	};
	try
	{
		// 将CarLibrary.dll 加载到新域中
		newAD.Load("CarLibrary");
	}
	catch (FileNotFoundException ex)
	{
		Console.WriteLine(ex.Message);
	}

	// 一一列出所有程序集
	ListAllAssembliesInAppDomain(newAD);

	// 现在卸载这个应用程序域
	AppDomain.Unload(newAD);
}
```

如果想要在默认的应用程序域被卸载时得到通知，请修改Main()方法处理默认应用程序域的ProcessExit事件

```c#
static void Main(string[] args)
{
	AppDomain defaultAD = AppDomain.CurrentDomain;
	defaultAD.ProcessExit += (o, s) =>
	{
		Console.WriteLine("Default AD unloaded!");
	};
	ListAllAssembliesInAppDomain(defaultAD);

	MakeNewAppDomain();

	Console.ReadLine();
}
```

### 对象上下文边界

应用程序域是承载.NET程序集的进程中的逻辑分区。与此相似，应用程序域也可以进一步被划分成多个上下文边界。

使用上下文，CLR可以确保在运行时有特殊需求的对象，可以通过拦截进出上下文的方法调用，得到适当的和一致的处理。这个拦截层允许CLR调整当前的方法调用，以便满足给定对象对上下文的设定要求。

和一个进程定义了默认的应用程序域一样，每个应用程序域都有一个默认的上下文。这个默认的上下文【由于它总是应用程序域创建的第一个上下文，所以有时称为上下文0(context0)】用于组合那些对上下文没有具体的或唯一性需求的.NET对象。大多数.NET对象都会被加载到上下文0中。如果CLR判断一个新创建的对象有特殊需求，一个新的上下文边界将会在承载它的应用程序域中被创建

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f64zmoo37nj30bn06g0tn.jpg" style="width:70%" />

### 上下文灵活和上下文绑定类型

不需要指定特定上下文的.NET类型称为上下文灵活(context-alile)对象。这些对象可以从承载它的应用程序域的任何位置访问，与对象的运行时需求没有关系。想要构建这样一个上下文灵活的对象根本不用费神，因为简单得你什么都不用作

```c#
// 一个上下文灵活的对象被加载到上下文0中
class SportsCar{}
```

那些需要上下文分配的对象称为上下文绑定(context-bound)对象，它们必须派生自System.ContextBoundObject基类。这个基类再次说明这样一个事实：任何一个对象都只能在其被创建的那个上下文中正常运行。考虑到.NET上下文的作用，如果一个上下文绑定对象不知何故在一个并不兼容的上下文中终止，则在这种最不合事宜的情况下理应出现错误。

除了派生自System.ContextBoundObject外，一个上下文敏感的类型也可以用特定种类的.NET特性修饰，术语称为上下文特性。所有的上下文特性派生自ContextAttribute基类。

### 定义上下文绑定对象

假定想要定义一个自动线程安全的类(SportsCarTS)，但又不在成员实现中采用硬编码做线程同步的逻辑，可以继承ContextBoundObject,并应用[Synchronization]特性

```c#
using System.Runtime.Remoting.Contexts;
[Synchronization]
// 上下文绑定类型仅仅加载到一个同步的(因此是线程安全的)上下文中
class SportsCarTS : ContextBoundObject
{

}
```

添加了[Synchronization]特性的类型将被加载到线程安全上下文中。因为SportsCarTS类类型有特殊的需求，如果一个已分配的对象从一个同步的上下文移动到一个非同步的上下文时，发生的问题可想而知。对象突然不再是线程安全的并且极有可能变成大块的坏数据，而大量线程还在视图与这个(现在已是线程不稳定的)引用对象交互。为了确保CLR不会将SportsCarTS对象移出同步上下文边界，只需让SportsCarTS继承自ContextBoundObject。

### 研究上下文对象

尽管很少有应用程序需要以编程的方式和上下文交互，但是我们还是给出下面的示例。

```c#
// SportsCar 没有特别的上下文要求，所以将加载到应用程序域的默认上下文中
class SportsCar
{
	public SportsCar()
	{
		// 得到上下文信息，并输出上下文ID
		Context ctx = Thread.CurrentContext;
		Console.WriteLine("{0} object in context {1}",this.ToString(),ctx.ContextID);
		foreach (IContextProperty itfCoxProp in ctx.ContextProperties)
		{
			Console.WriteLine("-> Ctx Prop: {0}",itfCoxProp.Name);
		}
	}
}

[Synchronization]
// 上下文绑定类型仅仅加载到一个同步的(因此是线程安全的)上下文中
class SportsCarTS : ContextBoundObject
{
	public SportsCarTS()
	{
		// 得到上下文信息，并输出上下文ID
		Context ctx = Thread.CurrentContext;
		Console.WriteLine("{0} object in context {1}", this.ToString(), ctx.ContextID);
		foreach (IContextProperty itfCoxProp in ctx.ContextProperties)
		{
			Console.WriteLine("-> Ctx Prop: {0}", itfCoxProp.Name);
		}
	}
}
```

注意，通过调用静态的Thread.CurrentContext属性，SportsCar的每个构造函数都从当前运行的线程中获得了Context对象。

```c#
static void Main(string[] args)
{

	// 对象将显示创建时的上下文信息
	SportsCar sport = new SportsCar();
	Console.WriteLine();

	SportsCar sport2 = new SportsCar();
	Console.WriteLine();

	SportsCarTS synchroSport = new SportsCarTS();
	
	Console.ReadLine();
}
```

运行结果输出如下

```
CTest.SportsCar object in context 0
-> Ctx Prop: LeastLifeTimeServiceProperty

CTest.SportsCar object in context 0
-> Ctx Prop: LeastLifeTimeServiceProperty

CTest.SportsCarTS object in context 1
-> Ctx Prop: LeastLifeTimeServiceProperty
-> Ctx Prop: Synchronization
```

到目前为止，对于.NET程序集如何由CLR承载，总结起来有以下几点要求

>* 一个.NET进程可以承载多个应用程序域。每一个应用程序域可以承载多个相关的.NET程序集(或者使用AppDomain)，并且可由CLR独立地加载或卸载应用程序域
>* 一个给定的应用程序域中包含一个或多个上下文。使用上下文，CLR能够将“有特殊需求的”对象放在到一个逻辑容器中，确保该对象的运行时需求能够被满足






