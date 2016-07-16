---
layout: post
title:  "Lambda表达式"
date:   2016-07-16 16:32:18 +0800
categories: jquery
tags: lambda
author: Zhengping Zhu
---

* content
{:toc}

## 概念

C#支持内联处理事件，通过直接把一段代码语句赋值给事件(使用匿名方法)，而不是构建被底层委托调用的独立方法。Lambda表达式只是用更简单的方式来写匿名方法

考虑泛型List<T>类的FindAll()方法。当你需要从一个集合中提取子集时，可以使用该方法

```c#
public List<T> FindAll(
    Predicate<T> match
)
```

如你所见，该方法返回新的List<T>，表示数据子集。同时注意FindAll()方法的唯一参数是一个System.Predicate<T>类型的泛型委托。

```c#
public delegate bool Predicate<T>(T obj);
```

在调用FindAll()时，List<T>中的每一项都将传入Predicate<T>对象所指的方法。方法在实现时将执行一些计算，来判断传入的数据是否符合标准，并返回true或false，如果返回true,该项将被添加到表示子集的新List<T>中。

```c#
class Program
{
	static void Main(string[] args)
	{
		FindNumber();
		Console.ReadLine();
	}

	public static void FindNumber()
	{
		List<int> list = new List<int>() { 1,2,3,4,4,5,77,333,12,51,2};
		//list = list.FindAll(p => p < 2);

		Predicate<int> predicate = new Predicate<int>(IsCheckNumber);
		list = list.FindAll(predicate);

		for (int i = 0; i < list.Count; i++)
		{
			Console.WriteLine(list[i]);
		}
	}

	static bool IsCheckNumber(int i)
	{
		return (i % 2) == 0;
	}

}
```

虽然这个使用委托的传统方式可以像预期那样工作，然而IsCheckNumber只在有限的环境中使用。而且，如果调用FindAll,就需要完整的方法定义。我们可以使用匿名方法来代替

```c#
public static void FindNumber()
{
	List<int> list = new List<int>() { 1,2,3,4,4,5,77,333,12,51,2};

	list = list.FindAll(delegate(int i) { return i % 2 == 0; });

	for (int i = 0; i < list.Count; i++)
	{
		Console.WriteLine(list[i]);
	}
}
```

我们可以使用lambda进一步简化操作

```c#
public static void FindNumber()
{
	List<int> list = new List<int>() { 1,2,3,4,4,5,77,333,12,51,2};

	list = list.FindAll(p=>p%2==0);

	for (int i = 0; i < list.Count; i++)
	{
		Console.WriteLine(list[i]);
	}
}
```

c#编译器会把lambda翻译成使用委托Predicate<T>的标准匿名方法

### 深入Lambda表达式

Lambda表达式的参数既可以是显式类型化的，也可以是隐式类型化的。

```c#
// 显式定义参数的类型
List<int> evenNumbers = list.FindAll((int i)=>(i%2)==0);
```

### 使用多个语句处理参数

当表达式必须使用多行代码处理参数时，你可以使用一对花括号确定这些语句的范围。

```c#
public static void FindNumber()
{
	List<int> list = new List<int>() { 1,2,3,4,4,5,77,333,12,51,2};

	List<int> evenNumbers = list.FindAll(i => {
		Console.WriteLine(" value of current is {0} ",i);
		bool isCheck = i % 2 == 0;
		return isCheck;
	});

	for (int i = 0; i < evenNumbers.Count; i++)
	{
		Console.WriteLine(evenNumbers[i]);
	}
}
```

### 含义多个(或零个)参数的Lambda表达式

到目前为止，我们编写的Lambda表达式都只含一个参数。其实Lambda可以处理多个参数或者不提供任何参数。

```c#
class Program
{
	static void Main(string[] args)
	{
		SimpleMath math = new SimpleMath();
		math.SetMathHandler((msg, result) => { 
			Console.WriteLine("Message:{0},result:{1}", msg, result); 
		});
		math.Add(10, 20);
		Console.ReadKey();
	}

	class SimpleMath
	{
		public delegate void MathMessage(string msg, int result);
		private MathMessage mmDelegate;
		public void SetMathHandler(MathMessage target)
		{
			mmDelegate = target;
		}
		public void Add(int x, int y)
		{
			if (mmDelegate != null)
			{
				mmDelegate.Invoke("Adding has completed! ", x + y);
			}
		}
	}
}
```





















