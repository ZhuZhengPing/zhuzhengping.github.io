---
layout: post
title:  "迭代器模式"
date:   2017-10-20 16:32:18 +0800
categories: design
tags: design factory
author: Zhengping Zhu
---

* content
{:toc}

## 概念

迭代器模式提供了一种方法顺序访问一个聚合对象（理解为集合对象）中各个元素，而又无需暴露该对象的内部表示，这样既可以做到不暴露集合的内部结构，又可让外部代码透明地访问集合内部的数据。












### 迭代器模式的结构

```c#
// 抽象聚合类
public interface IListCollection
{
	Iterator GetIterator();
}

// 迭代器抽象类
public interface Iterator
{
	bool MoveNext();
	Object GetCurrent();
	void Next();
	void Reset();
}

// 具体聚合类
public class ConcreteList : IListCollection
{
	int[] collection;
	public ConcreteList()
	{
		collection = new int[] { 2, 4, 6, 8 };
	}

	public Iterator GetIterator()
	{
		return new ConcreteIterator(this);
	}

	public int Length
	{
		get { return collection.Length; }
	}

	public int GetElement(int index)
	{
		return collection[index];
	}
}

// 具体迭代器类
public class ConcreteIterator : Iterator
{
	// 迭代器要集合对象进行遍历操作，自然就需要引用集合对象
	private ConcreteList _list;
	private int _index;

	public ConcreteIterator(ConcreteList list)
	{
		_list = list;
		_index = 0;
	}


	public bool MoveNext()
	{
		if (_index < _list.Length)
		{
			return true;
		}
		return false;
	}

	public Object GetCurrent()
	{
		return _list.GetElement(_index);
	}

	public void Reset()
	{
		_index = 0;
	}

	public void Next()
	{
		if (_index < _list.Length)
		{
			_index++;
		}
			
	}
}

// 客户端
class Program
{
	static void Main(string[] args)
	{
		Iterator iterator;
		IListCollection list = new ConcreteList();
		iterator = list.GetIterator();

		while (iterator.MoveNext())
		{
			int i = (int)iterator.GetCurrent();
			Console.WriteLine(i.ToString());
			iterator.Next();
		}

		Console.Read();
	}
}
```

### UML图

<img src='http://wx3.sinaimg.cn/mw690/006dag38gy1fktmx3l92dj30al07vmx2.jpg' style="display:block;width:600px;margin:0 auto;" />

#### 迭代器角色

>* 迭代器角色（Iterator）：迭代器角色负责定义访问和遍历元素的接口
>* 具体迭代器角色（Concrete Iteraror）：具体迭代器角色实现了迭代器接口，并需要记录遍历中的当前位置
>* 聚合角色（Aggregate）：聚合角色负责定义获得迭代器角色的接口
>* 具体聚合角色（Concrete Aggregate）：具体聚合角色实现聚合角色接口

自然，上面代码的运行结果也是对集合每个元素的输出，结果为 ：2 4 6 8

### .NET中迭代器模式的应用

在.NET下，迭代器模式中的聚集接口和迭代器接口都已经存在了，其中IEnumerator接口扮演的就是迭代器角色，IEnumberable接口则扮演的就是抽象聚集的角色，只有一个GetEnumerator()方法，关于这两个接口的定义可以自行参考MSDN。在.NET 1.0中，.NET 类库中很多集合都已经实现了迭代器模式，大家可以用反编译工具Reflector来查看下mscorlib程序集下的System.Collections命名空间下的类，这里给出ArrayList的定义代码，具体实现代码可以自行用反编译工具查看，具体代码如下所示：

```c#
public class ArrayList : IList, ICollection, IEnumerable, ICloneable
{
    // Fields
    private const int _defaultCapacity = 4;
    private object[] _items;
    private int _size;
    [NonSerialized]
    private object _syncRoot;
    private int _version;
    private static readonly object[] emptyArray;

    public virtual IEnumerator GetEnumerator();
    public virtual IEnumerator GetEnumerator(int index, int count);

    // Properties
    public virtual int Capacity { get; set; }
    public virtual int Count { get; }
    ..............// 更多代码请自行用反编译工具Reflector查看
}
```

### 迭代器模式的适用场景

>* 系统需要访问一个聚合对象的内容而无需暴露它的内部表示
>* 系统需要支持对聚合对象的多种遍历
>* 系统需要为不同的聚合结构提供一个统一的接口

### 迭代器模式的优缺点

#### 优点

>* 迭代器模式使得访问一个聚合对象的内容而无需暴露它的内部表示，即迭代抽象
>* 迭代器模式为遍历不同的集合结构提供了一个统一的接口，从而支持同样的算法在不同的集合结构上进行操作

#### 缺点

>* 迭代器模式在遍历的同时更改迭代器所在的集合结构会导致出现异常。所以使用foreach语句只能在对集合进行遍历，不能在遍历的同时更改集合中的元素





