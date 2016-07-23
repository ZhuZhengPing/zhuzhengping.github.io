---
layout: post
title:  "特性 attirbute"
date:   2016-07-23 16:32:18 +0800
categories: .net
tags: .net 特性
author: Zhengping Zhu
---

* content
{:toc}

## 概念

.net编译器的任务之一是为所有定义和引用生成元数据描述。除了程序集中标准的元数据外，.NET平台允许程序员使用特性(attribute)把更多的元数据嵌入到程序集中。






特性			|作用
[CLSCompliant]	|强制被注释项遵从CLS.符合CLS的类型将确保无缝地跨越所有.NET编程语言
[DllImport]		|允许.NET代码调用任意非托管的C或C++基础类库，包括操作系统中的API。注意当与基于COM软件通信时不能使用
[Obsolete]		|标记一个不用的类或成员。如果其他程序员试图使用该项，他们会收到一个警告
[NonSerialized]	|指定类或结构中的某个字段不能在序列化过程中被持久化
[WebMethod]		|标记一个方法可以通过HTTP请求调用，并且通知CLR将方法的返回值序列化为XML

### 在C#中使用特性

为了举例说明C#中使用特性的过程，我们创建了如下程序

```c#
// 该类可以保存到磁盘
[Serializable]
public class Motorcycle
{
	// 可是这个字段不能被持久化
	[NonSerialized]
	float weightOfCurrentPassengers;

	// 这些字段要被持久化
	bool hasRadioSystem;
	bool hasHeadSet;
	bool hasSissyBar;
}
```

同读者猜想的一样，一个项可以被加上多种特性。

```c#
[Serializable,Obsolete("Use another vehicle!")]
public class HorseAndBuggy
{
	// ...
}
```

此外，也可以像下面一样在每个项上应用多个特性

```c#
[Serializable]
[Obsolete("Use another vehicle!")]
public class HorseAndBuggy
{
	// ...
}
```

### C#特性简化符号

仔细阅读.NET Framework 4 SDK文档，可能注意到带有[Obsolete]特性的实际类名是ObsoleteAttribute，而不是Obsolete。当名称转换时，所有.NET特性都将加上一个Attribute标记的后缀。但是，为了简化应用特性的过程，C#语言不需要输入Attribute后缀。

```c#
[SerializableAttribute]
[ObsoleteAttribute("Use another vehicle!")]
public class HorseAndBuggy
{
	// ...
}
```

### 构建自定义特性

构建自定义特性的第一步是建立一个新的派生自System.Attribute的类。

```c#
public sealed class VehicleDescriptionAttribute : System.Attribute
{
	public string Description { get; set; }

	public VehicleDescriptionAttribute(string vehicleDescription)
	{
		Description = vehicleDescription;
	}

	public VehicleDescriptionAttribute() { }
}
```

### 应用自定义特性

为了方便测试，我们在CarLibrary中添加如下的类定义

```c#
[SerializableAttribute]
[ObsoleteAttribute("Use another vehicle!")]
public class HorseAndBuggy
{
	// ...
}

[Serializable]
[VehicleDescription(Description = "My rocking harley")]
public class Motorcycle
{

}

[SerializableAttribute]
[ObsoleteAttribute("User another vehicle!")]
[VehicleDescription(Description = "The old gray mare")]
public class Winnebago
{

}
```

### 限制特性使用

某些情况下，也许想建立一个自定义特性，它只被应用到特定的代码元素上。如果希望限制自定义特性的应用范围，需要在自定义特性的定义中应用[AttributeUsage]特性。[AttributeUsage]特性支持AttributeTargets枚举值的任意组合

```c#
public enum AttributeTargets{
	Assembly = 1,
	Module = 2,
	Class = 4,
	Struct = 8,
	Enum = 16,
	Constructor = 32,
	Method = 64,
	Property = 128,
	Field = 256,
	Event = 512,
	Interface = 1024,
	Parameter = 2048,
	Delegate = 4096,
	ReturnValue = 8192,
	GenericParameter = 16384,
	All = 32767
}
```

此外，[AttributeUsage]也允许我们随意设置命名属性，比如AllowMultiple，它用来指示在相同项上特性是否可被应用多次(默认值为false)。而[AttributeUsage]也允许我们使用Inherited命名属性指示特性是否能够被派生类继承

```c#
// 这次，我们使用AttributeUsage特性来注释我们的自定义特性
[AttributeUsage(AttributeTargets.Class|AttributeTargets.Struct,Inherited=false)]
public sealed class VehicleDescriptionAttribute : System.Attribute
{
...
}
```

