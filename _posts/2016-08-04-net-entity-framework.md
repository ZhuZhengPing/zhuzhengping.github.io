---
layout: post
title:  "Entity framework(4.0)"
date:   2016-08-04 16:32:18 +0800
categories: linq
tags: .net linq
author: Zhengping Zhu
---

* content
{:toc}

## 概念

ADO.NET Entity Framework 是一种编程模型，主要减少数据库结构与面向对象编程结构之间的差异。使用EF，你不用编写 SQL 代码就能与关系型数据库交互。并且，在与强类型进行 LINQ 查询时，EF 还会在运行时生成正确的 SQL 语句。





### Entity Framework 的基础知识

EF API 是以 ADO.NET 为基础的。和其他 ADO.NET 交互方式一样，Entity Framework 使用一个 ADO.NET 数据提供程序来与数据存储进行交互。所不同的是，在能够与 EF API 交互之前，微软 SQL Server 数据提供程序已经对底层结构进行了必要的更新以支持 System.Data.Entity.dll 程序集。

System.Data.Entity.dll 程序集还包含了各种命名空间来解释 EF 服务本身。EF API 的两个关键部分为对象服务和实体客户端。

### 对象服务的作用

对象服务是 EF 的一部分，它在代码中对客户端实体进行控制。例如，对象服务跟踪你对实体的更改(如将汽车的颜色由绿色改为蓝色)、管理实体间的关系(如查找用户 Steve Hagen 的所有订单)并提供将更改保存到数据库的方法，以及用 XML 或二进制序列化服务对实体状态进行持久化的方法。

就编程方面而言，对象服务层对所有扩展 EntityObject 基类的类进行管理。正如你所想的一样，EntityObject 是 EF 编程模型中所有实体类的基类。

### 实体客户端的作用

EF API 的另一个主要部分是实体客户端层，它使用基本的 ADO.NET 数据提供程序来建立数据库连接、基于实体状态和 LINQ 查询生成 SQL语句、将数据库数据映射到实体，以及处理其他在不使用 Entity Framework 时常见的细节问题。

实体客户端层一般在后台运行，但如果你想完全控制它的工作(如生成 SQL 查询和处理数据库返回的数据)，也可以直接对其进行操作。

如果你需要更大程度地控制实体客户端基于 LINQ 查询创建 SQL 语句的方式，你可以使用 Entity SQL. Entity SQL 是直接作用于实体的与数据库无关的 SQL .一旦创建了一个 Entity SQL 查询，它将被直接发送给实体客户端服务，并转换为符合基本数据提供程序的 SQL 语句。

### *.edmx文件的作用

为了使 Entity Framework API能够将实体类数据正确映射到数据库表数据，你需要定义适当的映射逻辑。在所有数据模型驱动的系统中，实体、真正的数据库以及映射层都会被划分为3个相关的部分：概念模型、逻辑模型和物理模型。

>* 概念模型定义了实体以及它们之间的关系
>* 逻辑模型将实体和关系(通过外键约束)映射到表。
>* 物理模型通过制定的存储细节(如表架构、表分割和索引)来表示特定的数据引擎的能力。

在 EF 的世界里，这三层均存放在基于 XML 格式的文件里。当使用 Visual Studio 2010集成的 Entity Framework 设计器时，会得到一个以*.edmx为扩展名的文件(EDM 为 entity data model)。该文件包含实体、物理数据库的 XML 描述，并且介绍了如何在概念模型和物理模型之间映射这些信息。

当使用 VS 编译基于 EF 的项目时，*.edmx 文件将生成3个独立的文件：用于概念模型数据的*.csdl、用于物理模型的*.ssdl 和用于映射层的*.msl。然后这3个基于 XML 的文件将以二进制资源的形式绑定到应用程序中。

### ObjectContext和ObjectSet<T>类的作用

EF的最后一个难点是 ObjectContext 类，它是 System.Data.Objects 命名空间的一员。在生成*.emdx 文件时，你将得到映射到数据库表的实体类和一个继承自 OjbectContext 的类。该类通常用于对象服务和实体客户端之间的交互。

ObjectContext 为子类提供了大量的核心服务，包括保存所有更新的功能、调整连接字符串、删除对象、调用存储过程、处理其他底层细节。

*OjbectContext 的常用成员*

