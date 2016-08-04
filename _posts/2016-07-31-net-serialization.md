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
```

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

```c#
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
```

可见，BinaryFormatter.Serialize()方法是一个负责生成对象图并将字节顺序移动到流的派生类型的成员。

在运行程序之后，我们就可以转到当前项目\bin\Debug 文件夹查看表示 JamesBondCar 实体的 CarData.dat 文件的内容了

<img src="http://ww3.sinaimg.cn/small/006dag38gw1f6gfydf1jvj30eu09e75n.jpg" style="width:70%" />

### 使用 BinaryFormatter 反序列化对象

现在假设你在考虑从二进制文件中读取被持久化的 JamesBondCar 并将其恢复到一个对象变量中。一旦以编程方式打开 CarData.dat 文件，只需要调用 BinaryFormatter 的 Deserialize()方法。如下面显示：

```c#
static void LoadFromBinaryFile(string fileName)
{
	BinaryFormatter binFormat = new BinaryFormatter();

	// 从二进制文件中读取JamesBondCar对象
	using (Stream fStream = File.OpenRead(fileName))
	{
		JamesBondCar carFromDisk = (JamesBondCar)binFormat.Deserialize(fStream);
		Console.WriteLine("Can this car fly? : {0}",carFromDisk.canFly);
	}
}
```

注意，如果我们调用 Deserialize()，需要传入表示持久的对象图位置的 Stream 的派生类型。在把对象转换回正确类型后，我们就可以发现状态数据是我们保持对象时的那个状态点。

### 使用 SoapFormatter 序列化对象

下一个格式化程序的选择是 SoapFormatter 类型。SoapFormatter 类型将把对象图持久化为一个 SOAP 消息。简而言之，SOAP 定义了一个标准的过程，在这个过程中可以用与平台和操纵系统无关的方式调用方法。

```c#
// 确保使用了System.Runtime.Serialization.Formatters.Soap并引用了
// System.Runtime.Serialization.Formatters.Soap.dll
static void SaveAsSoapFormat(object objGraph, string fileName)
{
	// 将对象以SOAP格式保存到CarData.soap文件中
	SoapFormatter soapFormat = new SoapFormatter();

	using (Stream fStream = new FileStream(fileName, FileMode.Create, FileAccess.Write, FileShare.None))
	{
		soapFormat.Serialize(fStream, objGraph);
	}
	Console.WriteLine("=> Saved car in SOAP format!");
}
```

在main中调用

```c#
static void Main(string[] args)
{
	// Create a hashtable of values that will eventually be serialized.
	Hashtable addresses = new Hashtable();
	addresses.Add("Jeff", "123 Main Street, Redmond, WA 98052");

	SaveAsSoapFormat(addresses, "DataFile.soap");

	Console.ReadLine();
}
```

和之前一样，仅仅使用 Serialize() 和 Deserialize()方法将对象图移入和移出流。如果从 Main() 调用这方法，并运行程序，将打开一个产生结果的*.soap 文件。可以定位到标记了当前 JamesBondCar 的状态值的 XML 元素上

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f6gwrjk0prj30wj0di46a.jpg" style="width:100%" />

### 使用 XmlSerializer 序列化对象

除了SOAP和二进制格式化程序外，System.Xml.dll程序集提供了第三种格式化程序:System.Xml.Serialization.XmlSerializer。与XML数据被包含在一个SOAP消息中相反，该方式可以用来将给定对象的公共状态持久化为一个纯XML。使用这种类型与使用SoapFormatter或BinaryFormatter类型有一点不同。

```c#
public static void SaveAsXmlFormat(object objGraph, string fileName)
{
	// 将对象以XML格式保存到CarData.xml文件中
	XmlSerializer xmlFormat = new XmlSerializer(typeof(JamesBondCar));

	using (Stream fStream = new FileStream(fileName, FileMode.Create, FileAccess.Write, FileShare.None))
	{
		xmlFormat.Serialize(fStream, objGraph);
	}
	Console.WriteLine("=> Saved car in XML format!");
```

main 方法里面的代码

```c#
public static void Main(string[] args)
{
	JamesBondCar car = new JamesBondCar();
	car.canFly = true;
	car.canSubmerge = false;
	car.isHatchBack = false;
	car.theRadio = new Radio();
	car.theRadio.radioID = "XF-552RR6";

	SaveAsXmlFormat(car, "CarData.xml");

	Console.ReadLine();
}
```

关键的不同点 XmlSerializer 类型需要你指定类型信息表示要序列化的类。如果查看新生成的 XML 文件，可以看到如下数据

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f6gx9fm1unj30nm085whd.jpg" style="width:100%" />

### 控制生成的 XML 数据

如果读者有使用 XML 技术的背景，就知道确认 XML 文档中的元素符合一套建立数据有效性的规则往往很关键。如果希望控制 XmlSerializer 如何生成 XML 文档，可以用取自 System.Xml.Seralization 命名空间的任意数量的附加特性来修饰你的类型。

特性				|作用
[XmlAttribute]		|可以在类的公共字段上使用这个.NET特性，它告诉 xmlSerializer 将数据作为 XML 特性(不是子元素)进行序列化
[XmlElement]		|字段或属性将作为 XML 元素被序列化
[XmlEnum]			|枚举成员的元素名称
[XmlRoot]			|该特性控制根元素如何被构造
[XmlText]			|属性或字段将被序列化为 XML 文本
[XmlType]			|XML 类型的名称和命名空间

如果希望指定一个自定义的 XML 命名空间限定修饰 JamesBondCar,还要将 canFly 和 canSubmerge 值编码为 XML 特性。

```c#
[XmlRoot(Namespace="http://www.zhuzhengping.com")]
public class JamesBondCar : Car
{
	[XmlAttribute]
	public bool canFly;
	[XmlAttribute]
	public bool canSubmerge;
}
```

将生成下面的 XML 文档

```xml
<?xml version="1.0"?>
<JamesBondCar xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" canFly="true" canSubmerge="false" xmlns="http://www.zhuzhengping.com">
  <theRadio>
    <hasTweeters>false</hasTweeters>
    <hasSubWoofers>false</hasSubWoofers>
    <radioID>XF-552RR5</radioID>
  </theRadio>
  <isHatchBack>false</isHatchBack>
</JamesBondCar>
```





