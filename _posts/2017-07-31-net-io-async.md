---
layout: post
title:  "I/O限制的异步操作"
date:   2017-07-31 16:32:18 +0800
categories: .net
tags: .net io
author: Zhengping Zhu
---

* content
{:toc}

## 概念

执行异步操作是构建可伸缩的、响应灵敏的应用程序的关键，它允许使用少量线程执行大量操作。与线程池结合，异步操作允许利用机器中的所有 CPU。意识到其中的巨大潜力，微软涉及了一个编程模型来帮助开发者利用这个能力。








以下代码使用异步函数来执行两个异步I/O操作。

```c#
private static async Task<string> IssueClientRequestAsync(string serverName, string message)
{
	using (var pipe = new NamedPipeClientStream(serverName, "PipeName", PipeDirection.InOut, PipeOptions.Asynchronous | PipeOptions.WriteThrough))
	{
		pipe.Connect();     // 必须在设置 ReadMode 之前连接
		pipe.ReadMode = PipeTransmissionMode.Message;

		// 将数据异步发送给服务器
		Byte[] request = Encoding.UTF8.GetBytes(message);
		await pipe.WriteAsync(request, 0, request.Length);

		// 异步读取服务器响应
		byte[] response = new byte[1000];
		Int32 bytesRead = await pipe.ReadAsync(response, 0, response.Length);
		return Encoding.UTF8.GetString(response, 0, bytesRead);
	} // 关闭管道
}
```		

在上述代码中，很容易分辨 IssueClientRequestAsync 是异步函数，以为第一行代码的 static 后添加了 async 关键字。一旦将方法标记为 async，编译器就会将方法的代码转换成实现了状态机的一个类型。这就运行线程执行状态机中的一些代码并返回，方法不需要一直执行到结束。所以当线程调用 IssueClientRequestAsync 时，线程会构造一个 NamedPipeClientStream, 调用 Connect ，设置它的 ReadMode 属性，将传入的消息转换成一个 byte[]，然后调用 WriteAsync.WriteAsync 内部分配一个 Task 对象并把它返回给 IssueClientRequestAsync。此时，C# await 操作符实际会在 Task 对象上调用 ContinueWith, 向它传递用于恢复状态机的方法。然后线程从 IssueClientRequestAsync 返回。

将来某个时候，网络设备驱动程序会结束向管道的写入，一个线程池线程会通知 Task 对象，后者激活 ContinueWith 回调方法，造成一个线程恢复状态机。更具体地说，一个线程会重新进入 IssueClientRequestAsync 方法，但这次是从 await 操作符的位置开始。方法现在执行行编译生成的、用于查询 Task 对象状态的代码。如果操作失败，会设置代表错误的一个异常。如果操作成功完成，await 操作符会返回结果。在本例中,WriteAsync 返回一个 Task 而不是 Task<TResult> ，所以无返回值。

现在方法继续执行，分配一个 byte[] 并调用 NamedPipeClientStream 的异步 ReadAsync 方法。ReadAsync 内部创建一个 Task<Int32> 对象并返回它。同样的，await 操作符实际会在 Task<Int32> 对象上调用 ContinueWith ，向其传递用于恢复状态机的方法。然后线程再次从 IssueClientRequestAsync 返回。

将来某个时候，服务器向客户机发送一个响应，网络设备驱动程序获得这个响应，一个线程池通知 Task<Int32> 对象，后者恢复状态机。await 操作符造成编译器生成代码来查询 Task 对象的 Result 属性并将结果赋给局部变量 bytesRead; 如果操作失败，则抛出异常，然后执行 IssueClientRequestAsync 剩余的代码，返回结果字符串并关闭管道。此时，状态机执行完毕，垃圾回收器会回收任何内存。

由于异步函数在状态机执行完毕之前返回，所以在 IssueClientRequestAsync 执行它的第一个 await 操作符之后，调用 IssueClientRequestAsync 的方法会继续执行。但是，调用者如何知道 IssueClientRequestAsync 已执行完毕它的状态机呢？一旦将方法标记为 async ,编译器会自动生成代码，在状态机开始执行时创建一个 Task 对象。该 Task 对象在状态机执行完毕时自动完成。注意 IssueClientRequestAsync 方法的返回类型为 Task<string> ,它实际返回的是由编译器生成的代码为这个方法的调用者而创建的 Task<string> 对象，Task 的 Result 属性在本例中是 string 类型。在 IssueClientRequestAsync 方法靠近尾部的地方，我返回了一个字符串。这造成编译器生成的代码完成它创建的 Task<string> 对象，把对象的 Result 属性设为返回的字符串。

注意，异步函数存在以下限制。

>* 不能将应用程序的 Main 方法转变成异步函数。另外，构造器、属性访问器方法和事件访问器方法不能转变成异步函数。
>* 异步函数不能使用任何 out 或 ref 参数。
>* 不能在 catch , finally 或 unsafe 块中使用 await 操作符。
>* 不能在 await 操作符之前获得一个支持线程所有权或递归的锁，并在 await 操作符之后释放它。这是因为 await 之前的代码由一个线程执行，之后的代码则可能由另一个线程执行。在 C# lock 语句中使用 await，编译器会报错。如果显示调用 Monitor 的 Enter 和 Exit 方法，那么代码虽然能编译，但 Monitor.Exit 会在运行时抛出一个 SynchronizationLockException.
>* 在查询表达式中，await 操作符只能在初始 from 子句的第一个集合表达式中使用，或者在 join 子句的集合表达式中使用。

### 编译器如何将异步函数转换成状态机

使用异步函数时，理解编译器为你执行的代码转换有助于提高开发效率。让我们首先定义一些简单的类型和方法。

```c#
internal sealed class Type1{}
internal sealed class Type2{}
private static async Task<Type1> Method1Async(){
	/* 以异步方式执行一些操作，最后返回一个 Type1 对象 */
}
private static async Task<Type2> Method1Async(){
	/* 以异步方式执行一些操作，最后返回一个 Type2 对象 */
}
```

然后通过异步函数使用这些简单的类型和方法。

```c#
private static async Task<string> MyMethodAsync(Int32 argument){
	Int32 local = argument;
	try{
		Type1 result1 = await Method1Async();
		for(Int32 x=0;x<3;x++){
			Type2 result2 = await Method2Async();
		}
	}catch(Exception){
		Console.WriteLine("Catch");
	}finally{
		Console.WriteLine("Finally");
	}
}
```

虽然 MyMethodAsync 看起来很别扭，但它确实演示了一些关键概念。首先，它本身是一个异步函数，返回一个 Task<string>，但代码主体最后返回的是一个 string。其次，它调用了其他函数，这些函数以异步方式执行操作。一个函数是单步执行，另一个是从 for 循环中执行。最后，它包含了异常代理代码。编译 MyMethodAsync 时，编译器将该方法中的代码转换成一个状态机结构

