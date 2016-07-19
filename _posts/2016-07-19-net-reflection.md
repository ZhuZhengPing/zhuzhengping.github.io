---
layout: post
title:  "反射"
date:   2016-07-16 16:32:18 +0800
categories: .net
tags: 反射
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在.net中，反射是一个运行库类型发现的过程。使用反射服务，可以得到一个给定*.dll或*.exe程序集所包含的所有类型列表，这个列表包括给定类型定义的方法、字段、属性和事件。也可以动态发现一组给定类型支持的接口、方法的参数和其他相关细节






与其他命名空间一样，System.Reflection包含大量类型。

类型			|作用
Assembly		|该抽象类包含了许多静态方法，通过它可以加载、了解和操纵一个程序集
AssemblyName	|使用该类可以找到大量隐藏在程序集的身份中的细节(版本信息，区域信息等)
EventInfo		|该抽象类保存给定事件的信息
FieldInfo		|该抽象类保存给定字段的信息
MemberInfo		|该类是抽象基类，它为EventInfo、FieldInfo、MethodInfo和PropertyInfo类型定义了公共的行为
MethodInfo		|该抽象类包含给定方法的信息
Module			|该抽象类使你可以访问多文件程序集中的给定模块
ParameterInfo	|该类保存给定参数的信息
PropertyInfo	|该抽象类保存给定属性的信息

### System.Type类

System.Type类定义了很多成员，可以用来检查某个类型的元数据，它们返回的数据大多位于System.Reflection命名空间中。

类型					|作用
IsAbstract、IsArray、IsClass、IsCOMObject、IsEnum、IsGenericType-Definition、IsGenericParameter、IsInterface、IsPrimitive、IsNested-Private、IsNestedPublic、IsSealed、IsValueType		|这些属性允许我们发现许多引用类型的基本特性
GetConstructors()、GetEvents()、GetFields()、GetInterfaces()、GetMembers()、GetMethods()、GetNestedTypes()、GetPropertied()		|这些方法允许我们得到感兴趣的项目数组。每个方法返回一个相关数组
FindMembers()	|该方法根据查询条件返回一个MemberInfo类型的数组
GetType()		|该静态方法返回一个Type实例,给定一个字符串名称
InvokeMember()		|该方法允许给定项目的晚期绑定

### 使用System.Object.GetType()得到Type引用

可以多种方法得到一个Type类的实例。但是，由于Type是一个抽象类，所以不能直接使用new关键字创建一个Type对象。使用System.Object定义的GetType()方法，它返回了一个表示当前对象元数据的Type类的实例：

```c#
SportsCar sc = new SportsCar();
Type t = sc.GetType();
```

### 使用System.Type.GetType()得到Type引用

为了以更灵活的方式得到类型信息，我们可以调用System.Type类的静态成员GetType()

Type.GetType()有重载的方法，允许我们指定两个布尔类型，第一个表示找不到类型时是否引发异常，第二个指定是否执行区分大小写的搜索，。

```
Type t = Type.GetType("CarLibrary.SportsCar",false,true);
```

当希望得到一个外部私有程序集的类型元数据时，字符串参数必须使用类型完全限定名，加上类型所在程序集的友好名字

```c#
Type t = Type.GetType("CarLibrary.SportsCar,CarLibrary");
```

另外，传入Type.GetType()的字符串可以指定一个+标记来表示一个嵌套类型。如果希望得到一个嵌套在JamesBondCar类中的枚举类型(SpyOptions)的类型信息，可以写成下面这样

```c#
Type t = Type.GetType("CarLibrary.JamesBondCar+SpyOptions");
```

### 反射方法、字段和属性
	
```c#
static void ListMethods(Type t)
{
	Console.WriteLine("***************   Methods   ***************");
	var methodNames = from n in t.GetMethods() select n.Name;
	foreach (var m in methodNames)
	{
		Console.WriteLine("->{0}",m);
	}
}

// 获得字段
static void ListFields(Type t)
{
	Console.WriteLine("***************   Fields   ***************");
	var fieldsNames = from n in t.GetFields() select n.Name;
	foreach (var m in fieldsNames)
	{
		Console.WriteLine("->{0}", m);
	}
}

// 获得属性
static void ListProps(Type t)
{
	Console.WriteLine("***************   Properties   ***************");
	var propsNames = from n in t.GetProperties() select n.Name;
	foreach (var m in propsNames)
	{
		Console.WriteLine("->{0}", m);
	}
}

// 获得接口
static void ListInterfaces(Type t)
{
	Console.WriteLine("***************   Interfaces   ***************");
	var interfacesNames = from n in t.GetInterfaces() select n.Name;
	foreach (var m in interfacesNames)
	{
		Console.WriteLine("->{0}", m);
	}
}

// 显示其他信息
static void ListVariousStats(Type t)
{
	Console.WriteLine("******* Various Statistics *******");
	Console.WriteLine("Base class is :{0}",t.BaseType);
	Console.WriteLine("Is type abstract? {0}",t.IsAbstract);
	Console.WriteLine("Is type sealed? {0}" ,t.IsSealed);
	Console.WriteLine("Is type generic? {0}" , t.IsGenericTypeDefinition);
	Console.WriteLine("Is type a class type? {0}",t.IsClass);
}
```

### 实现Main()

在Program类中，Main()方法提示用户输入类型的完全限定名。一旦得到这个字符串数据，就把它传入到Type.GetType()方法中，然后把得到的System.Type类型再送到每个辅助方法中

```c#
static void Main(string[] args)
{
	string typeName = "";

	Console.WriteLine("\nEnter a type name to evaluate");
	Console.WriteLine("or enter Q to quit: ");

	// 得到类型的名称
	typeName = Console.ReadLine();

	Type type = Type.GetType(typeName);
	ListVariousStats(type);
	ListMethods(type);
	ListFields(type);
	ListProps(type);
	ListInterfaces(type);

	Console.ReadKey();
}
```

### 反射泛型类型

如果我们调用 Type.GetType()来获取泛型类型的元数据描述，就必须使用包含“反勾号”加上数字值的语法来表示类型支持的类型参数个数。例如，如果我们希望输出System.Collections.Generic.List<T>元数据描述，就需要为我们的应用程序传入如下字符串：

```c#
System.Collections.Generic.List`1
```











