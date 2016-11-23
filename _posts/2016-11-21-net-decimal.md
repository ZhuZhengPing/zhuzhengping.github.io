---
layout: post
title:  "动态类型和动态语言运行时"
date:   2016-11-21 16:32:18 +0800
categories: .net
tags: .net dynamic
author: Zhengping Zhu
---

* content
{:toc}

## 概念

.Net 4 为C#引入了一个新的关键字 dynamic。该关键字允许我们在强类型的分号和花括号之间使用脚本化的行为。使用这种松散的类型，可以极大地简化一些复杂的编码任务，而且还可以获得大量基于.NET的动态语言(如IronRuby、IronPython)交互的能力。








### dynamic 关键字的作用

使用 var 关键字可以定义一个本地变量，该变量的实际数据类型是在初次分配时确定的(称为隐式类型)。在初次分配后，实际上就变成了一个强类型，任何错误的赋值都会导致编译错误。

我们先创建一个名为 DynamicKeyword 的控制台应用程序。接下来，在 Program 类中创建下面的方法

```c#
static void ImplicitlyTypedVariable()
{
	// a为List<int>类型
	var a = new List<int>();
	
	// 编译时错误
	// a = "Hello";
}
```

隐式类型对 LINQ 来说非常有用，因为很多 LINQ 查询都会返回匿名类型的枚举，而这种匿名类无法在 C# 代码中直接声明。可是实际上，隐式变量实际上也就是强类型。

同样 System.Object 是 .net framework 的顶级父类，可以代表任何类型。那么如果声明了一个 object 类型的变量，就会得到一个强类型的数据，它指向的内存区域会因为引用的分配而有所不同。为了访问内存中该对象引用所指向的成员，需要进行显示转换。

假如有一个 Person 类，它包含两个类型为 string 的自动属性(FirstName 和 LastName)

```c#
static void UseObjectVarible()
{
	// 假设已经存在一个名为Person的类
	object o = new Person{FirstName="Mike",LastName="Larson"};
	
	// 要访问Person的属性，必须将object转换为Person
	Console.WriteLine("Person's first name is {0}",((Person)o).FirstName);
}
```

随着.NET 4的发布，C#语言现在支持一个新的关键字 dynamic，我们可以把任何值设置为动态数据类型，可以认为 dynamic 关键字是一个特殊形式的 System.Object。咋看上去，这似乎容易混淆，因为我们已经有了三种定义数据的方法

```c#
static void PrintThreeStrings()
{
	var s1 = "Greetings";
	object s2 = "From";
	dynamic s3 = "Minneapolis";
	
	Console.WriteLine("s1 is of type: {0}",s1.GetType());
	Console.WriteLine("s2 is of type: {0}",s2.GetType());
	Console.WriteLine("s3 is of type: {0}",s3.GetType());
}
```

将打印如下内容

```
s1 is of type: System.String
s2 is of type: System.String
s3 is of type: System.String
```

动态类型和隐私类型或者通过 System.Object 引用声明的类型有着巨大的不同，是因为动态类型不是强类型。对于C#编译器来说，通过 dynamic 关键字什么的数据点可以分配任意初始值，而且可以在其生命周期内重新分配任何行的值。

```c#
static void ChangeDynamicDataType()
{
	// 声明一个名为t的动态数据点
	dynamic t = "Hello";
	Console.WriteLine("t is of type: {0}",t.GetType());
	
	t=false;
	Console.WriteLine("t is of type: {0}",t.GetType());
	
	t=new List<int>();
	Console.WriteLine("t is of type: {0}",t.GetType());
}
```

```
t is of type: System.String
t is of type: System.Boolean
t is of type: System.Collections.Generic.List`1[System.Int32]
```

在这个过程中，上面的代码如果把变量 t 声明为 System.Object，那么编译过程和执行结果完全相同。

### 调用动态声明的数据的成员

动态数据类型可以在运行时代表任何类型，在语法上和其他的类型没有什么区别。但是，编译器不会检查你所指定成员的有效性，这个和 System.Object 定义的变量不同，直到运行时你才知道所调用的动态数据是否支持指定的成员，例如下面的代码可以通过编译。

```c#
static void InvokeMembersOnDynamicData()
{
	dynamic textData1 = "Hello";
	Console.WriteLine(textData1.ToUpper());
	
	// 下面的代码能通过编译
	Console.WriteLine(textData1.toupper());
	Console.WriteLine(textData1.Foo(10,"ee",DateTime.Now));
}
```

你可能注意到，textData1 为 string 类型，没有 toupper 和 Foo 方法，可是这已经符合了 C# 编译器的要求，不过在 Main()方法中调用方法时，会得到一个运行时错误

```
未处理的异常：Microsoft.CSharp.RuntimeBinder.RuntimeBinderException: 'string'不包含为'toupper'的定义。
```

### Microsoft.CSharp.dll 程序集的作用

创建C#项目时，会自动引用一个名为 Microsoft.CSharp.dll 的 .NET 4 程序集，并且只定义了一个命名空间(Microsoft.CSharp.RuntimeBinder)和两个类(RuntimeBinderException，RuntimeBinderInternalCompilerException)，RuntimeBinderException 是最普通的类，如果调用一个不存在的动态数据类型，就会抛出异常(比如调用 toupper()和Foo()方法)。

在调用 C# 的 dynamic 关键字声明的变量的成员时，可以用合适的 try/catch 块处理异常

```c#
static void InvokeMembersOnDynamicData()
{
	dynamic textData1 = "Hello";
	
	try{
		Console.WriteLine(textData1.ToUpper());
		Console.WriteLine(textData1.toupper());
		Console.WriteLine(textData1.Foo(10,"ee",DateTime.Now));
	}catch{
		Console.WriteLine(ex.Message);
	}
}
```

### dynamic 关键字的作用域

隐式类型数据只能作为一个成员范围内的本地变量。var 关键字不能用于返回值、参数或类/结构的成员。但对于 dynamic 关键字来说，这都不是问题。

```c#
class VeryDynamicClass
{
	// 动态字段
	private static dynamic myDynamicField;