我编译上述代码，对IL代码进行逆向工程以转换回C#源代码。然后，我对代码进行了一
些简化，并添加了大量注释，帮助你理解编泽器对异步函数做的事情。下面展示的是编译
器转换后的精华代码，我展示了转换的MyMethodAsync方法及其依赖的状态机结构。

```c#
// AsyncstateMach;Lne特性指出这.是一个异步方法(对使用反射的工具有用
// 类型指出实现状态机的是哪个结构
[DebuggerStepThrough,  AsyncStateMachine(typeof IStateMachi1le))]
private static Task<String> MyMethodAsync(Int32 argument)  {
	// 创建状态机实例并初始化
	StateMachine stateMachine= new StateMachine(){
		//创建 builder, 从这个存根方法返回 Task<String>。
		//状态机访问 builder来设置 Task完成/异常
		m_builder= AsyncTaskMethodBuilder<String>.Create(),
		m_state = -1,                 //初始化状.态机位置
		m_argment = argurnent//将实参持贝到状态机字段
	};
	
	//  开始执行状态机
	stateMachine.m_builder.Start(ref  stateMachine) ;
	return  stateMachine.m_builder.Task;  //返回状态机的Task
}

//这是状态机结构
[CompilerGenerated,  StructLayout(LayoutKind.Auto)]
private  struct  StateMachine  :  IAsyncstateMachine {
	//代表状态机builder(Task)及其位置的字段
	public AsyncTaskMethodBuilder<String> m_builder; 
	public Int32 m_state;
	
	//实参和局部变量现在成了字段 
	public Int32 m_argument, m_local, m_x;
	public Typel m_resultTypel;
	public Type2 m_resultType2;
	
    //每个awaiter类型一个字段。
    //任何时候这些字段只有一个是重要的，那个字段引用最近执行的、以异步方式完成的await 
	private TaskAwaiter<Typel> m_awaiterTypel;
	private TaskAwaiter<Type2> m_awaiterType2;

	//这是状态机方法本身
	void IAsyncStateMachine.MoveNext() {
		String result = null; // Task 的结果值
		
		//编译器插入try块来确保状态机的任务完成
		try {
			Boolean executeFinally = true; //先假设逻辑上离开try块
			if (m_state == -1) {	      //如果第一次在状态机方法中，
				m_local = m_argument;	     //原始方法就从头开始执行
			}
		
			//原始代码中的try块
			try {
				TaskAwaiter<Typel> awaiterTypel;
				TaskAwaiter<Type2> awaiterType2;
				
				switch (m_state) {
					case -1: //幵始执行try块中的代码'
						//调用MethodlAsync并获得它的awaiter
						awaiterTypel = MethodlAsync().GetAwaiter();
						if (!awaiterTypel.IsCorr.pleted) {
							m_state = 0; // MethodlAsync要以异步方式完成 
							m_awaiterTypel = awaiterTypel; //保存awaiter以便将來返回
							
							//告诉awaiter在.操作完成时调用MoveNext
							m_builder.AwaitUnsafeOnCompleted(ref awaiterTypel, ref this); //上述代码调用awaiterTypel的OnCompleted，它会在被等待的仟务上 
							// 调用 ContinueWith (t => MoveNext ()。.
							//仟务完成后，ontinueWith任务调用MoveNext
							
							executeFinally = false; // 逻辑上不离开 try 块 
							return; //线程返回至调用者
						}
						// MethodlAsync以同步方式完成了 
						break;
						
					case 0: // MethodlAsync以异步方式完成了
						awaiterTypel = m_awaiterTypel; // 恢复最新的 awaiter
						break;
						
						case 1: // Method2Async以异步方式完成了
							awaiterType2 = m_awaiterType2; // 恢复最新办勺 awaiter 
							goto ForLoopEpilog;
				}
				
				//在第一个await后，我们捕捉结果并扁动for循环
				m_resultTypel = awaiterTypel.GetResult () ; // 获取 awaiter 的结果
				ForLoopPrologue:
					m_x = 0; // for循环初始化
					goto ForLoopBody; // 跳到 for 循环主体
				
				ForLoopEpilog:
					m_resultType2 = awaiterType2.GetResult(); 
					m_x++;//每次循环迭代都递增x 
					// 直通到for循环主体
					
				ForLoopBody:
					if (m_x < 3) { // for 循环测试
						//调用Method2Async并获取它的awaiter
						awaiterType2 = Method2Async().GetAwaiter();
						if (!awaiterType2.IsCompleted){
							m_state = 1;	// Method2Async要以异步方式完成
							m_awaiterType2 = awaiterType2; // 保存 awaiter 以便将来返回
							
							//告诉awaiter在操作完成时调用MoveNext
							m_builder.AwaitUnsafeOnCompleted(ref awaiterType2, ref this); 
							execute Finally = false; // 逻辑上不离开 try 块 
							return; //线程返回至调用者
						}
							// Method2Async以同步方式完成了
						goto ForLoopEpilog;//以同步方式完成就再次循环
					}
			}
			catch (Exception) {
				Console.Writ'eLine ("Catch"};
			}
			finally {
				//只要线程物理上离幵try就会执行finally。
				//我们希望在线程逻辑上离开try时才执行这些代码 
				if (executeFinally) {
					Console.WriteLine ("Finally");
				}
			}
			result = "Done"; //这是最终从异步函数返回的东西
		}
		catch (Exception exception) {
			//未处理的异常：通过设置异常来完成状态机的Task m_builder.SetException(exception); return;
		}
		//无异常：通过返回结果來完成状态机的Task 
		m _builder.SetResult(result);
	} 	
}
```
							
花些时间梳理上述代码并读完所有注释，我猜你就能完全地领会编译器为你做的事情了。 但是，如何将被等待的对象与状态机粘合起来还需着重解释一下。任何时候使用await操 作符，编译器都会获取操作数，并尝试在它上面调用GetAwaiter方法。这可能是实例方法 或扩展方法。调用GetAwaiter方法所返回的对象称为awaiter(等待者)，正是它将被等待的 对象与状态机粘合起来。

状态机获得awaiter后，会查询其IsComp丨eted属性。如果操作己经以同步方式完成了，属 性将返回true,而作为一项优化措施，状态机将继续执行并调用awaiter的GetResult方法。 该方法要么抛出异常(操作失败)，要么返回结果(操作成功)。状态机继续执行以处理结果。

 如果操作以异步方式完成，IsCompleted将返回false。状态机调用awaiter的OnComp丨eted
