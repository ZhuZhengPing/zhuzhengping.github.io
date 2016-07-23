---
layout: post
title:  "委托和事件"
date:   2016-07-09 16:32:18 +0800
categories: .net
tags: 委托 .net
author: Zhengping Zhu
---

* content
{:toc}

## 概念

委托类型包含3个重要的信息

>* 它所调用的方法名称
>* 该方法的参数(可选)
>* 该方法的返回值(可选)

当一个委托对象提供上述信息后，它可以在运行时动态指向其他方法。可以看到.net Framework中每个委托(包括自定义委托)都被自动赋予同步或异步访问方法的能力，可以不用手工创建与管理一个Thread对象而直接调用另一个辅助执行线程上的方法，这大大简化了编程工作。






### 在C#中定义委托类型

创建委托类型，需要使用delegate关键字。例如我们下面创建的委托

```c#
public delegate int BinaryOp(int x,int y);
```

如果我们通过ildasm.exe来查看`BinaryOp`委托，我们可以发现上述委托产生了3个方法。`Invoke()`方法是核心方法，它被用来以同步的方式调用委托对象维护每个方法。

<img src="http://ww1.sinaimg.cn/mw690/006dag38gw1f5pukr2zd5j30lo07e755.jpg" style="width:100%" />

`BeginInvoke()`和`EndInvoke`方法能在第二个执行线程上异步调用当前方法。

```c#
sealed class BinaryOp:System.MulticastDelegate
{
	public int Invoke(int x,int y);
	public IAsyncResult BeginInvoke(int x,int y,AsyncCallback cb,object state);
	public int EndInvoke(IAsyncResult result);
}
```

我们看下另外一个例子，如果我们定义了下面的委托

```c#
public delegate string MyDelegate(bool a, bool b,bool c);
```

这一次解析为

```c#
sealed class MyDelegate:System.MulticastDelegate
{
	public string Invoke(bool a,bool b,bool c);
	public IAsyncResult BeginInvoke(bool a,bool b,bool c,AsyncCallback cb,object state);
	public string EndInvoke(IAsyncResult result);
}
```

委托还可以指向包含任意数量out或ref参数(以及用params关键字标记的数组参数)的方法。例如，假设有委托类型如下：

```c#
public delegate string MyOtherDelegate(out bool a,ref bool b,int c);
```

Invoke()与BeginInvoke()方法的签名将不出所料，但EndInvoke()方法稍有变化，其中包括委托类型定义的所有的out/ref参数:

```c#
sealed class MyOtherDelegate:System.MulticastDelegate
{
	public string Invoke(out bool a,ref bool a,ref bool b,int c,AsyncCallback cb,object state);
	public string EndInvoke(out bool a,ref bool b,IAsyncResult result);
}
```

### System.MulticastDelegate与System.Delegate基类

使用C#中delegate关键字创建委托的时候，也就间接声明了一个派生自System.MulticastDelegate的类。

```c#
public abstract class MulticastDelegate:Delegate
{
	// 返回所指向的方法列表
	public sealed override Delegate[] GetInvocationList();
	
	// 重载的操作符
	public static bool operator ==(MulticastDelegate d1,MulticastDelegate d2);
	public static bool operator !=(MulticastDelegate d1,MulticastDelegate d2);
	
	// 用来在内部管理委托所维护的方法列表
	private IntPtr _invocationCount;
	private object _invocationList;
}
```

System.MulticastDelegate从它的父类System.Delegate继承了更多功能，下面是父类的部分定义

```c#
public abstract class Delegate:ICloneable,ISerializable
{
	// 与函数列表交互的方法
	public static Delegate Combine(params Delegate[] delegates);
	public static Delegate Combine(Delegate a,Delegate b);
	public static Delegate Remove(Delegate source,Delegate value);
	public static Delegate RemoveAll(Delegate source,Delegate value);
	
	// 重载的操作符
	public static bool operator ==(Delegate d1,Delegate d2);
	public static bool operator !=(Delegate d1,Delegate d2);
	
	// 扩展委托目标的属性
	public MethodInfo Method{get;}
	public object Target{get;}
}
```

