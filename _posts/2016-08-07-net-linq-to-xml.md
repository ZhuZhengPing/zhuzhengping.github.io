---
layout: post
title:  "LINQ to xml"
date:   2016-08-07 16:32:18 +0800
categories: linq
tags: .net linq xml
author: Zhengping Zhu
---

* content
{:toc}

## 概念

LINQ to XML API 是另一种创建、操作和查询 XML 文档的方式。它相比 System.Xml 的 DOM 模型使用了更多函数式的方法。你不必将单独的元素组成 XML，不必使用一组函数来更新 XML 树。只需要编写如下所示代码

```c#
private static void BuildXmlDocWithLINQToXml() 
{
	// 使用更加函数式的方式创建XML文档
	XElement doc = new XElement("Inventory", new XElement("Car",
		new XAttribute("ID", "1000"),
		new XAttribute("Color", "Red"),
		new XAttribute("Make", "Pord")
		));
	doc.Save("InventoryWithLINQ.xml");
}
```






### System.Xml.LINQ 命名空间成员

LINQ to XML 的核心程序集(System.Xml.Linq.dll)只在三个不同的命名空间下定义了很少的类型。这三个命名空间是 System.Xml.Linq、System.Xml.Schema、System.Xml.xPath

核心的命名空间 System.Xml.Linq 包含了一组非常易于管理的类，它们代表一个 XML 文档的不同方面(元素、属性、XML命名空间、XML 注释以及处理指令等)

*System.Xml.Linq命名空间的成员*

System.Xml.Linq的成员		|含义
XAttribute					|表示一个XML元素的XML特征
XCData						|表示XML文档中的CDATA部分。CDATA中的信息不必遵循XML的语法规则(如脚本代码)
XComment					|表示一个XML注释
XDeclaration				|表示一个文档中的公开声明
XDocument					|表示一个XML文档的全部内容
XElement					|表示一个XML文档中的特定元素，包含根元素
XName						|表示一个XML元素或XML特性的名称
XNamespace					|表示一个XML命名空间
XNode						|表示XML树中节点(元素、注释、文件类型等)的抽象概念
XProcessingInstruction		|表示一个XML处理指令
XStreamingElement			|表示一个支持延迟流输出的XML树

下图显示了关键关系的继承链

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f6mmoei1dnj30lx0camyp.jpg" style="width:80%" />

### LINQ to XML 的轴方法

除了这些 X*类，System.Xml.Linq 中还定义了一个名为 Extensions的类，它定义了一组针对 IEnumerable<T>的扩展方法，其中 T 为 XNode 或 XContainer 的子类。

Extensions的成员				|含义
`Ancestors<T>()`				|返回经过筛选的元素集合，其中包含源集合中每个节点的上级
Attributes()					|返回源集合中经过筛选的每个元素的特性集合
`DescendantNodes<T>`			|返回集合汇总每个文档和元素的子代节点的集合
`Descendants<T>`				|返回经过筛选的元素集合，其中包含源集合中每个元素和文档的子元素
`Elements<T>`					|返回源集合中每个元素和文档的子元素的集合
`Nodes<T>`						|返回源集合中每个文档和元素的子节点的集合
Remove()						|将源集合中的每个特性从其父节点中移除
`Remove<T>()`					|将源集合中出现的所有特定节点移除

这些方法允许在一个已加载的 XML 树中进行查询，这些方法称为轴方法，这些方法可以直接用来处理节点树的一部分。

```c#
private static void DeleteNodeFromDoc()
{
	XElement doc =
		new XElement("Inventory",
			new XElement("Car",new object[]{ 
				new XElement("ID", 2222),
				new XElement("PetName", "Jimbo"),
				new XElement("Color", "Jimbo"),
				new XElement("Make", "Jimbo")}
			));
	doc.Descendants("PetName").Remove();
	Console.WriteLine(doc);
}
```

调用该方法后，你将看到如下结果

```xml
<Inventory>
	<Car>
		<ID>2222</ID>
		<Color>Jimbo</Color>
		<Make>Jimbo</Make>
	</Car>
</Inventory>
```

XName 和 XNamespace

如果查看 LINQ to XML 方法，你会发现这些方法要求你指定一个 XName 对象。例如 XContainer 中定义的 Desendants() 方法的签名

```c#
public IEnumerable<XElement> Descendants(XName name)
```

XName 是很神奇的，因为你不需要直接使用它。由于该类没有公共的构造函数，因此无法创建一个 XName 对象

```c#
// 错误！不能创建XName对象
doc.Descendants(new XName("PetName")).Remove();
```

如果查看 XName 的正式定义，你就会发现该类定义了一个自定义隐式转换符，它会将一个简单的 System.String 映射到正确的 XName 对象：

```c#
// 我们将在后台创建一个 XName
doc.Descendants("PetName").Remove();
```

这么做的好处是可以在使用这些轴方法时用文本值来表示元素或特征的名称，并允许 LINQ to XML API 将 string 数据映射到所需的对象类型

### 使用 XElement 和 XDocument

