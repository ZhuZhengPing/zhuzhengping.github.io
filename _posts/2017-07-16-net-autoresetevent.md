---
layout: post
title:  "AutoResetEvent 类"
date:   2017-07-16 16:32:18 +0800
categories: .net
tags: .net 多线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

AutoResetEvent 允许线程通过发信号互相通信。 通常，当线程需要独占访问资源时使用该类。

线程通过调用 AutoResetEvent 上的 WaitOne 来等待信号。 如果 AutoResetEvent 为未触发状态，则线程会被阻止，并等待当前控制资源的线程通过调用 Set 来通知资源可用。

调用 Set 向 AutoResetEvent 发信号以释放等待线程。 当AutoResetEvent被设置为已触发状态时，它将一直保持已触发状态直到一个等待的线程被激活，然后它将自动变成未触发状态。 如果没有任何线程在等待，则状态将无限期地保持为已触发状态。

如果当 AutoResetEvent 为已触发状态时线程调用 WaitOne，则线程不会被阻止。 AutoResetEvent 将立即释放线程并返回到未触发状态。









#### 重要事项

不能保证对 Set 方法的每次调用都释放线程。 如果两次调用十分接近，以致在线程释放之前便已发生第二次调用，则只释放一个线程。 就像第二次调用并未发生一样。 另外，如果在调用 Set 时不存在等待的线程且 AutoResetEvent 已终止，则该调用无效。

可以通过将一个布尔值传递给构造函数来控制 AutoResetEvent 的初始状态：如果初始状态为终止状态，则为 true；否则为 false。

AutoResetEvent 也可以同 staticWaitAll 和 WaitAny 方法一起使用。


#### 注意

>* 与 AutoResetEvent 类不同的是，EventWaitHandle 类提供对已命名的系统同步事件的访问。
>* 应用到此类型或成员的 HostProtectionAttribute 特性具有以下 Resources 属性值：Synchronization  ExternalThreading。HostProtectionAttribute 不影响桌面应用程序（桌面应用程序一般通过双击图标、键入命令或在浏览器中输入 URL 启动）。有关更多信息，请参见 HostProtectionAttribute 类或 SQL Server 编程和宿主保护特性。

#### 示例

下面的示例演示如何通过（对基类）调用 Set 方法使用 AutoResetEvent 一次释放一个线程，每次用户需按 “Enter” 键。 该示例将启动三个线程，这些线程等待终止状态中的已创建的 AutoResetEvent。 由于 AutoResetEvent 已处于终止状态，所以立即释放第一个线程。 这将重置 AutoResetEvent 为非信号状态，从而随后的线程阻塞。 被阻止的线程只能让用户通过按下“输入”键一个个的释放。

这些线程从第一个　AutoResetEvent　中释放后，它们等待在非终止状态中创建的其他　AutoResetEvent。 所有三个线程阻止，所以必须调用 Set 方法三次以将其释放。

```c#
using System;
using System.Threading;

// Visual Studio: Replace the default class in a Console project with 
//                the following class.
class Example
{
    private static AutoResetEvent event_1 = new AutoResetEvent(true);
    private static AutoResetEvent event_2 = new AutoResetEvent(false);

    static void Main()
    {
        Console.WriteLine("Press Enter to create three threads and start them.\r\n" +
                          "The threads wait on AutoResetEvent #1, which was created\r\n" +
                          "in the signaled state, so the first thread is released.\r\n" +
                          "This puts AutoResetEvent #1 into the unsignaled state.");
        Console.ReadLine();

        for (int i = 1; i < 4; i++)
        {
            Thread t = new Thread(ThreadProc);
            t.Name = "Thread_" + i;
            t.Start();
        }
        Thread.Sleep(250);

        for (int i = 0; i < 2; i++)
        {
            Console.WriteLine("Press Enter to release another thread.");
            Console.ReadLine();
            event_1.Set();
            Thread.Sleep(250);
        }

        Console.WriteLine("\r\nAll threads are now waiting on AutoResetEvent #2.");
        for (int i = 0; i < 3; i++)
        {
            Console.WriteLine("Press Enter to release a thread.");
            Console.ReadLine();
            event_2.Set();
            Thread.Sleep(250);
        }

        // Visual Studio: Uncomment the following line.
        //Console.Readline();
    }

    static void ThreadProc()
    {
        string name = Thread.CurrentThread.Name;

        Console.WriteLine("{0} waits on AutoResetEvent #1.", name);
        event_1.WaitOne();
        Console.WriteLine("{0} is released from AutoResetEvent #1.", name);

        Console.WriteLine("{0} waits on AutoResetEvent #2.", name);
        event_2.WaitOne();
        Console.WriteLine("{0} is released from AutoResetEvent #2.", name);

        Console.WriteLine("{0} ends.", name);
    }
}

/* This example produces output similar to the following:

Press Enter to create three threads and start them.
The threads wait on AutoResetEvent #1, which was created
in the signaled state, so the first thread is released.
This puts AutoResetEvent #1 into the unsignaled state.

Thread_1 waits on AutoResetEvent #1.
Thread_1 is released from AutoResetEvent #1.
Thread_1 waits on AutoResetEvent #2.
Thread_3 waits on AutoResetEvent #1.
Thread_2 waits on AutoResetEvent #1.
Press Enter to release another thread.

Thread_3 is released from AutoResetEvent #1.
Thread_3 waits on AutoResetEvent #2.
Press Enter to release another thread.

Thread_2 is released from AutoResetEvent #1.
Thread_2 waits on AutoResetEvent #2.

All threads are now waiting on AutoResetEvent #2.
Press Enter to release a thread.

Thread_2 is released from AutoResetEvent #2.
Thread_2 ends.
Press Enter to release a thread.

Thread_1 is released from AutoResetEvent #2.
Thread_1 ends.
Press Enter to release a thread.

Thread_3 is released from AutoResetEvent #2.
Thread_3 ends.
 */
```