要记住，我们永远不会直接派生自这些基类。然而，如果我们使用delegate关键字，就间接创建一个类，这个类是MulticastDelegate,下图列举了所有委托类型共有的核心成员

继承成员		|		作用
Method			|此属性返回System.Reflection.MethodInfo对象，用以表示委托维护的静态方法的详细信息
Target		|如果方法调用是定义在对象级别的(而不是静态方法)，Target返回表示委托维护的方法的对象。如果Target返回值为null,调用的方法是一个静态成员
Combine()		|此静态方法给委托维护的列表添加一个方法。在C#中，使用重载+=操作符作为简化符号调用此方法
Remove()，RemoveAll()		|这些静态方法从调用列表中移除一个(或所有)方法，在C#中，Remove()方法可通过使用重载-=操作符来调用

### 最简单的委托示例

```c#
namespace CTest
{
    // 这个委托可以指向任何传入两个整数并返回一个整数的方法
    public delegate int BinaryOp(int x, int y);

    // 这个类包含了BinaryOp将指向的方法
    public class SimpleMath
    {
        public static int Add(int x, int y)
        {
            return x + y;
        }
        public static int Subtract(int x, int y)
        {
            return x - y;
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("******  Simple Delegate example  *****");

            // 创建一个指向SimpleMath.Add()方法的BinaryOp对象
            BinaryOp b = new BinaryOp(SimpleMath.Add);

            // 使用委托对象间接调用Add()方法
            Console.WriteLine("10 + 10 is {0}",b(10,10));
            Console.ReadLine();
        }
    }
}
```

还要注意的是BinaryOp委托类型的格式，它指向任何一个带有两个整数参数并返回一个整数的方法。因此，我们可以创建一个名为SimpleMath的类，其中定义了两个完全匹配的静态方法

如果要讲目标对象方法插入指定的委托对象，只要向委托的构造函数传入方法名即可。

```c#
public delegate int BinaryOp(int x, int y);
```

这时，我们可以使用类似直接调用的语法调用指向成员

```c#
// Invoke()在这里被调用
Console.WriteLine("10 + 10 is {0}",b(10,10));
```

在底层，运行库实际上在MulticastDelegate派生类上调用了编译器生成的Invoke()方法。

```c#
.method private hidebysig static void Main(string[] args) cil managed
{
	...callvirt instance int32 SimpleDelegate.BinaryOp::Invoke(int32,int32)
}
```

尽管C#不需要我们在代码库中显示调用Invoke(),但是我们也可以这么做。

```c#
// Invoke()在这里被调用
Console.WriteLine("10 + 10 is {0}",b.Invoke(10,10));
```

### 委托对象

让我们在Program类中创建一个名为DisplayDelegateInfo的静态方法来丰富当前的示例

```c#
class Program
{
	static void Main(string[] args)
	{
		SimpleMath math = new SimpleMath();

		// 创建一个指向SimpleMath.Add()方法的BinaryOp对象
		BinaryOp b = new BinaryOp(math.Add);

		DisplayDelegateInfo(b);

		Console.ReadLine();
	}

	static void DisplayDelegateInfo(Delegate delObj)
	{
		// 输出委托调用列表中每个成员的名称
		foreach (Delegate d in delObj.GetInvocationList())
		{
			Console.WriteLine("Method Name: {0}", d.Method);
			Console.WriteLine("Type Name: {0}", d.Target);
		}
	}
}
```

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f5qafu3pl1j309r02eaa3.jpg" style="width:60%" />

### 使用委托发送对象状态通知

为了实现更现实的委托应用，我们使用委托来定义Car类，它可以通知外部实体当前引擎的状态。下面是我们要进行的步骤。

>* 定义将通知发送给调用者的委托类型。
>* 声明Car类中每个委托类型的成员变量。
>* 在Car上创建辅助函数使调用者能指定由委托成员变量保存的方法。
>* 修改Accelerate()方法以在适当情形下调用委托的调用列表。

