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






<p style="color:red;">未完待续</p>