方法并向它传递一个委托(引用状态机的MoveNext方法)。现在，状态机允许它的线程回到 原地以执行其他代码。将来某个时候，封装了底层任务的awaiter会在完成时调用委托以执 行MoveNext。可根据状态机中的字段知道如何到达代码中的正确位置，使方法能从它当初 离开时的位置继续。这时，代码调用awaiter的GetResull方法。执行将从这里继续，以便 对结果进行处理。
这便是异步函数的工作原理.开发人员可用它轻松地写出不阻寒的代码.

### 异步函数扩展性

在扩展性方面，能用Task对象包装一个将来完成的操作，就可以用await操作符来等待该 操作。
用一个类型(Task)来表示各种异步操作对编码有利，因为可以实现组合操作(比如 Task的WhenAU和WhenAny方法)和其他有用的操作。本章后面会演示如何用Task包装 一个CancellationToken,在等待异步操作的同时利用超时和取消功能。

我想和你分享另外一个例子。下面是我的TaskLogger类，可用它显示尚未完成的异步操 作。这在调试时特别有用，尤其是当应用程序因为错误的请求或者未响应的服务器而挂起 的时候。

```c#
public static class TaskLogger (
	public enum TaskLogLevel ( None, Pending }
	public static TaskLogLevel LogLevel ( get; set; }
	
	public sealed class TaskLogEntry {
		public Task Task { get; internal set; }
		public String Tag { get; internal set; }
		public DateTime LogTime { get; internal set; } 
		public String CallerMemberName { get; internal set; } 
		public String CallerFilePath { get; internal set; }
		public Int32 CallerLineNumber { get; internal set; }
		public override string ToString(){
			return String.Format("LogTime=10), Tag={1}f Member={2}, File={3}({4})",
			LogTime, Tag ?? "(none)", CallerMemberName, CallerFilePath, CallerLineNumber);
		}
	}
	private static readonly ConcurrentDictionary<Task, TaskLogEntry> s_log = new ConcurrentDictionary<Task, TaskLogEntry>();
	public static IEnumerabie<TaskLogEntry> GetLogEntries() { 
		return s_log.Values;
	}

	public static Task<TResult> Log<TResuIt>(this Task<TResult> task, String tag = null, 
	[CallerMemberName] String callerMemberMame = null,
	[CallerFilePath] String CallerFilePath = null,
	[CallerLineNumber] Int32 CallerLineNumber = -1){
		return (Task<TResult>)
			Log((Task)task, tag, cai1erMemberNamer CallerFilePath, CallerLineNumber);
	}
	
	public static Task Log(this Task task, String tag = null, 
		[CallerMemberName] String callerMemberName = null, 
		[CallerFilePath] String CallerFilePath = null, 
		[CallerLineNumber] Int32 CallerLineNumber = -1) {
			if (LogLevel == TaskLogLevel.None) return task; 
			var logEntry = new TaskLogEntry {
				Task = task,
				LogTime = DateTime.Now,
				Tag = tag,
				CallerMemberName = callerMemberName,
				CallerFilePath = callerFilePath,
				CallerLineNuinber = callerLineNumber
		};
		s_log[task] = logEntry;
		task.ContinueWith(t => { TaskLogEntry entry; s_log.TryRemove(t, out entry); }, 	TaskContinuationOptions.ExecuteSynchronously); 
		return task;
	}
}
```

以下代码演示了如何使用该类。

```c#
public static async Task Go() {
	#if DEBUG
		//使用TaskLoggei:会影响内存和性能，所以只在调试生成中启用它 Tas kLogger.LogLevel = TaskLogger.TaskLogLevel.Pending; 
	#endif
	//初始化为3个任务：为了测试TaslcLogger,我们显式控制其持续时间 
	var tasks = new List<Task> {
		Task.Delay(2000).Log("2s op"),
		Task.Delay(5000).Log(M5s op"),
		Task.Delay(6000).Log("6s op")
	);
	try {
		//等待全部任务，但在3秒后取消；只有一个任务能按时完成 //注意：WithCancellation扩展方法将在本章稍后进行描述 
		await Task.WhenAli(tasks).WithCancellation(new CancellationTokenSource(3000).Token);
	)
	catch (OperationCanceledException) { }
		//查询logger哪些任务尚未完成，按照从等待时间最长到最短的顺序排序 
		foreach (var op in TaskLogger.GetLogEntries().OrderBy(tie => tie.LogTime)) 
			Console.WriteLine(op);
	}
```

在我的机器上生成并运行上述代码得到以下结果。

```
LogTime=7/16/2012 6:44:31 AM, Tag=6s op, Member=Go, File=C:\CLR via C#\Code\Ch28-l-I00ps.cs (332) LogTime=7/16/2012 6:44:31 AM, Tag=5s op, Member=Go, File=C:\CLR via C#\Code\Ch28-l-IOOps.cs (331)
```

除了增强使用Task时的灵活性，异步函数另一个对扩展性有利的地方在于编译器可以在await的任何操作数上调用GetAwaiter。所以操作数不一定是Task对象。可以是任意类型，只要提供了一个可以调用的GetAwaiter方法。下例展示了我自己的awaiter在异步方法的状态机和被引发的事件之间，它扮演了 “粘合剂”的角色。

```c#
public sealed class EventAwaiter<TEventArgs> : INotifyCompletion {
	private ConcurrentQueue<TEventArgs> m_events = new ConcurrentQueue<TEventArgs>(); 
	private Action m_continuation;
	#region状态机调用的成员
	//状态机先调用这个来获得awaiter:我们自己返回自己
	public EventAwaiter<TEventArgs> GetAwaiter() { return this; }
	
	//告诉状态机是否发生了任何事件
	public Boolean IsCompleted {get { return m_events_Count >0; }}
	
	//状态机告诉我们以后要调用什么方法：我们把它保存起来 
	public void OnCompleted(Action continuation) {
		Volatile.Write(ref m_continuation, continuation);
	}
	
	//状态机查询结果；这是await操作符的结果 
	public TEventArgs GetResult() {
		TEventArgs e;
		m_events.TryDequeue(out e); 
		return e;
	}
	#endregion
	
	//如果都引发了事件，多个线程可能同时调用
	public void EventRaised(Object sender, TEventArgs eventArgs) {
		m_events.Enqueue(eventArgs) ; // 保存 EventArgs 以便从 GetResult/await 返回
		
		//如果有一个等待进行的延续任务，该线程会运行它
		Action continuation = Interlocked.Exchange(ref m_continuation, null); 
		if (continuation != null) continuation () ; // 恢复状态机
	}
}
```

以下方法使用我的EventAwaiter类在事件发生的时候从await操作符返回。在本例中，一旦AppDomain中的任何线程抛出异常，状态机就会继续。