```c#
public class Car
{
	// 内部状态数据
	public int CurrentSpeed { get; set; }
	public int MaxSpeed { get; set; }
	public string PetName { get; set; }

	// 汽车能用还是不能用
	private bool carIsDead;

	// 类构造函数
	public Car() { MaxSpeed = 100; }
	public Car(string name, int maxSp, int currSp)
	{
		CurrentSpeed = currSp;
		MaxSpeed = maxSp;
		PetName = name;
	}
}
```

现在，考虑如下对Car类的更新

```c#
public class Car
{
	...
	// 1)定义委托类型
	public delegate void CarEngineHandler(string msgForCaller);
	
	// 2) 定义每个委托类型的成员变量
	private CarEngineHandler listOfHandlers;
	
	// 3) 向调用者添加注册函数
	public void RegisterWithCarEngine(CarEngineHandler methodToCall)
	{
		listOfHandlers = methodToCall;
	}
}
```

在这里，我们需要创建Accelerate()方法。

```c#
public void Accelerate(int delta)
{
	// 如果汽车不能用了，触发引爆事件
	if (carIsDead)
	{
		if (listOfHandlers != null)
			listOfHandlers("Sorry,this car is dead...");
	}
	else
	{
		CurrentSpeed += delta;

		// 快不能用了吗
		if (10 == (MaxSpeed - CurrentSpeed) && listOfHandlers != null)
		{
			listOfHandlers("Careful buddly ! Gonna blow!");
		}
		if (CurrentSpeed >= MaxSpeed)
			carIsDead = true;
		else
			Console.WriteLine("CurrentSpeed = {0}", CurrentSpeed);
	}
}
```

重新写Main方法

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		// 首先，创建一个Car对象
		Car c1 = new Car("SlugBug", 100, 10);

		// 现在，告诉汽车，它想要向我们发送信息时调用哪个方法
		c1.RegisterWithCarEngine(new Car.CarEngineHandler(OnCarEngineEvent));

		// 加速(这将触发事件)
		Console.WriteLine("**********  Speeding Up  *********");
		for (int i = 0; i < 6; i++) 
		{
			c1.Accelerate(20);    
		}

		Console.ReadLine();
	}

	public static void OnCarEngineEvent(string msg)
	{
		Console.WriteLine("\n********  Message From Car Object  **********");
		Console.WriteLine("=> {0}",msg);
		Console.WriteLine("*********************************\n");
	}
}
```

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f5qc4fxmqnj30fy07n3z4.jpg" style="width:60%" />

### 支持多路广播

一个委托对象可以维护一个可调用方法的列表而不只是单独的一个方法。给一个委托对象添加多个方法时，不能直接分配，重载+=操作符即可。为使Car类支持多路广播，可以修改RegisterWithCarEngine方法

```c#
public class Car{
	// 现在支持多路广播
	// 注意现在我们正在使用+=操作符，而不是赋值操作符
	public void RegisterWithCarEngine(CarEngineHandler methodToCall)
	{
		listOfHandlers += methodToCall;
	}
}
```

这样，调用者就可以为同样的回调注册多个目标对象了。这里，第二个处理程序以大写形式打印传入的消息，以供显示：

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		// 首先，创建一个Car对象
		Car c1 = new Car("SlugBug", 100, 10);

		// 现在，告诉汽车，它想要向我们发送信息时调用哪个方法
		c1.RegisterWithCarEngine(new Car.CarEngineHandler(OnCarEngineEvent));
		c1.RegisterWithCarEngine(new Car.CarEngineHandler(OnCarEngineEvent2));

		// 加速(这将触发事件)
		Console.WriteLine("**********  Speeding Up  *********");
		for (int i = 0; i < 6; i++) 
		{
			c1.Accelerate(20);    
		}

		Console.ReadLine();
	}

	public static void OnCarEngineEvent(string msg)
	{
		Console.WriteLine("\n********  Message From Car Object  **********");
		Console.WriteLine("=> {0}",msg);
		Console.WriteLine("*********************************\n");
	}

	public static void OnCarEngineEvent2(string msg)
	{
		Console.WriteLine("=> {0}", msg);
	}
}
```