### 程序集级别特性

分别使用[module:]和[assembly:]标签，在给定模块的所有类型或给定程序集的所有模块中应用特性也是可以的。举例来说，假定你希望确保定义在程序集中的每个公共类型都符合CLS(公共语言规范)的。

遵循CLS的程序集可用于所有.NET编程语言。如果公共类型的公共成员公开了未遵循CLS的编程结构(如无符号数据或指针参数)，其它.NET语言将无法使用这些功能。因此，要构建可用于各种.NET语言的C#代码库，则必须遵循CLS。

要实现这个目标，只需在每个C# 源代码文件顶部中加入下面的程序集级别特性。注意程序集或者模块级别特性必须在命名空间范围外定义！如果向项目添加程序集(或模块)，推荐使用下面布局

```c#
// 现在列出所有程序集/模块级别特性
// 强制所有在程序集中的公共类型符合CLS
[assembly: CLSCompliant(true)]
namespace CarLibrary
{
...
}
```

如果现在增加不符合CLS的代码(如未标记数据的公开点):

```c#
// Ulong类型不符合 CLS
public class Winnebago
{
	public ulong notCompliant;
}
```

#### Visual Studio 2010 AssemblyInfo.cs文件

默认情况下，Visual Studio 2010生成了一个名叫 AssemblyInfo.cs的文件。

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f63mtooxehj310b0bawka.jpg" style="width:100%" />

这个文件用于放置程序集级别使用的特性。其中的清单包含程序集级别的元数据

特性					|含义
[AssemblyCompany]		|保存基本的公司信息
[AssemblyCopyright]		|保存产品或程序集的版权信息
[AssemblyCulture]		|提供程序集支持的区域或语言信息
[AssemblyDescription]	|保存组成程序集的产品或模块的描述
[AssemblyKeyFile]		|指定包含用于签名程序集的密钥对的文件的名称(例如建立一个强名称)
[AssemblyProduct]		|提供产品信息
[AssemblyTrademark]		|提供商标名称
[AssemblyVersion]		|指定程序集的版本信息，用<major.minor.build.revision>格式

### 使用早期绑定反射特性

一个特性直到另一个软件反射它的值时才有用。给定的特性被发现后，软件可以采取任何需要的行为。

```c#
// Ulong类型不符合 CLS
[VehicleDescriptionAttribute(Description="扣扣你好")]
public class Winnebago
{
	public ulong notCompliant;
}

class Program
{
	static void Main(string[] args)
	{

		ReflectOnAttributesUsingEarlyBinding();

		Console.ReadLine();
	}

	static void ReflectOnAttributesUsingEarlyBinding()
	{
		// 得到一个表现Winnebago的类型
		Type type = typeof(Winnebago);

		// 得到Winnebago所有的特性
		object[] customAtts = type.GetCustomAttributes(false);

		//输出描述
		foreach (VehicleDescriptionAttribute v in customAtts)
		{
			Console.WriteLine("-> {0}\n",v.Description);
		}
	}

	static void InvokeMethodWithArgsUsingLateBinding()
	{
		Assembly asm = Assembly.Load("CarLibrary");

		// 得到 MiniVan类型的元数据
		Type type = asm.GetType("CarLibrary.MiniVan");

		// 在运行中建立 MiniVan
		object obj = Activator.CreateInstance(type);
		MethodInfo mi = type.GetMethod("TurnOnRadio");
		mi.Invoke(obj, new object[] { true, 2 });
	}
}
```

### 使用晚期绑定反射特性

```c#
static void ReflectAttributesUsingLateBinding()
{
	try
	{
		Assembly asm = Assembly.Load("CarLibrary");
		Type vehicleDesc = asm.GetType("CarLibrary.VehicleDescriptionAttribute");
		// 得到property属性
		PropertyInfo propDesc = vehicleDesc.GetProperty("Description");

		// 得到程序集中所有类型
		Type[] types = asm.GetTypes();

		// 遍历每个类型
		foreach (Type t in types)
		{
			object[] objs = t.GetCustomAttributes(vehicleDesc, false);

			// 遍历每个VehicleDescriptionAttribute 并使用晚期绑定输出描述
			foreach (object o in objs)
			{
				Console.WriteLine("-> {0}: {1}\n", t.Name, propDesc.GetValue(o, null));
			}
		}
	}
	catch (Exception ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```





