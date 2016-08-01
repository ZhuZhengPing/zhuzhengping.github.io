---
layout: post
title:  "对象序列化"
date:   2016-07-31 16:32:18 +0800
categories: .net
tags: .net 序列化
author: Zhengping Zhu
---

* content
{:toc}

## 概念

序列化描述了持久化一个对象的状态到流的过程。被持久化的数据次序包括所有以后需要来重建对象状态所必须的信息。使用这种技术，可以用最小花费保存海量的数据。





创建一个新的控制台程序,其中的 Radio 类被标记为 [Serializable]，除了一个成员变量(radioID)例外，它被标记为[NonSerialized]，因此 radioID 类将不会被持久化到指定的数据流中

```c#
[Serializable]
public class Radio
{
	public bool hasTweeters;
	public bool hasSubWoofers;
	public double[] stationPresets;

	[NonSerialized]
	public string radioID = "XF-552RR5";
}
```

接下来，添加另外两个类类型来表示 JamesBondCar 和 Car 基类。JamesBondCar 类和 Car 基类。JamesBondCar 类和 Car 基类也标记为[Serializable]，并且定义了下列字段数据

```c#
[Serializable]
public class Car 
{
	public Radio theRadio = new Radio();
	public bool isHatchBack;
}

[Serializable]
public class JamesBondCar : Car
{
	public bool canFly;
	public bool canSubmerge;
}
```

注意，[Serializable]特性不能被继承。因此，如果从被标记为[Serializable]的类派生一个类，子类也必须被标记为[Serializable]，否则它不能被持久化。

### 公共字段、私有字段和共有属性

使用 BinaryFormatter 或 SoapFormatter 持久化一个对象，完全没有区别。这些类型被编程为序列化一个类型的所有可序列化的字段，不管它们是共有字段、私有字段还是通过公共属性公开的私有字段。

如果使用 XmlSerializer 类型，情况就大不同。这些类型只有字段数据的公共块或拥有公共属性的私有数据可以被序列化。不是通过属性公开的私有数据将忽略。

```c#
[Serializable]
public class Person
{
	// 公共字段
	public bool isAlive = true;

	// 私有字段
	private int personAge = 21;

	// 公共属性/私有数据
	private string fName = string.Empty;
	public string FirstName
	{
		get { return fName; }
		set { fName = value; }
	}
}
```

如果是由 BinaryFormatter 或 SoapFormatter 进行处理，我们就会发现 isAlive、personAge 以及 fName 都保存到了所选的流中。然而，XmlSerializer 不会保存 personAge 的值，因为这段私有数据没有封装为类型属性。如果你希望使用 XmlSerializer 来持久化用户年龄，就需要把字段定义为公共的或使用公共属性来封装私有字段。

### 选择序列化格式化程序

一旦将类型配置为参与 .NET 序列化，接下来就是选择当持久化对象图时使用哪种格式(SOAP 或 XML)，有以下3种选择：

>* BinaryFormatter
>* SoapFormatter
>* XmlSerializer

BinaryFormatter 类型使用紧凑的二进制格式将对象图序列化为一个流，这个类型再 System.Runtime.Seralization.Formatters.Binary 命名空间中定义，后者是 mscorlib.dll 的一部分。因此，为了获得对这个类型的访问，需要指定下面的 C# using 指令

```c#
// 获得对mscorlib.dll中的BinaryFormatter的访问
using System.Runtime.Seralization.Formatters.Binary ;
```

SoapFormatter 类型将对象图表示为一个 SOAP 消息(传递消息到 Web 服务或从 Web 服务传递消息的标准 XML 格式)。该类型定义在 System.Runtime.Serializable.Formatters.Soap 命名空间中，该命名空间被定义在一个程序集内。因此，要格式化对象图为一个 SOAP 消息，必须添加引用

```c#
// 必须引用System.Runtime.Serialization.Formatters.Soap.dll
using System.Runtime.Serializable.Formatters.Soap;
```

最后，如果希望将对象图持久化为一个 XML 文档，需要用到 XmlSerializer 类型。要使用这个类型，需要指定使用 System.Xml.Seralization 命名空间，并设置对程序集 System.Xml.dll 的引用。

```c#
// 定义在System.Xml.dll
using System.Xml.Serializable;
```

### IFormatter 和 IRemotingFormatting 接口