根据CIL代码可以发现，+=操作符实际上转换为一个对静态Delegate.Combine()方法调用

### 从委托的调用列表中移除成员

Delegate类还定义了一个静态Remove()方法，允许调用者动态地从委托对象的调用中移除方法。这样，调用者就可以在运行时简单地“退订”某个已知的通知。

```c#
public class Car{
	public void UnRegisterWithCarEngine(CarEngineHandler methodToCall)
	{
		listOfHandlers -= methodToCall;
	}
}
```

-=语法是手工调用静态Delegate.Remove()方法的简写方式

这样改完Car类之后，再按如下修改Main(),就可以让第二个引擎停止接收引擎通知

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		// 首先，创建一个Car对象
		Car c1 = new Car("SlugBug", 100, 10);

		// 现在，告诉汽车，它想要向我们发送信息时调用哪个方法
		c1.RegisterWithCarEngine(new Car.CarEngineHandler(OnCarEngineEvent));

		Car.CarEngineHandler handle2 = new Car.CarEngineHandler(OnCarEngineEvent2);
		c1.RegisterWithCarEngine(handle2);

		// 加速(这将触发事件)
		Console.WriteLine("**********  Speeding Up  *********");
		for (int i = 0; i < 6; i++) 
		{
			c1.Accelerate(20);    
		}

		c1.UnRegisterWithCarEngine(handle2);
		for (int i = 0; i < 6; i++)
		{
			c1.Accelerate(20);
		}

		Console.ReadLine();
	}

	public static void OnCarEngineEvent(string msg)
	{
		Console.WriteLine("\n********  Message From Car Object  **********");
		Console.WriteLine("=> {0}",msg);
		Console.WriteLine("*********************************\n");
	}

	public static void OnCarEngineEvent2(string msg)
	{
		Console.WriteLine("=> {0}", msg);
	}
}
```

### 方法组转换语法

为了简化上述的操作，C#提供了一种叫做方法组转换的简便方法。该特性允许我们在调用以委托作为参数的方法时直接提供方法的名字，而不是创建委托对象。

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		// 首先，创建一个Car对象
		Car c1 = new Car("SlugBug", 100, 10);

		// 现在，告诉汽车，它想要向我们发送信息时调用哪个方法
		c1.RegisterWithCarEngine(CallMe);

		// 加速(这将触发事件)
		Console.WriteLine("**********  Speeding Up  *********");
		for (int i = 0; i < 6; i++) 
		{
			c1.Accelerate(20);    
		}

		c1.UnRegisterWithCarEngine(CallMe);
		for (int i = 0; i < 6; i++)
		{
			c1.Accelerate(20);
		}

		Console.ReadLine();
	}

	public static void CallMe(string msg)
	{
		Console.WriteLine("\n********  Message From Car Object  **********");
		Console.WriteLine("=> {0}",msg);
		Console.WriteLine("*********************************\n");
	}
}
```

注意，我们没有直接分配相关的委托对象，而是简单地指定了与委托期望的签名相匹配的方法。

### 委托斜变

我们之前创建的每个委托都返回简单的数字类型或者没有返回值，下面我们创建返回自定义类型的方法。

```c#
// 定义一个指向Car对象的方法委托
public delegate Car ObtainCarDelegate();

class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		ObtainCarDelegate targetA = new ObtainCarDelegate(GetBaseCar);
		Car c = targetA();
		Console.WriteLine("Obtained a {0}", c);
		Console.ReadLine();
	}

	public static Car GetBaseCar()
	{
		return new Car("Zippy", 100, 55);
	}
}
```

如果我们还有一个SportCar对象的方法，协变允许我们构建一个委托，能指向返回类及相关继承体系的方法。

