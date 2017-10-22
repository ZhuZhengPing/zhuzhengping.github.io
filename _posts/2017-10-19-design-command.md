---
layout: post
title:  "命令模式"
date:   2017-10-19 16:32:18 +0800
categories: design
tags: design factory
author: Zhengping Zhu
---

* content
{:toc}

## 概念

命令模式属于对象的行为型模式。命令模式是把一个操作或者行为抽象为一个对象中，通过对命令的抽象化来使得发出命令的责任和执行命令的责任分隔开。命令模式的实现可以提供命令的撤销和恢复功能。

























### 命令模式的实现

现在，让我们以上面的军训的例子来实现一个命令模式，在实现之前，可以参考下命令模式的结构图来分析下实现过程。

军训场景中，具体的命令即是学生跑1000米，这里学生是命令的接收者，教官是命令的请求者，院领导是命令的发出者，即客户端角色。要实现命令模式，则必须需要一个抽象命令角色来声明约定，这里以抽象类来来表示。命令的传达流程是：

命令的发出者必须知道具体的命令、接受者和传达命令的请求者，对应于程序也就是在客户端角色中需要实例化三个角色的实例对象了。

命令的请求者负责调用命令对象的方法来保证命令的执行，对应于程序也就是请求者对象需要有命令对象的成员，并在请求者对象的方法内执行命令。

具体命令就是跑1000米，这自然属于学生的责任，所以是具体命令角色的成员方法，而抽象命令类定义这个命令的抽象接口。

有了上面的分析之后，具体命令模式的实现代码如下所示：

```c#
// 教官，负责调用命令对象执行请求
public class Invoke
{
	public Command _command;

	public Invoke(Command command)
	{
		this._command = command;
	}

	public void ExecuteCommand()
	{
		_command.Action();
	}
}

// 命令抽象类
public abstract class Command 
{
	// 命令应该知道接收者是谁，所以有Receiver这个成员变量
	protected Receiver _receiver;

	public Command(Receiver receiver)
	{
		this._receiver = receiver;
	}

	// 命令执行方法
	public abstract void Action();
}

// 
public class ConcreteCommand :Command
{
	public ConcreteCommand(Receiver receiver)
		: base(receiver)
	{ 
	}

	public override void Action()
	{
		// 调用接收的方法，因为执行命令的是学生
		_receiver.Run1000Meters();
	}
}

// 命令接收者——学生
public class Receiver
{
	public void Run1000Meters()
	{
		Console.WriteLine("跑1000米");
	}
}

// 院领导
class Program
{
	static void Main(string[] args)
	{
		// 初始化Receiver、Invoke和Command
		Receiver r = new Receiver();
		Command c = new ConcreteCommand(r);
		Invoke i = new Invoke(c);
		
		// 院领导发出命令
		i.ExecuteCommand();
	}
}
```

### UML图

<img src='http://wx2.sinaimg.cn/mw690/006dag38gy1fkqs4gkbeag30as072jr9.gif' style="display:block;width:550px;margin:0 auto;" />

#### 命令模式涉及到五个角色

>* 客户角色：发出一个具体的命令并确定其接受者
>* 命令角色：声明了一个给所有具体命令类实现的抽象接口
>* 具体命令角色：定义了一个接受者和行为的弱耦合，负责调用接受者的相应方法
>* 请求者角色：负责调用命令对象执行命令
>* 接受者角色：负责具体行为的执行

### 命令模式的适用场景

>* 系统需要支持命令的撤销（undo）。命令对象可以把状态存储起来，等到客户端需要撤销命令所产生的效果时，可以调用undo方法吧命令所产生的效果撤销掉。命令对象还可以提供redo方法，以供客户端在需要时，再重新实现命令效果。
>* 系统需要在不同的时间指定请求、将请求排队。一个命令对象和原先的请求发出者可以有不同的生命周期。意思为：原来请求的发出者可能已经不存在了，而命令对象本身可能仍是活动的。这时命令的接受者可以在本地，也可以在网络的另一个地址。命令对象可以串行地传送到接受者上去。
>* 如果一个系统要将系统中所有的数据消息更新到日志里，以便在系统崩溃时，可以根据日志里读回所有数据的更新命令，重新调用方法来一条一条地执行这些命令，从而恢复系统在崩溃前所做的数据更新。
>* 系统需要使用命令模式作为“CallBack(回调)”在面向对象系统中的替代。Callback即是先将一个方法注册上，然后再以后调用该方法。

### 命令模式的优缺点

#### 优点

>* 命令模式使得新的命令很容易被加入到系统里
>* 可以设计一个命令队列来实现对请求的Undo和Redo操作
>* 可以较容易地将命令写入日志
>* 可以把命令对象聚合在一起，合成为合成命令。合成命令式合成模式的应用

#### 缺点

>* 使用命令模式可能会导致系统有过多的具体命令类。这会使得命令模式在这样的系统里变得不实际