成员|含义
AcceptAllChanges()	|接受对对象上下文中的实例对象所做的所有改变
AddObject()			|向对象上下文中添加一个对象
DeleteObject()		|对一个要删除的对象进行标记
ExecuteFunction()|执行数据库中的一个存储过程
ExecuteStoreCommand()|直接向数据库发送一条 SQL 命令
GetObjectByKey()	|通过主键在对象上下文中查询一个对象
SaveChanges()		|向数据库提交所有更新
CommandTimeout		|该属性为所有对象上下文操作获取或设置以秒记的超时值
Connection			|该属性返回当前对象上下文使用的连接字符串
SavingChanges		|当对象上下文向数据存储保存更改时将触发该事件

ObjectContext 的派生类作为一个容器，管理那些存储在 OjbectSet<T>集合中的实体对象。例如，如果为 AutoLot 数据库的 Inventory 表生成*.edmx 文件，你最终将得到一个 AutoLotEntities 类。该类包含一个 Inventories 属性(注意，这里是复数形式)，它封装了一个 ObjectSet<Inventory>类型的数据成员。如果为 AutoLot 数据库的 Orders 表创建一个 EDM ，AutoLotEntites 类将定义另一个 Orders 属性，它封装了一个 ObjectSet<Order>类型的成员变量。

*ObjectSet<T>的常用成员*

ObjectSet<T>的成员			|含义
AddObject()					|向集合中插入一个新的实体对象
CreateObject()			|创建指定实体类型的实例
DeleteObject				|标记一个要删除的对象

当获取了对象上下文中正确的属性后，就可以调用 ObjectSet<T>的这些成员了。

```c#
using(AutoLotEntites context = new AutoLotEntites()){
	// 使用实体向 Inventory 表中添加一条新的记录
	context.Cars.AddObject(new Car(){
		AutoIDNumber = 987;
		...
	});
	context.SaveChanges();
}
```

这里的 AutoLotEntites 继承自 ObjectContext。Cars 属性用来访问 OjbectSet<Car>变量。使用该引用插入一个新的 Car 实体对象，并通知 ObjectContext 将所有更改保存到数据库。

### 汇总

<img src="http://ww2.sinaimg.cn/small/006dag38jw1f6jtpuqyh0j30ie0d1418.jpg" style="width:60%" />

该图咋看上去似乎很复杂，其实不然。例如，你对上下文中的实体编写了一个 LINQ 查询，该查询被传递给对象服务，对象服务将 LINQ 命令转换为实体客户端可以理解的树。然后实体客户端将树转换为符合 ADO.NET 提供程序的 SQL 语句。提供程序返回一个数据读取器(如一个DbDataReader的派生对象)，客户端服务使用该读取器(EntityDataReader)将数据传入对象服务。最终 C# 代码库所得到的是数据的枚举(IEnumerable<T>)

还有一种情况，如果你的 C#代码希望对客户端服务创建的发送到数据库的 SQL 语句进行更多地控制，你可以编写 C# 代码直接将 Entity SQL 传递给实体客户端或对象服务。最终得到的也是一个 IEnumerable<T>。

### 创建和分析 EDM

在使用 Entity Framework时，第一个步骤就是创建由*.edmx 文件定义的概念、逻辑、物理模型数据。

单击 项目->添加->新建项...菜单项，插入一个新的 ADO.NET 实体数据模型项 InventoryEDM.edmx

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f6jysjbhjlj30lw0b7tal.jpg" style="width:100%" />

完成向导之后，IDE将打开 EDM 设计器，可以看到所有生成的实体，使用模型浏览器窗口可以浏览设计器中任意实体的结构(打开 视图->其他窗口->实体数据模型对象浏览器)。

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f6jytuc71gj30qc0hp76x.jpg" style="width:100%" />

默认情况下，实体的名称取决于原始的数据库对象的名称。但概念模型中的实体的名称是没有约束的。你可以更改实体名称及其属性的名称，接下来，我们将 Inventory 实体改名为 Car ,PerName 属性改名为 CarNickname.

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f6jz2r1yxsj30nm0ea0ul.jpg" style="width:80%" />

在设计器中选择整个Car实体，再查看Properties窗口。你会发现 Entity Set Name 字段也从 Inventories 改为 Cars。Entity Set的值是很重要的，因为它与数据上下文类的属性名相对应，而且可以用于修改数据库。ObjectContext 派生类的这个属性封装了一个ObjectSet<T>成员变量。