```c#
private static async void ShowExceptions() {
	var eventAwaiter = new EventAwaiter<FirstChanceExceptionEventArgs>();
	AppDomain.CurrentDomain.FirstChanceException += eventAwaiter.EventRaised; 
	while (true) {
		Console.WriteLine("AppDomain exception: {0}",(await eventAwaiter).Exception.GetType());
	}
}
```

最后用一些代码演示了所有这一切是如何工作的。

```c#
public static void Go() {
	ShowExceptions();
	
	for (Int32 x = 0; x < 3; x++）{
		try {				
			switch (X)	{		
				case 0:	throw new	InvalidOperationException();
				case 1:	throw new	ObjectDisposedException("");
				case 2:	throw new	ArgumentOutOfRangeException();
			}
		}
		catch { }
	}
}
```

### 异步函数和事件处理程序

异步函数的返回类型一般是Task或`Task<TResult>`,它们代表函数的状态机完成。但异步函数是可以返回void的。实现异步事件处理程序时，C#编译器允许你利用这个特殊情况 简化编码。几乎所有事件处理程序都遵循以下方法签名：

```c#
 void EventHandlerCallback(Object sender, EventArgs e);
```

但经常需要在事件处理方法中执行I/O操作，比如在用户点击UI元素来打开并读取文件时。 为了保持UI的可响应性，这个I/O应该以异步方式进行。而要在返回void的事件处理方 法中写这样的代码，C#编译器就要允许异步函数返回void,这样才能利用await操作符执 行不阻塞的I/O操作。编译器仍然为返回void的异步函数创建状态机，但不再创建Task 对象，因为创建了也没法使用。所以，没有办法知道返回void的异步函数的状态机在什么 时候运行完毕。

### FCL的异步函数

我个人很喜欢异步函数，它们易于学习和使用，而且获得了 FCL的许多类型的支持。异步 函数很容易分辨，因为规范要求为方法名附加Async后缀。在FCL中，支持I/O操作的许 多类型都提供了 XxxAsync方法气下面是一些例子。

>* System.IO.Stream 的所有派生类都提供了 ReadAsync, Write Async, FlushAsync 和 CopyToAsync 方法.
>* System.IO.TextReader 的所有派生类都提供了 ReadAsync，ReadLineAsync, ReadToEndAsync 和 ReadBlockAsync 方法。System.IO.TextWriter 的派生类提供了 WriteAsync, WriteLine Async 和 FlushAsync 方法。
>* System.Net.Http.HttpClient 类提供了 GetAsync，GetStreamAsync，GetByteArrayAsync, PostAsync,PutAsync，DeleteAsync 和其他许多方法。
>* System.Net.WebRequest 的所有派生类（包括 FileWebRequest, FtpWebRequest 和 HttpWebRequest)都提供了 GetRequestStreamAsync 和 GetResponseAsync 方法。
>* System.Data.SqlClient.SqlCommand 类提供了 ExecuteDbDataReaderAsync， ExecuteNonQueryAsync, ExecuteReaderAsync, ExecuteScalarAsync 和 ExecuteXmlReaderAsync方法。
>* 生成Web服务代理类型的工具(比如SvcUtil.exe)也生成XxxAsync方法。

用过早期版本的.NET Framework的幵发人员应该熟悉它提供的其他异步编程模型。有一个编程模型使用BeginXxx/EndXxx方法和IAsyncResult接口。还有一个基于事件的编程模
型，它也提供了 XxxAsync方法(不返回Task对象)，能在异步操作完成时调用事件处理程 序。现在这两个异步编程模型已经过时，使用Task的新模型才是你的首要选择。

当前，FCL的一些类缺乏XxxAsync方法，只提供了 BeginXxx和EndXxx方法。这主要是 由于Microsoft没有时间用新方法更新这些类。Microsoft将来会增强这些类，使其完全支持 新模型。但在此之前，有一个辅助方法可将旧的BeginXxx和EndXxx方法转变成新的、 基于Task的模型。

前面展示过通过命名管道来发出请求的客户端应用程序的代码，下面是服务器端的代码。

```c#
private static async void StartServer()( 
	while (true) {
		var pipe = new NamedPipeServerStream(c_pipeName,PipeDirection.InOut, -1,
	PipeTransmissionMode.Message, PipeOptions.Asynchronous 丨 PipeOptions•WriteThrough);
		//异步地接受客户端连接
		//注意：NamedPipServerStream使用旧的异步编程模型（APM)
		//我用TaskFactory的FromAsync方法将旧的APM转换成新的Task模型
		await Task.Factory.FromAsync(pipe.BeginWaitForConnection, pipe.EndWaitForConnection, null);
		//开始为客户端提供服务，山于是异步的，所以能立即返回 
		Serviced ientRequestAsync (pipe);
	}
}
```

NamedPipeServerStream 类定义了 BeginWaitForConnection 和 EndWaitForConnection 方 法，但没有定义WaitForConnectionAsync方法。FCL未来的版本有望添加该方法。但不
是说在此之前就没有希望了。如上述代码所示，我调用TaskFactory的FromAsync方法， 向它传递BeginXxx和EndXxx方法的名称。然后，FromAsync内部创建一个Task对象来
包装这些方法。现在就可以随同await操作符使用Task对象了

FCL没有提供任何辅助方法将旧的、基于事件的编程模型改编成新的、基于Task的模型。 所以只能采用硬编码的方式。以下代码演示如何用TaskCompletionSource包装使用了 “基于事件的编程模型”的WebCUent，以便在异步函数中等待它。

```c#
private static async Task<String> AwaitWebC丄ient(Uri uri) {
	// System.Net. WebClient类支持截十事件的异步模式 var wc = new System.Net.WebClient();
	// 创建 TaskCompletionSource 及其基础 Task 对象 
	var tcs = new TaskCompletionSource<String>();
	//字符串下载完毕后，WebClient对象引发DownloadStringCompleted事件，
	// 从而完成 TaskCompletionSource 
	wc.DownloadStringCompleted += (s, e) => { 
		if (e.Cancelled) tcs.SetCanceled{);
		else if (e.Error 1= null) tcs.SetException(e.Error); 
		else tcs.SetResult(e.Result);
	};
	//启动异步操作
	wc.DownloadStringAsync(uri);
	
	//现在可以等待TaskCompletionSource的Task,和往常一样处理结果 
	
	String result = await tcs.Task;
	//处现结果字符串{如果需要的话> ...
	return result;
}
```

### 异步函数和异常处理