```c#
public class SportCar : Car
{
}

// 定义一个指向Car对象的方法委托
public delegate Car ObtainCarDelegate();

class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		ObtainCarDelegate targetA = new ObtainCarDelegate(GetBaseCar);
		Car A = targetA();
		Console.WriteLine("Obtained a {0}", A);

		ObtainCarDelegate targetB = new ObtainCarDelegate(GetSportCar);
		SportCar B = targetB() as SportCar;
		Console.WriteLine("Obtained a {0}", B);
		Console.ReadLine();
	}

	public static Car GetBaseCar()
	{
		return new Car();
	}

	public static SportCar GetSportCar()
	{
		return new SportCar();
	}
}
```

### 泛型委托

假如我们希望定义一个委托类型来调用任何返回void并且接受单个参数的方法。如果这个参数可能会不同，我们就可以通过泛型参数来构建

```c#
public delegate void MyGenericDelegate<T>(T arg);

class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple Delegate example  *****");

		// 注册目标
		MyGenericDelegate<string> strTarget = new MyGenericDelegate<string>(StringTarget);
		strTarget("some xxxxxxx");


		MyGenericDelegate<int> intTarget = new MyGenericDelegate<int>(IntTarget);
		intTarget(8);

		Console.ReadLine();
	}

	static void StringTarget(string arg)
	{
		Console.WriteLine("arg in uppercase is :{0}",arg.ToUpper());
	}

	static void IntTarget(int arg)
	{
		Console.WriteLine("++arg is :{0}",arg);
	}
}
```

我们也可以把委托的参数改成 object 类型，这样不需要使用泛型也能模拟泛型操作，只是需要经过装箱拆箱的操作。

### event 关键字(事件)

为了简化自定义方法的构建来为委托调用列表增加和删除方法，C#提供了event关键字。在编译器处理event关键字的时候，它会自动提供注册和注销方法以及委托类型任何必要的成员变量。

为了演示event关键字，我们在Car类中定义两个事件 AboutBlow和Exploded这两个事件。

```c#
public class Car
{
	// 1)定义委托类型,用来与Car的事件协作
	public delegate void CarEngineHandler(string msg);

	// 这种汽车可以发送这些事件
	public event CarEngineHandler Exploded;
	public event CarEngineHandler AboutToBlow;
	...
}
```

向调用者发送一个事件，就如通过名称和相关联委托定义的必须参数来指定事件这么简单。为确保调用者注册事件，需要在调用委托的方法之前检查这个事件是否是无效的。

```c#
public void Accelerate(int delta)
{
	// 如果汽车不能用了，触发引爆事件
	if (carIsDead)
	{
		if (Exploded != null)
		{
			Exploded("Sorry, this car is dead...");
		}
	}
	else
	{
		CurrentSpeed += delta;

		// 快不能用了吗
		if (10 == (MaxSpeed - CurrentSpeed) && AboutToBlow != null)
		{
			AboutToBlow("Careful buddly ! Gonna blow!");
		}

		// 还好着呢
		if (CurrentSpeed >= MaxSpeed)
			carIsDead = true;
		else
			Console.WriteLine("CurrentSpeed = {0}", CurrentSpeed);
	}
}
```

### 解开事件的神秘面纱

C#事件事实上会扩展为两个隐藏的公共方法，一个带add_前缀，另一个带_remove前缀。下面是部分CIL代码

```c#
.method public hidebysig specialname instance void 
add_AboutToBlow(class CarEvents.Car/CarEngineHandler 'value')cil managed
{
	...
	call calss [mscorlib]System.Delegate
	[mscorlib]System.Delegate::Combine(class [mscorlib]System.Delegate, class [mscorlib] System.Delegate)
	...
}
```

可以想到，remove_AboutToBlow方法将间接调用Delegate.Remove()方法

### 监听传入的事件

C#事件也简化了注册调用者事件处理程序的操作。现在无需指定自定义辅助方法，调用者仅需使用+=和-=操作符即可(操作符将在后台触发正确的 add_XXX()或remove_XXX方法)。

