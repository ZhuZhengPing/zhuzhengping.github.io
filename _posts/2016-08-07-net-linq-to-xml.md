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