编译应用程序，然后刷新代码库，可以看到基于*.edmx 文件数据生成的*.csdl、*.msdl、*.ssdl文件。

修改了数据之后，你既可以通过 Mapping Details 窗口(打开 视图->其他窗口->详细映射信息)来浏览概念层和物理层之间的映射。

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f6jzeczmazj30sz087q4o.jpg" style="width:100%" />

现在我们来看看 EDM 向导为我们生成了什么。在解决方案中右击 InventoryEDM.edmx文件，选择打开方式菜单项，在弹出的对话框中选择 XML Editor选项。

```xml
<!-- SSDL 内容 -->
<edmx:StorageModels>
	<Schema Namespace="InvertyModel.Store" Provider="System.Data.SqlClient" ProviderManifestToken="2008" Alias="Self" xmlns:store="http://schemas.microsoft.com/ado/2007/12/edm/EntityStoreSchemaGenerator" xmlns:customannotation="http://schemas.microsoft.com/ado/2013/11/edm/customannotation" xmlns="http://schemas.microsoft.com/ado/2009/02/edm/ssdl">
	<EntityType Name="Inventory">
	  <Key>
		<PropertyRef Name="CarID" />
	  </Key>
	  <Property Name="CarID" Type="int" Nullable="false" />
	  <Property Name="Color" Type="varchar" MaxLength="50" />
	  <Property Name="Make" Type="varchar" MaxLength="50" />
	  <Property Name="PerName" Type="varchar" MaxLength="50" />
	</EntityType>
	<EntityContainer Name="InvertyModelStoreContainer">
	  <EntitySet Name="Inventory" EntityType="Self.Inventory" Schema="dbo" store:Type="Tables" />
	</EntityContainer>
	</Schema>
</edmx:StorageModels>
```

注意，在<Schema>节点中定义了 ADO.NET 数据库提供程序的名称，在与数据库(System.Data.SqlClient)通信时会用到这些信息。<EntityType>节点标记了物理数据库表的名称以及表中各列的名称。

*.edmx 文件中下一个重要的部分是<edmx:ConceptualModels>元素，它定义了更改过的客户端实体。注意，Cars 实体定义了 CarNickname属性。

```xml
<!-- CSDL 内容 -->
<edmx:ConceptualModels>
  <Schema Namespace="InvertyModel" Alias="Self" xmlns:annotation="http://schemas.microsoft.com/ado/2009/02/edm/annotation" xmlns:customannotation="http://schemas.microsoft.com/ado/2013/11/edm/customannotation" xmlns="http://schemas.microsoft.com/ado/2008/09/edm">
	<EntityType Name="Car">
	  <Key>
		<PropertyRef Name="CarID" />
	  </Key>
	  <Property Name="CarID" Type="Int32" Nullable="false" />
	  <Property Name="Color" Type="String" MaxLength="50" FixedLength="false" Unicode="false" />
	  <Property Name="Make" Type="String" MaxLength="50" FixedLength="false" Unicode="false" />
	  <Property Name="CarNickName" Type="String" MaxLength="50" FixedLength="false" Unicode="false" />
	</EntityType>
	<EntityContainer Name="InvertyEntities" annotation:LazyLoadingEnabled="true">
	  <EntitySet Name="Cars" EntityType="InvertyModel.Car" />
	</EntityContainer>
  </Schema>
</edmx:ConceptualModels>
```

这之后是映射层，映射详细信息窗口(以及EF运行时)使用映射层来联系概念模型和物理模型的名称

```xml
<!-- C-S 映射内容 -->
<edmx:Mappings>
  <Mapping Space="C-S" xmlns="http://schemas.microsoft.com/ado/2008/09/mapping/cs">
	<EntityContainerMapping StorageEntityContainer="InvertyModelStoreContainer" CdmEntityContainer="InvertyEntities">
	  <EntitySetMapping Name="Cars">
		<EntityTypeMapping TypeName="InvertyModel.Car">
		  <MappingFragment StoreEntitySet="Inventory">
			<ScalarProperty Name="CarID" ColumnName="CarID" />
			<ScalarProperty Name="Color" ColumnName="Color" />
			<ScalarProperty Name="Make" ColumnName="Make" />
			<ScalarProperty Name="CarNickName" ColumnName="PerName" />
		  </MappingFragment>
		</EntityTypeMapping>
	  </EntitySetMapping>
	</EntityContainerMapping>
  </Mapping>
</edmx:Mappings>
```