我们下面重新修改main方法

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple event example  *****");

		Car car = new Car("zzp", 100, 20);

		// 注册事件处理程序
		car.AboutToBlow += new Car.CarEngineHandler(CarIsAlmostDoomed);
		car.AboutToBlow += new Car.CarEngineHandler(CarAboutToBlow);

		Car.CarEngineHandler d = new Car.CarEngineHandler(CarExploded);

		for (var i = 0; i < 16; i++)
		{
			car.Accelerate(20);
		}

		// 从调用列表中移除CarExploded方法
		car.Exploded -= d;

		Console.WriteLine("\n************  Speeding up  *************");

		for (int i = 0; i < 6; i++)
		{
			car.Accelerate(20);
		}

		Console.ReadLine();
	}

	public static void CarAboutToBlow(string msg)
	{
		Console.WriteLine(msg);
	}

	public static void CarIsAlmostDoomed(string msg)
	{
		Console.WriteLine("=> Critical message from car:{0}",msg);
	}

	public static void CarExploded(string msg)
	{
		Console.WriteLine(msg);
	}
}
```

为了进一步简化事件注册，可以使用方法组转换。

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple event example  *****");

		Car car = new Car("zzp", 100, 10);

		// 注册事件处理程序
		car.AboutToBlow += CarIsAlmostDoomed;
		car.AboutToBlow += CarAboutToBlow;
		car.Exploded += CarExploded;
		for (var i = 0; i < 6; i++)
		{
			car.Accelerate(20);
		}

		// 从调用列表中移除CarExploded方法
		car.Exploded -= CarExploded;

		Console.WriteLine("\n************  Speeding up  *************");

		for (int i = 0; i < 6; i++)
		{
			car.Accelerate(20);
		}

		Console.ReadLine();
	}

	public static void CarAboutToBlow(string msg)
	{
		Console.WriteLine(msg);
	}

	public static void CarIsAlmostDoomed(string msg)
	{
		Console.WriteLine("=> Critical message from car:{0}",msg);
	}

	public static void CarExploded(string msg)
	{
		Console.WriteLine(msg);
	}
}
```

### 创建自定义的事件参数

我们可以对Car类做最后一步改进，以符合微软推荐的事件模式。查看基础类库中某个类型发送的事件时，会发现底层委托的第一个参数是一个System.Object,第二个参数是一个派生自System.EventyArgs的子类型。

System.Object参数表示一个对发送事件的对象(例如Car对象)的引用，第二个参数则表示与该事件相关的信息。System.EventArgs基类表示一个不发送任何自定义信息的事件:

```c#
public class EventArgs
{
	public static readonly System.EventArgs Empty;
	public EventArgs();
}
```

对于简单的事件来说，我们可以直接传递一个EventArgs的实例。但如果要传递自定义数据，应该构建一个派生自EventArgs的类。

```c#
public class CarEventArgs : EventArgs
{
	public readonly string msg;
	public CarEventArgs(string message)
	{
		msg = message;
	}
}
```

这样，我们就可以修改CarEventHandler委托了

```c#
public class Car
{
	// 1)定义委托类型,用来与Car的事件协作
	public delegate void CarEngineHandler(object sender,CarEventArgs e);
	...
}
```

当在Accelerate()方法中触发我们的事件时，需要提供对当前Car对象的一个引用

```c#
public void Accelerate(int delta)
{
	// 如果汽车不能用了，触发引爆事件
	if (carIsDead)
	{
		if (Exploded != null)
		{
			Exploded(this,new CarEventArgs("Sorry, this car is dead..."));
		}
	}
...
}
```

在调用者，我们要做的就是修改事件处理程序来接收传入参数，并通过只读字段来获取消息

```c#
public static void CarAboutToBlow(object sender,CarEventArgs e)
{
	if(sender is Car)
	{
		Car c = sender as Car;
	   Console.WriteLine("{0} says: {1}",c.PetName,e.msg);
	}
}
```

### 泛型 EventHandler<T> 委托