在 LINQ to XML 编程模型中，XDocument 表示整个 XML 文档。它可以用来定义一个根元素及其包含的所有元素、处理指令和 XML 声明。

```c#
static void CreateFullXDocument()
{
	XDocument inventoryDoc = new XDocument(
	   new XDocument(
		   new XDeclaration("1.0","utf-8","yes"),
		   new XComment("Current Inventory of cars!"),
		   new XProcessingInstruction("xml-stylesheet","href='MyStyles.css' title='Compact' type='text/css'"),
		   new XElement("Inventory",
			   new XElement("Car", new XAttribute("ID","1"),
			   new XElement("Color","Green"),
			   new XElement("Make","BMW"),
			   new XElement("PetName","Stan")
		   ),
		   new XElement("Car",new XAttribute("ID","2"),
			   new XElement("Color","Pink"),
			   new XElement("Make","Yugo"),
			   new XElement("PetName","Melvin"))
		   ) 
	   ));

	// 保存到磁盘
	inventoryDoc.Save("SimpleInventory.xml");
}
```

请注意 XDocument 对象的构造函数实际上时其他 LINQ to XML 对象组成的树。这里调用的构造函数的第一个参数为 XDeclaration，然后是一个 object 型的参数数组

```c#
public XDocument(System.Xml.Linq.XDeclaration declaration,params object[] content)
```

如果在 Main()方法中调用该方法，将在 SimpleInventory.xml 文件中看到如下数据

```xml
<?xml version="1.0" encoding="utf-8" standalone="yes"?>
<!--Current Inventory of cars!-->
<?xml-stylesheet href='MyStyles.css' title='Compact' type='text/css'?>
<Inventory>
  <Car ID="1">
    <Color>Green</Color>
    <Make>BMW</Make>
    <PetName>Stan</PetName>
  </Car>
  <Car ID="2">
    <Color>Pink</Color>
    <Make>Yugo</Make>
    <PetName>Melvin</PetName>
  </Car>
</Inventory>
```

对于任何 XDocument 来说，默认的 XML 声明使用 utf-8 编码，XML 版本为 1.0 , standalone 特性为 "yes"。因此，删除 XDeclaration 对象的创建将得到完全相同的数据。

如果不需要定义处理指令或自定义 XML 声明，你可以不使用 XDocument 而简单地使用 XElement.记住，XElement 可以用来表示 XML 文档的根元素以及所有子对象。

```c#
static void CreateRootAndChildren()
{
	XElement inventoryDoc = new XElement("Inventory",
		new XComment("Current Inventory of cars!"),
		new XElement("Car", new XAttribute("ID", "1"),
		new XElement("Color", "Green"),
		new XElement("Make", "BMW"),
		new XElement("PetName", "Stan")
		),
		new XElement("Car", new XAttribute("ID", "2"),
			new XElement("Color", "Pink"),
			new XElement("Make", "Yugo"),
			new XElement("PetName", "Melvin")
		)
	);

	// 保存到磁盘
	inventoryDoc.Save("SimpleInventory.xml");
}
```

除了为一个不存在的样式表自定义了处理指令外，其余的输出结果基本一致

```xml
<?xml version="1.0" encoding="utf-8"?>
<Inventory>
  <!--Current Inventory of cars!-->
  <Car ID="1">
    <Color>Green</Color>
    <Make>BMW</Make>
    <PetName>Stan</PetName>
  </Car>
  <Car ID="2">
    <Color>Pink</Color>
    <Make>Yugo</Make>
    <PetName>Melvin</PetName>
  </Car>
</Inventory>
```

### 从数组和容器中生成文档

更常见的情况是通过数组、ADO.NET对象、文件数据等诸如此类的数据源中读取数据来生成 XElement。使用一组标准的 "for 循环" 来讲数据移动到 LINQ to XML 对象模型，是一种将内存中的数据映射为新的 XElement 的方法。

```c#
static void MakeXElementFromArray()
{
	// 创建一个匿名类型的数组
	var people = new[] { 
		new {FirstName="Mandy",Age=31},
		new {FirstName="Andrew",Age=32},
		new {FirstName="Mandy",Age=33},
		new {FirstName="Mandy",Age=34},
	};

	XElement peopleDoc = new XElement("People", 
		from c in people select new XElement("Person", 
			new XAttribute("Age", c.Age),
			new XElement("FirstName", c.FirstName)));

	Console.WriteLine(peopleDoc);
}
```

这里的 peopleDoc 对象使用 LINQ 查询定义了根源上<People>。该 LINQ 查询根据 people 数组的每一项创建新的 XElement。 如果你觉得这种嵌入的查询有点不易阅读，可以像下面来断行

```c#
static void MakeXElementFromArray()
{
	// 创建一个匿名类型的数组
	var people = new[] { 
		new {FirstName="Mandy",Age=31},
		new {FirstName="Andrew",Age=32},
		new {FirstName="Mandy",Age=33},
		new {FirstName="Mandy",Age=34},
	};

	var arrayDataAsXElements = from c in people
			select new XElement("Person",
				new XAttribute("Age", c.Age),
				new XElement("FirstName", c.FirstName));

	XElement peopleDoc = new XElement("People", arrayDataAsXElements);

	Console.WriteLine(peopleDoc);
}
```

