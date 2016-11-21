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


