*.edmx 文件的最后一部分是<Designer>元素，EF 运行时并不使用这些数据。

确保项目被编译一次，然后单击解决方案中的显示所有文件按钮。然后打开 obj\Debug 文件夹，进入 edmxResourcesToEmbed 子目录。在该目录下你会发现基于整个*.edmx 文件而生成的3个 XML 文件

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f6k050gyacj30kl0dbdih.jpg" style="width:70%" />

这些文件中的数据将以二进制的形式嵌入到程序集汇总，因此，.NET 应用程序具备所有用于理解 EDM 中概念、物理和映射层的信息

### 查看生成的源代码

打开 Class View 窗口，展开默认的命名空间。你会发现除了 Program 类以外，EDM 向导还生成了一个实体类以及 InvertyEntities类。

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f6k0ci7vigj30l80bn0u4.jpg" style="width:70%" />

如果回到解决方案展开  InventoryEDM.edmx 节点，你会发现一个用于 IDE 维护的文件 InventoryEDM.Designer.cs。

```c#
public partial class InvertyEntities : ObjectContext
{
	public InvertyEntities() : base("name=InvertyEntities", "InvertyEntities")
	{
		this.ContextOptions.LazyLoadingEnabled = true;
		OnContextCreated();
	}
}
```

最后在设计器代码文件中还有一个有趣的东西就是 Car 实体类。实体类中的大部分代码都是构成概念模型的属性集合。每个属性的 set 逻辑都调用了 EF API 的 StructuralObject.SetValidVlaue()静态方法。下面是 Car 实体类的 CarNickName 属性的实现

```c#
public partial class Car:EntityObject{
...
	public global::System.String.CarNickname{
		get{
			return _CarNickname;
		}
		set{
			OnCarNicknameChanging(value);
			ReportPropertyChanging("CarNickname");
			_CarNickname = StructuralObject.SetValidVlaue(value,true);
			ReportPropertyChanged("CarNickname");
			OnCarNicknameChangED();
		}
	}
	private global::System.String _CarNickname;
	partial void OnCarNicknameChanging(global::System.String value);
	private void OnCarNicknameChanged():
}
```

### 强化生成的代码

设计器生成的所有的类都使用 partial 关键字声明，这允许我们在多个 c# 代码中实现这些类。在使用 EF 编程模型时非常有用，因为这意味着你可以为实体添加”真正“的方法，从而更好地对业务领域进行建模。

在本例中，我们在重写了 Car 实体类的 ToString()方法，返回一个格式化的字符串来描述实体的状态。

```c#
public partial class Car
{
	public override string ToString()
	{
		return string.Format("{0} is a {1} {2} with ID {3}", this.CarNickName ?? "**No Name**", this.Color, this.Make, this.CarID);
	}
}
```

### 对概念模型进行编程

现在我们可以写一些与 EDM 交互的代码了。修改 Program 类，在 Main()方法中调用两个辅助方法。其中一个辅助方法使用概念模型打印 Inventory 数据库表的所有记录，另一个辅助方法向 Inventory 表插入一条新记录

```c#
public static void Main(string[] args)
{
	AddNewRecord();
	PrintAllInventory();
	Console.ReadLine();
}

private static void PrintAllInventory()
{
	using (InvertyEntities context = new InvertyEntities())
	{
		IEnumerable<Car> list = context.Cars;
		foreach (var car in list)
		{
			Console.WriteLine(car.ToString());
		}
	}
}

private static void AddNewRecord()
{
	using(InvertyEntities context = new InvertyEntities())
	{
		try
		{
			context.Cars.AddObject(new Car()
			{
				CarID = 2222,
				Make = "Yugo",
				Color = "Brown"
			});
			context.SaveChanges();
		}
		catch (Exception ex)
		{
			Console.WriteLine(ex.InnerException.Message);
		}
	}
}
```

