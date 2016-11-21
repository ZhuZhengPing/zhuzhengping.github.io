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