Windows设备驱动程序处理异步.I/O请求时可能出错，Windows需要向应用程序通知这个 情况=例如，通过网络收发字节时可能超时。如果数据没有及时到达，设备驱动程序希望告诉应用程序异步操作虽然完成，但存在一个错误。为此，设备驱动程序会向CLR的线程 池post已完成的IRP。一个线程池线程会完成Task对象并设置异常。你的状态机方法恢复 时，await操作符发现操作失败并引发该异常。

第27章说过,Task对象通常抛出一个AggregateException,可查询该异常的InnerExceptions
属性来查看真正发生了什么异常。但将await用于Task时，抛出的是第一个内部异常而不 是AggregateException。这个设计提供了自然的编程体验。否则就必须在代码中捕捉 AggregateException.检查内部异常，然后要么处理异常，要么重新抛出。这未免过于烦琐.

如果状态机出现未处理的异常，那么代表异步函数的Task对象会因为未处理的异常而完 成。然后，正在等待该Task的代码会看到异常。但异步函数也可能使用了 void返回类型， 这时调用者就没有办法发现未处理的舁常。所以，当返回void的异步函数抛出未处理的异 常时，编译器生成的代码将捕捉它，并使用调用者的同步上下文(稍后讨论)重新抛出它。 如果调用者通过GUI线程执行，GUI线程最终将重新抛出异常。重新抛出这种异常通常造成整个进程终止。

### 异步函数的其他功能

木节要和你分享的是和异步函数相关的其他功能。Microsoft Visual Studio为异步函数的调
试提供了出色的支持。如果调试器在await操作符上停止，“逐过程”（F10)会在异步操作 完成后.在抵达下一个语句时重新由调试器接管。在这个时候，执行代码的线程可能已经 不是当初发起异步操作的线程。这个设计十分好用，能极大地简化调试。
另外，如果不小心对异步函数执行“逐语句”（功能键F11)操作，可以“跳出”（组合键 Shift+Fll)函数并返回至调用者；但必须在位于异步函数的起始大括号的时候执行这个操 作。一旦越过起始大括号，除非异步函数完成，否则“跳出”（组合键Shift+Fll)操作无法

有的异步操作执行速度很快，几乎瞬间就能完成。在这种情况下，挂起状态机并让另一个 线程立即恢复状态机就显得不太划算。更有效的做法是让状态机继续执行。幸好，编译器 为await操作符生成的代码能检测到这个问题。如果异步操作在线程返回前完成，就阻止 线程返回，直接由它执行下一行代码。

到目前为止一切都很完美，但有时异步函数需要先执行密集的、计算限制的处理，再发起 异步操作。如果通过应用程序的GUI线程来调用函数，U1就会突然失去响应，好长时间才能恢复。另外，如果操作以同步方式完成，那么UI失去响应的时间还会变得更长。在这种 情况下，可利用Task的静态Run方法从非调用线程的其他线程中执行异步函数。

```c#
// Task.Run在GUI线程上调用 
Task.Run(async () => {
	//这里的代码在一个线程池线程上运行 
	// TODO：在这里执行密集的、计算限制的处理...
	await XxxAsync () ; //发起异步操作 
	//在这里执行更多处理...
});
```

上述代码演示了 C#的异步lambda表达式。可以看出，不能只在普通的lambda表达式主体 中添加await操作符完事，因为编译器不知道如何将方法转换成状态机。但同时在lambda 表达式前面添加async,编译器就能将lambda表达式转换成状态机方法来返回一个Task 或Task<TResult>,并可赋给返回类型为Task或Task<TResult>任何Func委托变量。

写代码时，很容易发生调用异步函数但忘记使用await操作符的情况。以下代码进行了演示。

```c#
static async Task OuterAsyncFunction() {
	InnerAsyncFunction () ; // Oops,忘了添加 await 操作符
	//在InnerAsyncFunction继续执行期间，这里的代码也继续执行
}
static async Task InnerAsyncFunction () { /* 这里的代码不重要 */ }
```

幸好，c#编译器会针对这种情况显示以下警告：

由于此调用不会等待，因此在此调用完成之前将会继续执行当前方法。请考虑将 await 运算符应用于调用结果。

这个警告大多数时候都很有用，但极少数情况下，你确实不关心InnerAsyncFunction在什么时候结束，上述代码正是你想要的结果，不希望看到警告。

为了取消警告，只需将InnerAsyncFunction返回的Task赋给一个变量，然后忽略该变量。

