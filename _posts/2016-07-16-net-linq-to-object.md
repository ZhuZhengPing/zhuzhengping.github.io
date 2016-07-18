---
layout: post
title:  "Linq to object"
date:   2016-07-16 16:32:18 +0800
categories: .net
tags: linq
author: Zhengping Zhu
---

* content
{:toc}

## 概念

从宏观上看，LINQ可以理解为直接嵌入C#语法的强类型查询语言。使用LINQ，可以构建与数据库SQL查询类似的表达式。但LINQ查询可以用于多种数据存储，甚至与关系数据库完全无关的存储。





### 将LINQ查询应用于原始数组

下面我们创建一个string类型的数组，假设只想从数组中得到包含空格的项，并让它们按照字母排序

```c#
static void Main(string[] args)
{

	string[] currentString = { "Morrowind","Unchar 2","Monky 300","Zzp"};

	IEnumerable<string> subset = from p in currentString where p.Contains(" ") orderby p select p;

	foreach (var item in subset)
	{
		Console.WriteLine(item);
	}

	Console.ReadKey();
}
```

### 延迟执行的作用

有关LINQ查询表达式另一个重要的地方是在我们迭代内容之前，它不会真正运算。这种方式的好处在于可以为相同的容器多次应用相同的LINQ查询，而始终可以获得最新的结果

```c#
static void Main(string[] args)
{

	int[] current = { 10,20,30,40,1,2,5,9};

	IEnumerable<int> subset = from p in current where p>10 orderby p select p;
   
	// LINQ语句在这里运算
	foreach (int item in subset)
	{
		Console.WriteLine(item);
	}

	current[0] = 200;

	// 再次运算，不用重新写LINQ
	Console.WriteLine("*******   again   ******");
	foreach (int item in subset)
	{
		Console.WriteLine(item);
	}
	Console.ReadKey();
}
```

### 立即执行的作用

如果希望在foreach逻辑外部运算LINQ表达式，可以调用Enumerable类型的许多扩展方法来完成。Enumeralbe定义了诸如ToArray<T>()、ToDictionary<TSource,TKey>()以及ToList<T>()在内的许多扩展方法。

```c#
// 立即执行计算
int[] subset = (from p in current where p>10 orderby p select p).ToArray<int>();
```

### 返回LINQ查询的结果

你可以在类(或结构)中定义一个字段，使其值为LINQ查询的结果。但是这样就不能使用隐式类型了,并且LINQ查询的目标也不能是实例数据，因此必须是静态的。

```c#
class LinqBaseFieldAreClunky
{
	private static string[] currentString = { "Mote", "IPad mini", "IPhone 6", "联想笔记本" };

	// 不能使用隐式类型!必须知道subset类型
	private IEnumerable<string> subset = from g in currentString where g.Contains(" ") orderby g select g;

	public void PrintGames()
	{
		foreach (var item in subset)
		{
			Console.WriteLine(item);
		}
	}
}
```

### 将LINQ查询应用到集合对象

除了从简单的数据数组里抽出结果外，LINQ查询表达式也可以

```c#
class Car
{
	public string PerName { get; set; }
	public string Color { get; set; }
	public int Speed { get; set; }
	public string Make { get; set; }
}
```

### 将LINQ查询应用于非泛型集合

回想一下，LINQ的查询操作符是设计用于实现了IEnumerable<T>接口的类型，非泛型的接口却没有这些结构，我们可以用泛型Enumerable.OfType<T>()方法来包含非泛型数据

```c#
static void Main(string[] args)
{
	ArrayList myCars = new ArrayList()
	{
		new Car{PerName="Henry",Color="red",Make="bmw",Speed=100},
		new Car{PerName="Daiy",Color="black",Make="bmw",Speed=60},
		new Car{PerName="Mary",Color="red",Make="vw",Speed=40},
		new Car{PerName="Melvin",Color="white",Make="yugo",Speed=20},
		new Car{PerName="Clunker",Color="orange",Make="ford",Speed=10}
	};

	// 把ArrayList转换成一个兼容IEnumerable<T>的类型
	var myCarsEnum = myCars.OfType<Car>();

	// 建立兼容类型的查询表达式
	var fastCars = from c in myCarsEnum where c.Speed > 55 select c;
	foreach (var car in fastCars)
	{
		Console.WriteLine("{0} is going too fast!" ,car.PerName);
	}

	Console.ReadKey();
}
```

### 使用OfType<T>()筛选数据

非泛型类型可包含任何类型的项，因为这些容器类的成员原型是接受System.Object的。下面的代码筛选int类型

```c#
static void OfTypeAsFilter()
{
	// 从ArrayList中提取整数
	ArrayList myStuff = new ArrayList();
	myStuff.AddRange(new object[]{10,400,8,false,new object(),new Car(){},"string data"});
	var myInts = myStuff.OfType<int>();

	// 输出10、400和8
	foreach (int i in myInts)
	{
		Console.WriteLine(i);
	}
}
```

### 反转结果集

```c#
foreach(var prod in allProducts.Reverse()){
	Console.WriteLine(prod.ToString());
}
```

### 维恩图工具

Enumerable类提供了一些扩展方法，可以对两个(或多个)LINQ查询的数据进行合并(union)、比较(difference)、连接(concatenation)和交叉(intersection)。

```c#
static void DisplayDiff()
{
	List<string> myCars = new List<string> {"Yugo","Aztec","BWM" };
	List<string> yourCars = new List<string> { "BWM", "ZZP", "Aztec" };

	var carDiff = (from c in myCars select c).Except(from p in yourCars select p);

	foreach (string s in carDiff)
	{
		Console.WriteLine(s);
	}

}
```

找出不同的项，这里会打印出 Yugo

Intersect()方法返回两个容器中共同的数据项

```c#
static void DisplayIntersection()
{
	List<string> myCars = new List<string> { "Yugo", "Aztec", "BWM" };
	List<string> yourCars = new List<string> { "BWM", "ZZP", "Aztec" };

	var carDiff = (from c in myCars select c).Intersect(from p in yourCars select p);

	foreach (string s in carDiff)
	{
		Console.WriteLine(s);
	}
}
```

找出相同的项，会打印出 Aztec 和 BWM

```c#
static void DisplayUnion()
{
	List<string> myCars = new List<string> { "Yugo", "Aztec", "BWM" };
	List<string> yourCars = new List<string> { "BWM", "ZZP", "Aztec" };

	var carDiff = (from c in myCars select c).Union(from p in yourCars select p);

	foreach (string s in carDiff)
	{
		Console.WriteLine(s);
	}
}
```

找出所有的项，会打印 Yugo Aztec BWM ZZP

```c#
static void DisplayConcat()
{
	List<string> myCars = new List<string> { "Yugo", "Aztec", "BWM" };
	List<string> yourCars = new List<string> { "BWM", "ZZP", "Aztec" };

	var carDiff = (from c in myCars select c).Concat(from p in yourCars select p);

	foreach (string s in carDiff)
	{
		Console.WriteLine(s);
	}
}
```

打印  Yugo Aztec BWM BWM ZZP Aztec 