CLR via C# 中的示例

```c#
public sealed class AClass
{
	public static void UsingLocal(Int32 numToDo)
	{
		// 一些局部变量
		Int32[] squares = new Int32[numToDo];
		AutoResetEvent done = new AutoResetEvent(false);

		// 在其他线程上执行一系列任务
		for (Int32 n = 0; n < squares.Length; n++)
		{
			ThreadPool.QueueUserWorkItem(
				obj =>
				{
					Int32 num = (Int32)obj;

					// 该任务通常更耗时
					squares[num] = num * num;

					// 如果是最后一个任务，就让主线程继续运行
					if (Interlocked.Decrement(ref numToDo) == 0)
					{
						done.Set();
					}
				}, n);
		}

		// 等待其他所有线程结束运行
		done.WaitOne();

		// 显示结果
		for (Int32 n = 0; n < squares.Length; n++)
		{
			Console.WriteLine("Index {0},Square={1}",n,squares[n]);
		}
	}
}
```

#### AutoResetEvent 构造函数

用一个指示是否将初始状态设置为终止的布尔值初始化 AutoResetEvent 类的新实例。

下面的示例使用 AutoResetEvent 同步两个线程的活动。 第一个线程为应用程序线程，用于执行 Main。 它将值写入受保护的资源，即名为 number 的 static（在 Visual Basic 中为 Shared）字段。 第二个线程执行静态 ThreadProc 方法，此方法读取由 Main 写入的值。

ThreadProc 方法等待 AutoResetEvent。 当 Main 在 AutoResetEvent 中调用 Set 方法时，ThreadProc 方法将读取一个值。 AutoResetEvent 立即重置，因此 ThreadProc 方法将再次等待。

程序逻辑可确保 ThreadProc 方法永远不会两次读取同一个值。 它并不确保 ThreadProc 方法将读取由 Main 写入的每一个值。 要确保这一点，则要求具有第二个 AutoResetEvent 锁定

在每一次写入操作之后，需要调用 Thread.Sleep 方法才能生成 Main，以便第二个线程可以执行。 否则，在单处理器计算机上，Main 将在任意两个读取操作之间写入许多值。

```c#
using System;
using System.Threading;

namespace AutoResetEvent_Examples
{
	class MyMainClass
	{
		//Initially not signaled.
      const int numIterations = 100;
      static AutoResetEvent myResetEvent = new AutoResetEvent(false);
      static int number;

      static void Main()
		{
         //Create and start the reader thread.
         Thread myReaderThread = new Thread(new ThreadStart(MyReadThreadProc));
         myReaderThread.Name = "ReaderThread";
         myReaderThread.Start();

         for(int i = 1; i <= numIterations; i++)
         {
            Console.WriteLine("Writer thread writing value: {0}", i);
            number = i;

            //Signal that a value has been written.
            myResetEvent.Set();

            //Give the Reader thread an opportunity to act.
            Thread.Sleep(1);
         }

         //Terminate the reader thread.
         myReaderThread.Abort();
      }

      static void MyReadThreadProc()
      {
         while(true)
         {
            //The value will not be read until the writer has written
            // at least once since the last read.
            myResetEvent.WaitOne();
            Console.WriteLine("{0} reading value: {1}", Thread.CurrentThread.Name, number);
         }
      }
	}
}
```