```c#
static async Task OuterAsyncFunction() {
	var noWarning = InnerAsyncFunction () ; // 故意不添力FI await 操作符
	//在InnerAsyncFunction继续执行期间，这里的代码也继续执行
}

我个人更喜欢定义如下所示的扩展方法。

```c#
[MethodImpl(MethodlmplOptions. Aggressivelnlining)] // 造成编译器优化凋用 
public static void NoWarning (this Task task) { /* 这里没有代码 */ }
```

然后像这样使用它。

```c#
static async Task OuterAsyncFunction() {
	InnerAsyncFunction () .NoWarning () ; // 故意不添加 await 操作符

	//在InnerAsyncFunction继统执行期间，这里的代码也继续执行
}
```

异步I/O操作最好的一个地方是可以同时发起许多这样的操作，让它们并行执行，从而显著提升应用程序的性能。以下代码启动我的命名管道服务器，然后向它发起大量的客户端请求。

```c#
public static async Task Go() {
	//圮动服务器并立即返回，因为它舁步地等待客户端请求 StartServer () ; //返回void,所以编译器会发出警告
	//发起大置异步客户端请求：保存每个客户端的Task<String>
	List<Task<String>> requests = new List<Task<String>> (10000); 
	for (Int32 n = 0; n < requests.Capacity; n++)
		requests.Add(IssueClientRequestAsync("localhost", "Request #" + n));
	
	//异步地等待所有客户端请求完成
	//注意：如果1个以上的任务抛出异常，WhenAll重新抛出最后一个抛出的异常 
	String[] responses = await Task.WhenAll(requests);
	
	//处理所有响应
	for (Int32 n = 0; n < responses.Length; _n++)
		Console.WriteLine(responses[n]);
}
```

上述代码启动命名管道服务器来监听客户端请求，然后，for循环以最快速度发起10000 个客户端请求。每个IssueClientRequestAsync调用都返回一个Task<String>对象，这些对
象全部添加到一个集合中。现在，命名管道服务器使用线程池线程以最快的速度处理这些 请求，机器上的所有CPU都将保持忙碌状态。每处理完一个请求，该请求的Task<String> 对象都会完成,并从服务器返回字符串响应。

在上述代码中，我希望等待所有客户端请求都获得响应后再处理结果。为此，我调用了 Task 的静态WhenAll方法。该方法内部创建一个Task<String[]>对象，它在列表中的所有Task 对象都完成后才完成。然后，我等待Task<String[]>对象，使状态机在所有任务完成后继 续执行。所有任务完成后，我遍历所有响应并进行处理(调用Console.WriteLine)。

如果希望收到一个响应就处理一个，而不是在全部完成后再处理，那么用Task的静态 WhenAny方法可以轻松地实现，下面是修改后的代码。

```c#
public static async Task Go() {
	//启动服务器并立即返回，因为它异步地等待客户端请求
	StartServer();
	
	//发起大量异步客户端请求；保存每个客户端的Task<String>
	List<Task<String>> requests = new List<Task<String>>(10000); 
	for (Int32 n = 0; n < requests.Capacity; n++）
		requests.Add(工ssueClientRequestAsync<"localhost", "Request #" + n))?
	
	//每个任务完成都继续
	while (requests.Count > 0) {
		//顺序处理每个完成的响应
		Task<String> response = await Task.WhenAny(requests); 
		requests.Remove (response) ; //从集合中删除完成的任务
		//处理一个响应
		Console.WriteLine(response.Result);
	}
}
```

上述代码创建while循环，针对每个客户端请求都迭代一次。循环内部等待Task的 WhenAny方法，该方法一次返回一个Task<String>对象，代表由服务器响应的一个客户 端请求。获得这个Task<String>对象后，就把它从集合中删除，然后查询它的结果以进行 处理(把它传经Console.WriteLine)

### 应用程序及其线程处理模型

.NET Framework支持几种不同的应用程序模型，而每种模型都可能引入了它自己的线程处 理模型。控制台应用程序和Windows服务(实际也是控制台应用程序：只是看不见控制台 而已)没有弓I入任何线程处理模型：换言之，任何线程可在任何时候做它想做的任何事情

但GUI应用程序(包括Windows窗体、WPF、Silverlight和Windows Store应用程序)引入了
一个线程处理模型。在这个模型中，UI元素只能由创建它的线程更新。在GUI线程中，经 常都需要生成一个异步操作,使GUI线程不至于阻塞并停止响应用户输入(比如鼠标、按键、 手写笔和触控事件)。但当异步操作完成时，是由一个线程池线程完成Task对象并恢复状 态机。

对于某些应用程序模型，这样做无可非议，甚至可以说正好符合开发人员的意愿，因为它 非常高效。但对亍另一些应用程序模型(比如GUI应用程序)，这个做法会造成问题，因为 一旦通过线程池线程更新UI元素就会抛出异常。线程池线程必须以某种方式告诉GUI线 程更新UI元素。

ASP.NET应用程序允许任何线程做它想做的任何事情。线程池线程开始处理一个客户端的 请求时，可以对客户端的语言文化(System.Globalization.Culturelnfo)做出假定，从而允许 Web服务器对返回的数字、日期和时间进行该语言文化特有的格式化处理。此外，Web 服务器还可对客户端的身份标识(System.Security.PrincipaUPrincipal)做出假定，确保只能访问客户端有权访问的资源。线程池线程生成一个异步操作后，它可能由另一个线程池线 程完成.该线程将处理异步操作的结果。代表原始客户端执行工作时，语言文化和身份标 识信息需要“流向”新的线程池线程。这样一来，代表客户端执行的任何额外的工作才能 使用客户端的语言文化和身份标识信息。

幸好 FCL 定义了一个名 System.Threading.SynchronizationContext 的基类，它解决了所有 这些问题。简单地说，SynchronizationContext派生对象将应用程序模型连接到它的线程处 理模型。FCL定义了几个SynchronizationContext派生类，但你一般不直接和这些类打交 道：事实上，它们中的许多都没有公幵或记录到文档。

应用程序开发人员通常不需要了解关于SynchronizationContext类的任何事情。等待一个 Task时会获取调用线程的SynchronizationContext对象。线程池线程完成Task后，会使 用该SynchronizationContext对象，确保为应用程序模型使用正确的线程处理模型。所以， 当GUI线程等待一个Task时，await操作符后面的代码保证在GUI线程上执行，使代码 能更新UI元素。$对于ASP.NET应用程序，await后面的代码保证在关联了客户端语言文 化和身份标识信息的线程池线程上执行。

让状态机使用应用程序模型的线程处理模型来恢复，这在大多数时候都很有用，也很方便。 但偶尔也会带来问题。下面是造成WPF应用程序死锁的一个例子。

```c#
private sealed class MyWpfWindow : Window {
	public MyWpfWindow() { Title = "WPF Window"; }
	protected override void OnActivated(EventArgs e) {
		//查询Result属性阻Ih GUI线程返回：
		//线程在等待结果期间阻塞
		String http = GetHttpO .Result; //以同步方式获取字符串 
		base.OnActivated(e);
	}
	
	private async Task<String> GetHttp() {
		//发出HTTP请求.让线程GetHttp返回
		HttpResponseMessage msg = await new HttpClient().GetAsync("http://Wintellect.com/");
		//这里永远执行不到；GUI线程在等待这个方法结束.
		//但这个方法结束不了，因为GUI线程在等待它结束死锁！
		return await msg.Content.ReadAsStringAsync();
	}
}
```

类库开发人员为了写高性能的代码来应对各种应用程序模型，尤其需要注意 SynchronizationContext类。由于许多类库代码都要求不依赖于特定的应用程序模型，所以 要避免因为使用SynchronizationContext对象而产生的额外开销。此外，类库开发人员要竭尽全力帮助应用程序开发人员防止死锁。为了解决这两方面的问题，Task和Task<TResu!t>类提供了一个ConfigureAwait方法，它的签名如下所示。

```c#
 //定义这个方法的Task
 public ConfiguredTaskAwaitable ConfigureAwait(Boolean continueOnCapturedContext);
 //定义这个方法的Task<TResult>
 public ConfiguredTaskAwaitable<TResult> ConfigureAwait(Boolean continueOnCapturedContext);