由于很多自定义委托接收object作为第一个参数,EventArgs派生类型作为第二个参数，我们可以通过使用EventHandler<T>类型来进一步简化之前的示例，T就是自定义的EventArgs类型。考虑如下对Car类型的更新

```c#
public class Car
{
	// 这种汽车可以发送这些事件
	public event EventHandler<CarEventArgs> Exploded;
	public event EventHandler<CarEventArgs> AboutToBlow;
	...
}
```
	
Main()方法现在就可以在之前定义 CarEngineHandler 的任何地方使用 EventHandler<CarEventArgs>(这次又使用了方法组)

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple event example  *****");

		Car car = new Car("zzp", 100, 10);

		// 注册事件处理程序
		car.AboutToBlow += CarIsAlmostDoomed;
		car.AboutToBlow += CarAboutToBlow;
		EventHandler<CarEventArgs> d = new EventHandler<CarEventArgs>(CarExploded);
		car.Exploded += d;
		//car.Exploded += CarExploded;
		for (var i = 0; i < 6; i++)
		{
			car.Accelerate(20);
		}

		Console.ReadLine();
	}

	public static void CarAboutToBlow(object sender,CarEventArgs e)
	{
		if(sender is Car)
		{
			Car c = sender as Car;
		   Console.WriteLine("{0} says: {1}",c.PetName,e.msg);
		}
	}

	public static void CarIsAlmostDoomed(object sender, CarEventArgs e)
	{
		if (sender is Car)
		{
			Car c = sender as Car;
			Console.WriteLine("{0} says: {1}", c.PetName, e.msg);
		}
	}

	public static void CarExploded(object sender, CarEventArgs e)
	{if(sender is Car)
		{
			Car c = sender as Car;
		   Console.WriteLine("{0} says: {1}",c.PetName,e.msg);
		}
	}
}
```

### C#匿名方法

可以看到，当一个调用者想监听传进来的事件时，它必须定义一个唯一的与之相关联委托签名匹配的方法

```c#
class Program
{
	static void Main(string[] args)
	{
		SomeType t = new SomeType();

		// 假定"SomeDelegate"指向不带参数且无返回值的方法
		t.SomeEvent += new SomeDelegate(MyEventHandler);
	}

	public static void MyEventHandler() 
	{
		// 事件触发时执行某些操作
	}
}
```

MyEventHandler()这样的方法很少被委托之外的任何程序所调用。从生产效率的角度来说，手工定义一个由委托对象调用的方法显得有点繁琐

```c#
class Program
{
	static void Main(string[] args)
	{
		Console.WriteLine("******  Simple event example  *****");

		Car c1 = new Car("zzp", 100, 10);

		c1.AboutToBlow += delegate {
			Console.WriteLine("Eek! good to fast!");
		};

		c1.AboutToBlow += delegate(object sender, CarEventArgs e)
		{
			Console.WriteLine("Message from car: {0}",e.msg);
		};

		c1.Exploded += delegate(object sender, CarEventArgs e)
		{
			Console.WriteLine("Fatal message from car {0}",e.msg);
		};

		for (var i = 0; i < 6; i++)
		{
			c1.Accelerate(20);
		}

		Console.ReadLine();
	}
}
```

严格来讲，我们不需要接受由指定事件发送的传入参数。但如果想使用可能传入的参数，需要通过委托类型指定参数原型

```c#
c1.AboutToBlow += delegate(object sender, CarEventArgs e)
{
	Console.WriteLine("Message from car: {0}",e.msg);
};
```

### 访问本地变量

匿名方法能使我们访问它定义的方法的本地变量。这些变量称为匿名方法的外部变量。

>* 匿名方法不能访问定义方法中的ref或out参数
>* 匿名方法中的本地变量不能与外部方法中的本地变量重名
>* 匿名方法可以访问外部类作用域中的实例变量(或静态变量)

匿名方法内的本地变量可以与外部类的成员变量同名(本地变量的作用域不同，可以隐藏外部类的成员变量)








