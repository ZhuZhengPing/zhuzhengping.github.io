---
layout: post
title:  "反射"
date:   2016-07-19 16:32:18 +0800
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

### 反射方法和返回值

到目前为止，一切顺利！我们需要特别修改ListMethods()辅助方法，使其不仅给出方法的名称，而且还列出方法的返回类型和输入参数类型。

```c#
static void ListMethods(Type t)
{
	Console.WriteLine("***************   Methods   ***************");
	MethodInfo[] mi = t.GetMethods();
	foreach (MethodInfo m in mi)
	{
		string retValue = m.ReturnType.FullName;
		string paramInfo = "(";
		// 得到参数
		foreach (ParameterInfo pi in m.GetParameters())
		{
			paramInfo += string.Format("{0} {1}", pi.ParameterType, pi.Name);
		}
		paramInfo += ")";
		Console.WriteLine("->{0} {1} {2}",retValue,m.Name,paramInfo);
	}
}
```

运行后，将显示如下的方法

```
->System.String ToString()
->System.Boolean Equals(System.Object obj)
->System.Boolean Equals(System.Object objA System.Object objB)
->System.Boolean ReferenceEquals(System.Object objA System.Object objB)
->System.Int32 GetHashCode()
->System.Type GetType()
```

### 动态加载程序集

System.Reflection定义了一个名为Assembly的类。使用这个类，我们可以动态的加载程序集，并找到关于程序集自身的属性。而且使用Assembly,我们可以动态加载私有程序集或共享程序集，还能加载任意位置的程序集。从本质上说，Assembly类提供的方法使你可以用编程的方式提供和客户端*.config文件同样的信息

```c#
static void Main(string[] args)
{
	string asmName = "";
	Assembly asm = null;

	do
	{
		Console.WriteLine("\nEnter an assembly to evaluate");
		Console.Write("or enter Q to quit: ");

		// 得到程序集名称
		asmName = Console.ReadLine();

		// 用户是否想退出
		if (asmName.ToUpper() == "Q")
		{
			break;
		}

		// 尝试加载程序集
		try
		{
			asm = Assembly.Load(asmName);
			DisplayTypesInAsm(asm);
		}
		catch (Exception)
		{
			Console.WriteLine("Sorry, can't find assembly.");
		}
	} while (true);

	Console.ReadKey();
}

static void DisplayTypesInAsm(Assembly asm)
{
	Console.WriteLine("->{0}",asm.FullName);
	Type[] types = asm.GetTypes();
	foreach (Type t in types)
	{
		Console.WriteLine("Type: {0}",t);
	}
	Console.WriteLine("");
}
```

注意，静态Assembly.Load()方法仅仅传入了一个要加载到内存的程序集的友好名称。因此，如果希望反射CarLibrary.dll，需要把CarLibrary.dll二进制文件复制到当前项目应用程序的\bin\Debug目录，然后再来运行这个程序。

```
Enter an assembly to evaluate or enter Q to quit: CarLibrary
->CarLibrary,Version=2.0.0.0,Culture=neutral,PublicKeyToken=33a2bc294331e8b9
Type: CarLibrary.MusicMedia
Type: CarLibrary.EngineState
Type: CarLibrary.Car
Type: CarLibrary.SportsCar
Type: CarLibrary.MiniVan
```

如果希望使反射用得更加灵活，可以用Assembly.LoadFrom()而不是Assembly.Load()方法加载外部程序集,这里需要使用绝对路径，例如：F:\c#\CTest\CTest\bin\Debug\C5.dll

```c#
try{
	asm = Assembly.LoadFrom(asmName);
	DisplayTypesInAsm(asm);
}
```

### 反射共享程序集

Assembly.Load()方法被重载很多次了。Assembly.Load()的一种变化是允许指定一个区域设置、一个版本号和公钥标记值。整体来说，识别一个程序集的一组术语称为显示名称(display name)。显示名称的格式以程序集友好名称开头，其后加上以逗号分隔的名称/值对字符串，后接可选的标识符

```
Name(,Version = major.minor.build.revision) (,Culture = culture token) (,PublicKeyToken = public key token)
```

在显示名称中，PublicKeyToken=null 通常表示需要绑定和匹配一个非强名称的程序集。而Culture=""表示匹配目标机器默认的区域设置

```c#
// 使用默认的区域设置加载CarLibrary的1.0.0.0版本
Assembly a = Assembly.Load(@"CarLibrary, Version=1.0.0.0, PublicKeyToken=null,Culture=""");
```

另外，System.Reflection 命名空间提供了 AssemblyName类型，它允许用手工编写的对象变量来表示前面的字符串信息。通常，该类和System.Version结合使用。以这种方式建立了显示名称后，就可以把它传入到重载的Assembly.Load()方法

```c#
// 使用AssemblyName定义显示名称
AsseemblyName asmName;
asmName = new AssemblyName();
asmName.Name = "CarLibrary";
Version v = new Version("1.0.0.0");
asmName.Version = v;
Assembly a = Assembly.Load(asmName);
```

要加载一个GAC中的共享程序集，Assembly.Load()参数必须指定publikeytoken公钥标记值。举例来说，假定希望加载由.NET基础库提供的System.Window.Forms.dll程序集的4.0.0.0版本。由于此程序集中类型的数量非常大，所以下面的应用程序仅仅输出公有枚举的名称