每个辅助方法都创建了一个 ObjectContext 派生类实例。并使用强类型的 Cars 属性来与 OjbectSet<Car>字段进行交互。并且会间接向 ADO.NET 数据提供一条 SQL SELECT 语句。在使用 ObjectSet<Car>的 AddObject()方法插入新的 Car 对象然后调用上下文的 SaveChanges()方法时，实际上执行了一条 SQL INSERT语句。

### 删除记录

当你想在数据库中删除某条记录时，首先要在 OjbectSet<T>中找到正确的项，这可以使用 GetObjectByKey()方法，并传递一个 EntityKey 对象(位于 System.Data 命名空间)。

```c#
private static void RemoveRecord()
{
	// 通过主键查找要删除的汽车
	using (InvertyEntities context = new InvertyEntities())
	{
		// 为查找的实体定义主键
		EntityKey key = new EntityKey("InvertyEntities.Cars", "CarID", 2222);

		Car carToDelete = (Car)context.GetObjectByKey(key);
		if (carToDelete != null)
		{
			context.DeleteObject(carToDelete);
			context.SaveChanges();
		}
	}
}
```

更新记录也很简单，先定位对象，设置其属性值，然后保存更改。

```c#
public static void UpdateRecord()
{
	using (InvertyEntities context = new InvertyEntities())
	{
		// 查找实体
		EntityKey key = new EntityKey("InvertyEntities.Cars", "CarID", 2222);
		
		// 获取实体，更改并保存
		Car carToUpdate = (Car)context.GetObjectByKey(key);
		if (carToUpdate != null)
		{
			carToUpdate.CarNickName = "朱正平";
			context.SaveChanges();
		}
	}
}
```

这个方法看上去有点奇怪，但如果你意识到 GetObjectByKey() 方法返回的实体对象是 ObjectSet<T>字段中一个某个对象的引用的话，就不会再有这种疑惑了。

### 用LINQ to Entities进行查询

其实 EF 和 LINQ 查询一起使用的时候才会更强大。

```c#
var car = (from c in context.Cars where c.CarID == 2222 select c).FirstOrDefault();
```

通过调用 ObjectQuery<T>的 FirstOrDefault()可以找到所需的项，而如果没有 ID 为 2222 的Car，那么默认值为 null。

### 使用 Entity SQL 进行查询

可以肯定的是，大部分时间都会使用 LINQ 来查询 ObjectSet<T>。实体客户端会将你的 LINQ 查询转换成适合的 SQL 语句，并将其传递给数据库进行处理。但如果你想对查询的格式有更多的控制，可以使用 Entity SQL。与 LINQ to Entity 查询类似，Entity SQL 查询也会生成真正的SQL。

```c#
private static void FunWithEntitySQL() 
{
	using (InvertyEntities context = new InvertyEntities()) 
	{
		// 构建一个包含 Entity SQL 语法的字符串
		string query = "select value car from InvertyEntities.Cars as car where car.Color='Brown'";

		// 现在基于该字符串构建一个 ObjectQuery<T>
		var brownCars = context.CreateQuery<Car>(query);
		foreach (var item in brownCars)
		{
			Console.WriteLine(item);
		}
	}
}
```

### 使用实体客户端的数据阅读器对象

当使用 LINQ to Entity 或 Entity SQL 时，得到的数据将被自动映射为实体类。你还可以使用 EntityDataReader 在结果集映射到实体对象之前拦截他们，并进行手工处理。

```c#
private static void FunWithEntityDataReader() 
{
	// 基于*.config文件创建一个连接对象
	using (EntityConnection cn = new EntityConnection("name=InvertyEntities")) 
	{
		cn.Open();

		// 构建一个Entity SQL 查询
		string query = "select value car from InvertyEntities.Cars as car";

		// 创建一个命令对象
		using (EntityCommand cmd = cn.CreateCommand()) 
		{
			cmd.CommandText = query;

			// 最后，获取数据阅读器并处理得到的记录
			using (EntityDataReader dr = cmd.ExecuteReader(CommandBehavior.SequentialAccess)) 
			{
				while (dr.Read())
				{
					Console.WriteLine("ID: {0}", dr["CarID"]);
					Console.WriteLine("Color: {0}", dr["Color"]);
					Console.WriteLine("Make: {0}", dr["Make"]);
					Console.WriteLine("Pet Name: {0}", dr["CarNickname"]);
				}
			}
		}
	}
}
```