```

向方法传递true相当于根本没有调用方法。但如果传递false, await操作符就不査询调用 线程的SynchronizationContext对象。当线程池线程结束Task时会直接完成它，await操
作符后面的代码通过线程池线线程执行。

虽然我的GetHttp方法不是类库代码，但在添加了对ConfigureAwait的调用后，死锁问题 就不翼而飞了。下面是修改过的GetHttp方法。

```c#
private async Task<String> GetHttp() {
	//发出HTTP请求，让线程A GetHttp返回 
	HttpResponseMessage msg = await new HttpClient().GetAsync("http://Wintellect.com/").ConfigureAwait(false);
	
	//这里能执行到了，因为线程池线程可以执行这里的代码，
	//而非被迫由GUI线秤执行

	return await msg.Con tent.ReadAsStringAsync().ConfigureAwait(false);
}
```

如上述代码所示，必须将ConfigureAwait(false>应用于等待的每个Task对象。这是由于异
步操作可能同步完成，而且在发生这个情况时，调用线程直接继续执行，不会返回至它的调用；你根本不知道哪个操作要求忽略SynchronizationContext对象，所以只能要求所 有操作都忽略它。这还意味着类库代码不能依赖于任何特定的应用程序模型。另外，也可 像下面这样重写GetHttp方法，用一个线程池线程执行所有操作。

```c#
private Task<String> GetHttp() { 
	return Task.Run(async ()=> {
		//运行一个无SynchronizationContext的线程池线程
		HttpResponseMessage msg = await new HttpClient () .GetAsync ("http://Wintellect.com/"); //这里的代码真的能执行，因为某个线程池线程能执行这里的代码
		return await msg.Content.ReadAsStringAsync();
	});
}
```

在这个版本中，注意，GetHttp不再是异步函数；我从方法签名中删除了 async关键字， 因为方法中没有了 await操作符。但是，传给Task.Run的lambda表达式是异步函数。

### 以异步方式实现服务器

根据我多年来和开发人员的交流经验，发现很少有人知道.NET Framework其实内建了对伸 缩性很好的一些异步服务器的支持。本书限制篇幅无法一一解释，但可以列出MSDN文档中值得参考的地方。

>* 要构建异步ASP.NET Web窗体，在.aspx文件中添加Async="true”网页指令，并参考 System.Web.UI.Page 的 RegisterAsyncTask 方法。
>* 要构建异步ASP.NET MVC控制器，使你的控制器类从System.Web.Mvc.AsyncController 派生，让操作方法返回一个Task<ActionResult>即可。
>* 要构建异步ASP.NET处理程序，使你的类从System.Web.HttpTaskAsyncHandler派 生，重写其抽象ProcessRequestAsync方法。
>* 要构建异步WCF服务，将服务作为异步函数实现，让它返回Task或Task<TResult>。

### 取消I/O操作

Windows—般没有提供取消未完成I/O操作的途径。这是许多开发人员都想要的功能，实 现起来却很困难。毕竟，如果向服务器请求了 1000个字节，然后决定不再需要这些字节， 那么其实没有办法告诉服务器忘掉你的请求。在这种情况下，只能让字节照常返回，再将 它们丢弃。此外，这里还会发生竟态条件——取消请求的请求可能正好在服务器发送响应 的时候到来。这时应该怎么办？所以.要在代码中处理这种潜在的竞态条件，决定是丢弃还是使用数据。

为此，我建议实现一个WithCancellation扩展方法来扩展Task<TResult>(需要类似的重载 版本来扩展Task)，如下所示：

```c#
private struct Void { } // 因为没有非泛型的 TaskCompletionSource 类

private static async Task<TResult> WinhCanceilation<TResuIt>(this Task<TResuit> originalTask,CancellationToken ct) {
	//创逑在CancellationToken被取消时完成的一个Task var cancelTask = new TaskCompletionSource<Void>();
	// 一且 CancellationToken 被取梢》就完成 Task 
	using (ct.Register(t => ((TaskCompletionSource<Void>)t).TrySetResult(new Void()) , cancelTask)) {
		
		// 创违在原始Task或CancellationToken Task完成时都完成的一个Task 
		Task any = await Task.WhenAny(originalTask, cancelTask.Task);
		
		// 任何 Task 因为 CancellationToken 而完成.就抛出 OperationCanceledException 
		if (any == cancelTask.Task) ct.ThrowlfCancellationRequested();
	}
	
	//等待原始任务（以同步方式若任务失败•等待它将抛出第一个内部异常，
	// 而不是抛出 AggregateException 
	return await originalTask;
}
```

现在可以像下面这样调用该扩展方法。

```c#