总之输出结果如下

```xml
<People>
	<Person Age="31">
		<FirstName>Mandy</FirstName>
	</Person>
	<Person Age="32">
		<FirstName>Andrew</FirstName>
	</Person>
	<Person Age="33">
		<FirstName>Mandy</FirstName>
	</Person>
	<Person Age="34">
		<FirstName>Mandy</FirstName>
	</Person>
</People>
```

### 加载和解析 XML 内容

XElement 和 XDocument 都支持 Load()和Parse()方法，可以从包含 XML 数据的 string 对象或外部 XML 文件获取 XML 对象模型。

```c#
static void ParseAndLoadExitingXml()
{
	// 从string中构建XElement
	string myElement =
		@"<Car ID='3'>
			<Color>Yellow</Color>
			<Make>Yugo</Make>
		  </Car>";
	XElement newElement = XElement.Parse(myElement);
	Console.WriteLine(newElement);
	Console.WriteLine();

	// 加载SimpleInventory.xml文件
	XDocument myDoc = XDocument.Load("SimpleInventory.xml");
	Console.WriteLine(myDoc);
}
```

### 在内存中操作 XML 文档

创建一个 Windows Form 应用程序

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f6oyligiy9j30jc0ayjsb.jpg" style="width:100%" />

在本书代码中包含一个 Inventory.xml 文件。它的根元素<Inventory> 下包含一些条目。引入这个 XML 文件。它的定义类似于这样：

```xml
<Car carID="0">
	<Make>Ford</Make>
	<Color>Blue</Color>
	<PetName>Chuck</PetName>
</Car>
```

### 定义 LINQ to XML 辅助类

我们在项目中新建一个类，用来分离 LINQ to XML 数据。该类将定义一些静态来封装 LINQ to XML逻辑。

```c#
public static XDocument GetXmlInventory()
{
	try
	{
		XDocument inventoryDoc = XDocument.Load("Inventory.xml");
		return inventoryDoc;
	}
	catch (Exception ex)
	{
		MessageBox.Show(ex.Message);
		return null;
	}
}
```

InsertNewElement() 方法获取 "Add Inventory Item" 中各个 TextBox 控件的值，并使用 Descendants() 轴方法将其放置到<Inventory>元素的新节点中。这些工作完成后，将保持文档。

```c#
public static void InsertNewElement(string make, string color, string petName)
{
	// 加载当前温度
	XDocument inventoryDoc = XDocument.Load("Inventory.xml");

	// 为ID生成一个随机数
	Random r = new Random();

	// 根据传入参数新建 XElement
	XElement newElement = new XElement("Car", new XAttribute("ID", r.Next(50000)),
		new XElement("Color",color),
		new XElement("Make",make),
		new XElement("PetName",petName));

	// 添加到内存中的对象
	inventoryDoc.Descendants("Inventory").First().Add(newElement);

	// 保存到磁盘
	inventoryDoc.Save("Inventory.xml");
}
```

最后一个方法 LookUpColorsForMake() 将使用一个 LINQ 查询获取最后一个 TextBox 中的数据，并创建一个包含指定颜色字符串。

```c#
public static void LookUpColorsForMake(string make)
{
	// 加载当前文档
	XDocument inventoryDoc = XDocument.Load("Inventory.xml");

	// 根据给定的值查找颜色
	var makeInfo = from car in inventoryDoc.Descendants("Car")
				   where (string)car.Element("Make") == make
				   select car.Element("Color").Value;

	// 构建一个代表每个颜色的字符串
	string data = string.Empty;
	foreach (var item in makeInfo.Distinct())
	{
		data += string.Format("- {0}\n", item);
	}

	// 显示颜色
	MessageBox.Show(data, string.Format("{0} colors:", make));
}
```

### 将UI组装到辅助类

现在我们要做的就是实现事件处理程序的细节，只需要简单地调用静态的辅助方法

```c#
private void MainForm_Load(object sender, EventArgs e)
{
	//LinqToXmlObjectModel.BuildXmlDocWithLINQToXml();
	// 在 TextBox 控件中显示当前库存的 XML 文档
	txtInventory.Text = LinqToXmlObjectModel.GetXmlInventory().ToString();
}

private void btnAdd_Click(object sender, EventArgs e)
{
	// 为文档添加一个新项
	LinqToXmlObjectModel.InsertNewElement(txtMake.Text, txtColor.Text, txtPetName.Text);

	// 在 TextBox 控件中显示当前库存的 XML 文档
	txtInventory.Text = LinqToXmlObjectModel.GetXmlInventory().ToString();
}

private void btnLookUpColors_Click(object sender, EventArgs e)
{
	LinqToXmlObjectModel.LookUpColorsForMake(txtMakeToLookUp.Text);
}
```

最终显示的输出结果如下

<img src="http://ww1.sinaimg.cn/mw690/006dag38gw1f6q164bmp3j30jg0azq3s.jpg" style="width:100%" />