```c#
static void Main(string[] args)
{

	// 从GAC中加载System.Windows.Forms.dll
	string displayName = null;
	displayName = "System.Windows.Forms," + "Version=4.0.0.0," + "PublicKeyToken=b77a5c561934e089," + @"Culture=""";

	Assembly asm = Assembly.Load(displayName);
	DisplayInfo(asm);
	Console.WriteLine("Done!");
	Console.ReadKey();
}

private static void DisplayInfo(Assembly a)
{
	Console.WriteLine("Loaded from GAC? {0}",a.GlobalAssemblyCache);
	Console.WriteLine("Asm Name: {0}",a.GetName().Name);
	Console.WriteLine("Asm Version: {0}",a.GetName().Version);
	Console.WriteLine("Asm Culture: {0}",a.GetName().CultureInfo.DisplayName);
	Console.WriteLine("\nHere are the public enums:");

	// 用LINQ查询找到公有枚举
	Type[] types = a.GetTypes();
	var publicEnums = from pe in types where pe.IsEnum && pe.IsPublic select pe;
	foreach (var pe in publicEnums)
	{
		Console.WriteLine(pe);
	}
}
```

### System.Activator类

简单地说，晚期绑定是一种创建一个给定类型实例并在运行时调用其成员，而不需要在编译时知道它存在的一种技术。

咋一看，晚期绑定的作用似乎不那么明显。如果可以“早期绑定”一个类型（比如，设置一个程序集引用并使用C# new 关键字分配类型）的话，我们当然选择早期绑定。因为早期绑定能在编译时判断错误，而晚期绑定是运行时错误。但是晚期绑定对于程序的可扩展性至关重要。

System.Activator类是晚期绑定过程中的关键所在。对于我们当前的例子，只需要关注Activator.CreateInstance()方法，它用来建立一个晚期绑定类型的实例。

```c#
static void Main(string[] args)
{

	Assembly a = null;

	try
	{
		a = Assembly.Load("CarLibrary");
	}
	catch (Exception e)
	{
		Console.WriteLine(e.Message);
		return;
	}
	if (a != null)
	{
		CreateUsingLateBinding(a);
	}
	
	Console.ReadKey();
}

private static void CreateUsingLateBinding(Assembly a)
{
	try
	{
		// 得到Minivan类型的元数据
		Type miniVan = a.GetType("CarLibrary.MiniVan");

		// 在运行时建立Minivan
		object obj = Activator.CreateInstance(miniVan);
		Console.WriteLine("Create a {0} using late binding!", obj);
	}
	catch (Exception ex)
	{
		Console.WriteLine(ex.Message);
	}
}
```

在运行该应用前，需要使用Windows EXplorer将CarLibrary.dll手工复制到bin\Debug文件夹中。这是因为我们使用的是Assembly.Load()，因此CLR将只探测客户端文件夹(如果你愿意，你可以使用Assembly.LoadFrom()向程序集输入一个路径，尽管这没必要)

注意，Activator.CreateInstance()方法返回一个基本的System.Object类型，而不是一个强类型的MiniVan。因此，如果要在obj变量上用点(.)操作，将不会看到任何MiniVan类的成员。咋一看，我们可以用显示强制类型转换解决这个问题：

```c#
// 是否需要通过强制转换来访问MiniVan的成员
// 不！编译器错误
object obj = (MiniVan)Activator.CreateInstance(miniVan);
```

因为程序没有应用CarLibrary.dll

### 调用没有参数的方法

假定希望调用MiniVan中的TurboBoost()方法。回想一下，这个方法设置引擎状态为"dead"并显示一个消息框。第一步是使用 Type.GetMethod()方法为TurbuBoost()方法得到一个MethodInfo对象。接着，可以使用MethodInfo类型的Invoke()方法来调用MiniVan.Turboboost。MethodInfo.Invoke()需要把所有的参数送到MethodInfo代表的方法中。这些参数用一组System.Object类型表示(作为方法的参数，可以是任意数量的不同对象实体)。

```c#
static void CreateUsingLateBinding()
{
	Assembly asm = Assembly.Load("CarLibrary");

	// 得到 MiniVan类型的元数据
	Type type = asm.GetType("CarLibrary.MiniVan");

	// 在运行中建立 MiniVan
	object obj = Activator.CreateInstance(type);
	Console.WriteLine("Create a {0} using late binding!",obj);
	// 得到 TurboBoost的信息
	MethodInfo mi = type.GetMethod("TurboBoost");

	// 调用方法('null'意味着没有参数)
	var result =  mi.Invoke(obj, null);

	Console.WriteLine(result);
}
```

### 调用有参数的方法

在使用晚期绑定调用需要参数的方法时，要讲参数打包到一个object类型的数组中。CarLibrary.dll版在Car类中定义了以下方法

```c#
public void TurnOnRadio(bool musicOn, MusicMedia mm)
{
	if (musicOn)
	{
		MessageBox.Show(string.Format("Jamming {0}", mm));
	}
	else
	{
		MessageBox.Show("Quiet time...");
	}
}

public enum MusicMedia
{
	musicCd,
	musicTape,
	musicRadio,
	musicMp3
}
```

以下是Program类的新方法，它调用TurnOnRadio()。

```c#
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
```

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f61ver33n2j30bq05t74t.jpg" style="width:60%" />