	// 动态属性
	private dynamic DynamicProperty { get; set; }

	// 动态返回值类型和动态参数类型
	public dynamic DynamicMethod(dynamic dynamicParam)
	{
		// 动态本地变量
		dynamic dynamicLocalVar = "Local variable";

		int myInt = 10;

		if (dynamicParam is int)
		{
			return dynamicLocalVar;
		}
		else
		{
			return myInt;
		}
	}
}
```

### dynamic 关键字的限制

虽然 dynamic 关键字可以定义很多东西，但它使用起来也存在一些限制。在调用一个动态数据的方法时，不能使用 Lambda 表达式和 C# 匿名方法。 例如，即使目标方法的参数确实是一个值为 string 并 返回 void 的委托，可是厦门的代码还是会报错

```c#
dynamic a = GetDynamicObject();

// 错误！动态数据的方法不能使用 Lambda 表达式
a.Method(arg => Console.WriteLine(arg));
```

要避免这个限制，可以直接使用基本的委托。用 dynamic 关键字声明的变量不能用于 LINQ to Object 以及其他 LINQ 技术

```c#
dynamic a = GetDynamicObject();

// 错误！无法找到动态数据的 Select()扩展方法
var data = from d in a select d;
```

### dynamic 关键字的实际用途

动态类型不是强类型，无法进行编译时检查，不能触发智能感知并且无法进行 LINQ 查询。

但是在某些场合，dynamic 关键字可以减少手工输入的代码量。特别是构建一个需要大量使用反射的 .NET 应用程序时，dynamic 关键字可以节省大量打字时间。同样，构建一个需要与 COM 库进行交互的 .NET 应用程序，可以使用 dynamic 简化代码库。

### DLR 的作用

DLR 随着 .NET 4 一起发布，它是作为 CLR 的补充的运行时环境。动态运行时允许动态语言完全在运行时发现类型，而不是进行编译时检查。动态语言运行时提供了下面一些特性。

>* 及其灵活的代码库。在重构时不需要频繁修改数据类型。
>* 在不同平台和编程语言所创建的对象类型之间进行互操作非常简便。
>* 可以在运行时为内存中的类型添加或移除成员。

### 使用动态类型简化反射调用

下面是我们基本的反射实现

```c#
static void CreateUsingLateBinding(Assembly asm)
{
	try{
		// 获取 Minivan 类型的元数据
		Type miniVan = asm.GetType("CarLibrary.MiniVan");
		
		// 在运行时创建 Minivan 类型
		object obj = Activator.CreateInstance(miniVan);
		
		// 获取 TurboBoost 的信息
		MethodInfo mi = miniVan.GetMethod("TurboBoost");
		
		// 调用方法('null'代表没参数)
		mi.Invoke(obj,null);
	}catch{
		Console.WriteLine(ex.Message);
	}
}
```

现在我们使用 C# 的 dynamic 关键字和 DLR 来重写这个方法

```c#
 static void CreateUsingLateBinding(Assembly asm)
{
	try{
		// 获取 Minivan 类型的元数据
		Type miniVan = asm.GetType("CarLibrary.MiniVan");
		
		// 在运行时创建 Minivan 类型
		dynamic obj = Activator.CreateInstance(miniVan);
		obj.TurboBoost();
	}catch{
		Console.WriteLine(ex.Message);
	}
}
```

### 使用 dynamic 关键字传递参数

当你需要使用反射调用有参数的方法时，DLR的好处就更加明显了。使用反射调用时，需要将所有参数打包到一个 object 数组中，然后将这个数组传递给 MethodInfo 的 Invoke()方法。

新建一个类库项目 MathLibrary,创建一个 SimpleMath 类

```c#
public class SimpleMath
{
	public int Add(int x, int y)
	{
		return x + y;
	}
}
```

在编译 MathLibrary.dll 程序集时，将其复制一份到控制台应用程序的debug文件夹下。

<img src="http://ww4.sinaimg.cn/mw690/006dag38gw1fa1x8w8eblj30970a6ta3.jpg" alt="dynamic" style="width:50%" />

在控制台应用程序项目的 Program.cs 文件中引用 System.Reflection 命名空间。然后在 Program 类中添加如下方法。

```c#
private static void AddWithReflection()
{
	Assembly asm = Assembly.Load("MathLibrary");

	try
	{
		// 获取 SimpleMath 类型的元素
		Type math = asm.GetType("MathLibrary.SimpleMath");

		// 在运行时创建SimpleMath
		object obj = Activator.CreateInstance(math);

		// 获取Add方法的信息
		MethodInfo mi = math.GetMethod("Add");

		// 调用方法(包含参数)
		object[] args = { 10, 70 };
		Console.WriteLine("Result is : {0}",mi.Invoke(obj,args));
	}
	catch (Exception ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```

现在，思考一下使用 dynamic 关键字来简化上述逻辑

```c#
private static void AddWithDynamic()
{
	Assembly asm = Assembly.Load("MathLibrary");

	try
	{
		// 获取 SimpleMath 类型的元素
		Type math = asm.GetType("MathLibrary.SimpleMath");

		// 在运行时创建SimpleMath
		dynamic obj = Activator.CreateInstance(math);

		Console.WriteLine("Result is : {0}", obj.Add(10,20));

		Console.ReadKey();
	}
	catch (Exception ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```