public static async Task Go() {
	//创建一个CancellationTokenSource,它在#毫秒后取消自己
	var cts = new CancellationTokenSource (5000) ; // 更快取消需调用 cts .Cancel <()
	var ct = cts.Token;
	
	try {
		//我用TasJc.Delay进行测试：把它锊换成返回一个Task的其他疔法
	await Task.Delay(10000).WithCancellation(ct);
	Console.WriteLine("Task completed0);
	}
	catch (OperationCanceledException) {
	Console.WriteLine("Task cancelled");
	}
}


### 有的I/O操作必须同步进行
Win32 API提供了许多丨/O函数。遗憾的是，有的方法不允许以异步方式执行I/O。例如， Win32 CreateFile方法(由FileStream的构造器调用)总是以同步方式执行。试图在网络服务 器上创建或打开文件，可能要花数秒时间等待CreateFile方法返回——在此期间，调用线 程一直处于空闲状态。理想情况下，注重性能和伸缩性的应用程序应该调用一个允许以异 步方式创建或打幵文件的Win32函数，使线程不至于傻乎乎地等着服务器响应。遗憾的是， Win32没有提供一个允许这样做且功能和CreateFile相同的函数，因此，FCL不能以异步 方式高效地打开文件=另外，Windcms也没有提供函数以异步方式访问注册表、访问事件 日志、获取目录的文件/子目录或者更改文件/目录的属性等等。

下例说明某些时候这真的会造成问题。假定要写一个简单的U丨允许用户输入文件路径，并 提供自动完成功能(类似于通用“打幵”对话框)。控件必须用单独的线程枚举目录并在其 中查找文件，因为Windows没有提供任何现成的函数来异步地枚举文件。当用户继续在 UI控件中输入时，必须使用更多的线程，并忽略之前创建的任何线程的结果。从Windows Vista 起，Microsoft 引入了一个名为 CancelSynchronousIO 的 Win32 函数。它允许一个线 程取消正在由另一个线程执行的同步I/O操作。FCL没有公开该函数，但要在用托管代码 实现的桌面应用程序中利用它，可以P/lnvoke它。本章下一节将展示它的P/lnvoke签名.

我想强调的一个重点是，虽然许多人认为同步API更易使用(许多时候确实如此)，但某些 时候同步API会使局面变得更难。

考虑到同步I/O操作的各种问题，在设计Windows Runtime的时候，Windows团队决定公 开以异步方式执行I/O的所有方法。所以，现在可以用一个Windows Runtime API来异步 地打开文件了，详情参见Windows.Storage.StorageFile的OpenAsync方法。事实上，
Windows Runtime没有提供以同步方式执行丨/O操作的任何API。幸好，可以使用C#的异 步函数功能简化调用这些API时的编码。

FileStream特有的问题

创建FileStream对象时，可通过FileOptions.Asynchronous标志指定以同步还是异步方式 进行通信。这等价于调用Win32 CreateFile函数并传递FlLE_FLAG_OVERLAPPED标志。
如果不指定这个标志，Windows以同步方式执行所有文件操作《当然，仍然可以调用 FileStream的ReadAsync方法。对于你的应用程序，操作表面上异步执行，但FileStream
类是在内部用另一个线程模拟异步行为。这个额外的线程纯属浪费，而且会影响到性能。 另一方面，可在创建FileStream对象时指定FileOptions.Asynchronous标志。然后，可以 调用FileStream的Read方法执行一个同步操作。在内部，FileStream类会幵始一个异步 操作，然后立即使调用线程进入睡眠状态，直至操作完成才会唤醒，从而模拟同步行为。 这同样效率低下。但相较于不指定FileOptlons.Asynchronous标志来构造一个FileStream 并调用ReadAsync，它的效率还是要高上那么一点点的。

总之，使用FileStream时必须先想好是同步还是异步执行文件I/O,并指定(或不指 定)FileOptions.Asynchronous标志来指明自己的选择。如果指定了该标志，就总是调用 ReadAsync。如果没有指定这个标志，就总是调用Read。这样可以获得最佳的性能。如果 想先对FileStream执行一些同步操作，再执行一些异步操作，那么更高效的做法是使用 FileOptlons.Asynchronous标志来构造它。另夕卜，也可针对同一个文件创建两个FileStream 对象；打幵一个FileStream进行异步1/0，打幵另一个FileStream进行同步I/O。注意， System.IO.FiIe 类提供了辅助方法(Create, Open 和 Open Write)来创建并返回 FileStream 对象。但所有这些方法都没有在内部指定FileOptlons.Asynchronous标志，所以为了实现 响应灵敏的、可伸缩的应用程序，应避免使用这些方法。

还要注意，NTFS文件系统设备驱动程序总是以同步方式执行一些操作，不管具体如何打 幵文件。详情参见 http://support.micwsoft.com/(]efault.aspx?scid=kb%3Berhus%3B156932。


###I/O请求优先级

“线程基础”介绍了线程优先级对线程调度方式的影响。然而，线程还要执行I/O 请求以便从各种硬件设备中读写数据。如果一个低优先级线程获得了 CPU时间，它可以在 非常短的时间里轻易地将成百上千的I/O请求放入队列。由于I/O请求一般需要时间来执 行，所以一个低优先级线程可能挂起高优先级线程，使后者不能快速完成工作，从而严重 影响系统的总体响应能力。正是由于这个原因，当系统执行一些耗时的低优先级服务时(比 如磁盘碎片整理程序、病毒扫描程序、内容索引程序等)，机器的响应能力可能会变得非常差。

Windows允许线程在发出I/O请求时指定优先级。遗憾的是，FCL 还没有 包含这个功能：但未来的版本有望添加。如果现在就想使用这个功能，可以采取P/Invoke 本机Win32函数的方式。以下是P/lnvoke代码：

```c#
internal static class ThreadIO {
	public static BackgroundProcessingDisposer BeginBackgroundProcessing(Boolean process = false) {
		ChangeBackgroundProcessing(process, true); 
		return new BackgroundProcessingDisposer(process);
	}
	
	public static void EndBackgroundProcessing(Boolean process = false) { 
		ChangeBackgroundProcessing(process,false);
	}
	
	private static void ChangeBackgroundProcessing(Boolean process, Boolean start) { 
		Boolean ok = process 
		? SetPrioxityClass(GetCurrentWin32ProcessHandle (),start ? ProcessBackgroundMode.Start : ProcessBackgroundMode.End) :SetThreadPriority(GetCurrentWin32ThreadHandle().start ? ThreadBackgroundgMode.Start : ThreadBackgroundgMode.End); 
		if (!ok) throw new Win32Exception();
	}
	
	//这个结构使C#的using语句能终土后台处碑模式
	public struct BackgroundProcessingDisposer : IDisposable { 
		private readonly Boolean m_process;
		public BackgroundProcessingDisposer(Boolean process) { m__process = process; } 
		public void Dispose() { EndBackgroundProcessing(m_process); }
	}

	// 参见 Win32 的 THREAD_MODE_BACKGROUND_BEGIN 和 THREAD_MODE_BACKGROUND_END 
	private enum ThreadBackgroundgMode { Start = 0x10000, End = 0x20000 }
	
	// 参见 Win32 的 PROCESS_MODE_BACKGROUND_BEGIN 和 PROCESS_MODE_BACKGROUND_END 
	private enum ProcessBackgroundMode { Start = 0x100000, End = 0x200000 }
	
	[DllImport("Kernel32", Entrypoint = "GetCurrentProcess", ExactSpelling = true)] 
	private static extern SafeWaitHandle GetCurrentWin32ProcessHandle ();
	
	[DllImport("Kernel32"/ ExactSpelling = true, SetLastError = true)]
	[return: MarshalAs(UnmanagedType.Bool)] 
	private static extern Boolean SetPriorityClass(SafeWaitHandle hprocess, ProcessBackgroundMode mode);

	[DiiImport("Kernel32", EntryPoint = "GetCurrentThread", ExactSpelling = true)] 
	private static extern SafeWaitHandle GetCurrentWin32ThreadHandle();
	
	[DllImport ("Kernel32", ExactSpelling = true, SetLastError = true)]
	[return: MarshalAs(UnmanagedType.Bool)] 
	private static extern Boolean SetThreadPriority(SafeWaitHandle hthread, ThreadBackgroundgMode mode);
	
	// http://msdn.microsoft.com/en-us/library/aa480216.aspx
	[Dlllmport(MKerne132", SetLastError = true, EntryPoint = "CancelSynchronousIo")] 
	[return: MarshalAs(UnmanagedType.Bool)]
	private static extern Boolean CancelSynchronousIO(SafeWaitHandle hThread); 

}
```

以下代码展示了如何使用它 

```c#
static void Main () {
	using(ThreadIO.BeginBackgroundProcessing()) {
		//在这里执行低优先级I/O请求（例如：调用ReadAsync/WriteAsync)
	}
}
```

要调用ThreadIO的BeginBackgroundProcessing方法，告诉Windows你的线程要发出低
优先级I/O请求。注意，这同时会降低线程的CPU调度优先级。可调用 EndBackgroundProcessing ,或者在 BeginBackgroundProcessing 返回的值上调用 Dispose如以上C#的using语句所示)，使线程恢复为发出普通优先级的I/O请求(以及普通的CPU调度优先级。线程只能影响它自己的后台处理模式；Windows不允许线程更改另
一个线程的后台处理模式。

如果希望一个进程中的所有线程都发出低优先级I/O请求和进行低优先级的CPU调度，可 调用BeginBackgroundProcessing,为它的process参数传递true值。一个进程只能影响它
自己的后台处理模式；Windows不允许一个线程更改另一个进程的后台处理模式。