不管选择哪种格式化程序来序列化对象，都要知道他们直接派生自 System.Object，因此并不从一个以序列化为中心的基类共享一组公共的成员。但是，BinaryFormatter 和 SoapFormatter 类型通过实现 IFormatter 和 IRemotingFormatting 接口(XmlSerializer 两者都不实现) 都支持公共的成员。

System.Runtime.Seralization.IFormatter 定义了核心的 Serialize() 和 Deserialize() 方法， Serialize() 和 Deserialize() 方法，Serialize() 和 Deserialize() 方法将做复杂的工作完成对象图和指定流之间的转换。除了这些成员，IFormatter 还定义了一些在后台使用的实现类型的属性

```c#
public interface IFormatter{
	SerializationBinder Binary{get;set;}
	StreamingContext Context{get;set;}
	ISurrogateSelector SurrogateSelector{get;set;}
	object Deserialize(Stream serializationStream);
	void Serialize(Stream serializationStream,object graph);
}

System.Runtime.Remoting.Messaging.IRemotingFormatter 接口重载了 Serialize() 和 Deserialize() 成员使风格更适合于分布式持久化。

```c#
public interface IRemotingFormatter:IFormatter{
	object Deserialize(Stream serializationStream,HeaderHandler handler);
	void Serialize(Stream serializationStream,object graph,Header[] headers);
}
```

尽管在大多数序列化工作时不需要直接与这些接口发生交互，基于接口的多态允许使用一个 IFormatter 引起来保持一个 BinaryFormatter  或 SoapFormatter 的实例。因此，如果希望建立一个方法使用这两个类中的一个来序列化一个对象图，可以编写下列语句

```c#
static void SerializeObjectGraph(IFormatter itfFormat,Stream destStream,object graph){
	itfFormat.Serialize(destStream,graph);
}
```

### 在格式化程序中的类型保真

在3种格式化程序中，最明显的不同是对象图被持久化为不同的流(二进制、SOAP 或 XML)的方式。当使用 BinaryFormatter 类型时，不仅仅是将对象图中对象的字段数据进行持久化，而且也持久化每个类型的完全限定名称和定义程序集的完整名称。这些数据使的 BinaryFormatter 能跨越 .NET 应用程序机器边界传递对象。

SoapFormatter 通过使用 XML 命名空间来持久化原始程序集的跟踪。另一方面，XmlSerializer 不会试图保存完全的类型保真，因此也不记录类型完全限定名称或起源的程序集。因此咋一看好像有些限制，但 XML 序列化用于标准的 .NET Web 服务，可被任何平台中的客户端调用。这意味着没有必要序列化完整的 .NET 类型元数据。下面是 Person 类型 XML 表示方法

```xml
<?xml version="1.0"?>
<Person xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
	<isAlive>true</isAlive>
	<PersonAge>21</PersonAge>
	<FirstName/>
</Person>
```

如果希望持久化的对象图可以被任意操作系统、应用程序框架或编程语言使用，就不要保持完整的类型，因为不能假设所有可能的接收方都能理解 .NET 专有的数据类型。

### 使用 BinaryFormatter 序列化对象

为说明持久化一个 JamesBondCar 的实例到一个物理文件中是多么简单，我们使用 BinaryFormatter 二进制类型。再次注意 BinaryFormatter 类型的两个关键方法: Serialize() 和 Deserialize()。

>* Serialize():将一个对象图按字节的顺序持久化到一个指定的流。
>* Deserialize():将一个持久化的字节顺序转化为一个对象图。

```c#
static void Main(string[] args)
{
	
	// 建立一个JamesBondCar并设定状态
	JamesBondCar jbc = new JamesBondCar();
	jbc.canFly = true;
	jbc.canSubmerge = false;
	jbc.theRadio.stationPresets = new double[] { 89.3, 105.1, 97.1 };
	jbc.theRadio.hasTweeters = true;

	// 将car以二进制格式保存到指定文件中
	SaveAsBinaryFormat(jbc, "CarData.dat");
	Console.ReadLine();
}
```

SaveAsBinaryFormat() 方法按如下所示实现

static void SaveAsBinaryFormat(object objGraph, string fileName)
{
	// 将对象以二进制保存到一个名为CarData.dat的文件
	BinaryFormatter binFormat = new BinaryFormatter();

	using (Stream fStream = new FileStream(fileName, FileMode.Create, FileAccess.Write, FileShare.None))
	{
		binFormat.Serialize(fStream, objGraph);
	}
	Console.WriteLine("=> Saved car in binary format!");
}

可见，BinaryFormatter.Serialize()方法是一个负责生成对象图并将字节顺序


