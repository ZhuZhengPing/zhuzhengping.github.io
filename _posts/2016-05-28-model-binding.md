---
layout: post
title:  "model绑定"
date:   2016-05-28 16:32:18 +0800
categories: mvc
tags: model
author: Zhengping Zhu
---

* content
{:toc}

## 概念

 model 绑定是使用 http 请求传输数据，每次我们定义了一个操作方法需要一个参数时，我们一直依赖于 model 绑定， model 绑定创建参数对象





### 准备项目

我们创建了一个 basic templete 的MVC项目，在 Models 文件夹下面创建 Person.cs class 

```c#
public partial class Person
{
	public int PersonId { get; set; }
	public string FirstName { get; set; }
	public string LastName { get; set; }
	public DateTime BirthDate { get; set; }
	public Address HomeAddress { get; set; }
	public bool IsApproved { get; set; }
	public Role Role { get; set; }
}

public class Address
{
	public string Line1 { get; set; }
	public string Line2 { get; set; }
	public string City { get; set; }
	public string PostalCode { get; set; }
	public string Country { get; set; }
}

public enum Role
{
	Admin,
	User,
	Guest
} 
```

我们也创建了一个 Home controller ，定义了 Person 对象

```c#
public class HomeController : Controller
{
	private Person[] personData = { 
		new Person {PersonId = 1, FirstName = "Adam", LastName = "Freeman",  Role = Role.Admin}, 
		new Person {PersonId = 2, FirstName = "Steven", LastName = "Sanderson",   Role = Role.Admin}, 
		new Person {PersonId = 3, FirstName = "Jacqui", LastName = "Griffyth",  Role = Role.User}, 
		new Person {PersonId = 4, FirstName = "John", LastName = "Smith",  Role = Role.User}, 
		new Person {PersonId = 5, FirstName = "Anne", LastName = "Jones",  Role = Role.Guest} 
	};
	public ActionResult Index(int id)
	{
		Person dataItem = personData.Where(p => p.PersonId == id).First();
		return View(dataItem);
	} 
}
```

我们创建 /Views/Home/Index.cshtml 来支持 action 

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "Index";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>Person</h2>
<div><label>ID:</label>@Html.DisplayFor(m => m.PersonId)</div>
<div><label>First Name:</label>@Html.DisplayFor(m => m.FirstName)</div>
<div><label>Last Name:</label>@Html.DisplayFor(m => m.LastName)</div>
<div><label>Role:</label>@Html.DisplayFor(m => m.Role)</div> 
```

最后，我们在 /Content/Site.css 中添加一些css样式

```css
label { 
	display: inline-block; 
	width: 100px; 
	font-weight:bold; 
	margin: 5px;
} 
form  label { 
	float: left;
} 
input.text-box { 
	float: left; 
	margin: 5px;
} 
button[type=submit] { 
	margin-top: 5px; 
	float: left; 
	clear: left;
} 
form  div {
	clear: both;
} 
```

### 理解 model 绑定

 model 绑定是 http 请求和 c# action 的桥梁，大多数MVC框架的项目依赖 model 绑定，当我们请求 /Home/Index/1 ,将显示如下结果

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4mz2aleqhj30as07774u.jpg" style="width:80%" />

MVC框架转义URL部分，最后调用 Home controller 下的 index action 

```c#
public ActionResult Index(int id) { }
```

在接下来的示例中，我们没有改 /App_Start/RouteConfig.cs 文件

```c#
public class RouteConfig
{
	public static void RegisterRoutes(RouteCollection routes)
	{
		routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

		routes.MapRoute(name: "Default",
			url: "{controller}/{action}/{id}",
			defaults: new
			{
				controller = "Home",
				action = "Index",
				id = UrlParameter.Optional
			}
		);
	}
}
```

当我们访问 /Home/Index/1 ，URL最后的部分分配到 routing 的 id 属性，当方法参数符合的时候， action invoker 使用 routing 信息来调用 index action 方法， ControllerActionInvoker 为默认的 action invoker`,依赖 model 绑定生成的数据来调用 action , model 绑定在 IModelBinder 定义

```c#
namespace System.Web.Mvc { 
    public interface IModelBinder { 
        object BindModel(ControllerContext controllerContext,  
            ModelBindingContext bindingContext); 
    } 
}
```

你可以使用多种 model 绑定，每个 model 绑定负责一个或多个 model 类型，当 action invoker 需要调用 action 方法时，它会 action 方法的参数，并且在 model 绑定负责的类型里面查找

### 使用默认的 model 绑定

尽管可以创建自定义的 model 绑定，一般还是使用内置的绑定类 DefaultModelBinder 

* DefaultModelBinder 查找参数的顺序*

Source				|描述
Request.Form		|`HTML form 里面取值
RouteData.Values 	|`routes 里面包含的值
Request.QueryString	|请求的URL里面取值
Request.Files		|上传文件里面取值

### 绑定简单类型

当我们处理简单的 parameter types ， DefaultModelBinder 使用 System.ComponentModel.TypeDescriptor 把请求的数据转换成 parameter type ,例如，如果提供的参数是 apple 可是 paramter type 需要 int 类型， DefaultModelBinder 不会模型绑定，设置参数类型为 nullable 可以变得简单

```c#
public ActionResult Index(int? id) { 
    Person dataItem = personData.Where(p => p.PersonId == id).First(); 
    return View(dataItem); 
} 
```

还可以设置参数的默认值，当参数为 null 时使用

```c#
public ActionResult Index(int id = 1) { 
    Person dataItem = personData.Where(p => p.PersonId == id).First(); 
    return View(dataItem); 
}
```

### 绑定复杂类型

当 action 方法是一个复杂类型时， DefaultModelBinder 使用反射获得 public properties 并绑定

```c#
public class PersonController : Controller
{
	private Person[] personData = { 
		new Person {FirstName = "Adam", LastName = "Freeman", Role = Role.Admin},            
		new Person {FirstName = "Steven", LastName = "Sanderson", Role = Role.Admin},     
		new Person {FirstName = "Jacqui", LastName = "Griffyth", Role = Role.User},       
		new Person {FirstName = "John", LastName = "Smith", Role = Role.User},      
		new Person {FirstName = "Anne", LastName = "Jones", Role = Role.Guest} 
	};

	public ActionResult Index(int id = 1)
	{
		Person dataItem = personData.Where(p => p.PersonId == id).First(); return View(dataItem);
	}

	public ActionResult CreatePerson()
	{
		return View(new Person());
	}
	[HttpPost]
	public ActionResult CreatePerson(Person model)
	{
		return View("Index", model);
	}
}
```

 CreatePeople 有一个带参的重载方法，并创建 /View/Home/CreatePerson.cshtml 视图

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "Index";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>Person</h2>
<div><label>ID:</label>@Html.DisplayFor(m => m.PersonId)</div>
<div><label>First Name:</label>@Html.DisplayFor(m => m.FirstName)</div>
<div><label>Last Name:</label>@Html.DisplayFor(m => m.LastName)</div>
<div><label>Role:</label>@Html.DisplayFor(m => m.Role)</div> 
```

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f4qz256uuxj30mz091q4g.jpg" style="width:100%" />

如果 model 需要复杂的类型,如下图所示，我们可以嵌套属性

```c#
public class Address
{
	public string Line1 { get; set; }     
	public string Line2 { get; set; }    
	public string City { get; set; }    
	public string PostalCode { get; set; }     
	public string Country { get; set; } }
}
```

如果我们需要显示 Line1 的值， model binder 会查找 HomeAddress.Line1 的值

### 创建 Easily-Bound HTML 

如下面所示，可以修改 CreatePeople.cshtml 视图，以便显示 Address 的属性

```html
@model MvcApplication2.Models.Person
@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/Views/Shared/_layout.cshtml";
}

<h2>Create Person</h2>
@using (Html.BeginForm())
{
    <div>@Html.LabelFor(m => m.PersonId)@Html.EditorFor(m => m.PersonId)</div>
    <div>@Html.LabelFor(m => m.FirstName)@Html.EditorFor(m => m.FirstName)</div>
    <div>@Html.LabelFor(m => m.LastName)@Html.EditorFor(m => m.LastName)</div>
    <div>@Html.LabelFor(m => m.Role)@Html.EditorFor(m => m.Role)</div>
    <div>
        @Html.LabelFor(m => m.HomeAddress.City)
        @Html.EditorFor(m => m.HomeAddress.City)
    </div>     
	<div>
        @Html.LabelFor(m => m.HomeAddress.Country)
        @Html.EditorFor(m => m.HomeAddress.Country)
    </div>
    <button type="submit">Submit</button>
} 
```

我们使用强类型 EditorFor`,指定 HomeAddress 属性， helper 自动设置 model 绑定的值到对应的文本框

```html
<input class="text-box single-line" id="HomeAddress_Country" name="HomeAddress.Country" type="text" value="" />
```

我们还需要修改 Index.cshtml 视图，显示传递过来的 HomeAddress 属性值

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "Index";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>Person</h2>
<div><label>ID:</label>@Html.DisplayFor(m => m.PersonId)</div>
<div><label>First Name:</label>@Html.DisplayFor(m => m.FirstName)</div>
<div><label>Last Name:</label>@Html.DisplayFor(m => m.LastName)</div>
<div><label>Role:</label>@Html.DisplayFor(m => m.Role)</div>
<div><label>City:</label>@Html.DisplayFor(m => m.HomeAddress.City)</div>
<div><label>Country:</label>@Html.DisplayFor(m => m.HomeAddress.Country)</div> 
```

### 指定自定义的前缀

程序开发时可能有一种需求，你根据一个类型生成了 html ,可是需要绑定到另外一个，我们增加一个类

```c#
public class AddressSummary
{
	public string City { get; set; }         
	public string Country { get; set; }
}
```

在 controller 里面添加 DisplaySummary action 

```c#
public ActionResult DisplaySummary(AddressSummary summary) 
{ 
	return View(summary); 
} 
```

创建 DisplaySummary.cshtml 

```html
@model MvcApplication2.Models.AddressSummary
@{
    ViewBag.Title = "DisplaySummary";
}

<h2>Address Summary</h2>
<div><label>City:</label>@Html.DisplayFor(m => m.City)</div>
<div><label>Country:</label>@Html.DisplayFor(m => m.Country)</div>
```

为了演示绑定不同类型的问题，我们改变 CreatePerson.cshtml 的 BeginForm ，让它提交到 DisplaySummary 

```html
@model MvcApplication2.Models.Person
@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/Views/Shared/_layout.cshtml";
}

<h2>Create Person</h2>
@using(Html.BeginForm("DisplaySummary","Person")) 
{
    <div>@Html.LabelFor(m => m.PersonId)@Html.EditorFor(m => m.PersonId)</div>
    <div>@Html.LabelFor(m => m.FirstName)@Html.EditorFor(m => m.FirstName)</div>
    <div>@Html.LabelFor(m => m.LastName)@Html.EditorFor(m => m.LastName)</div>
    <div>@Html.LabelFor(m => m.Role)@Html.EditorFor(m => m.Role)</div>
    <div>
        @Html.LabelFor(m => m.HomeAddress.City)
        @Html.EditorFor(m => m.HomeAddress.City)
    </div>     <div>
        @Html.LabelFor(m => m.HomeAddress.Country)
        @Html.EditorFor(m => m.HomeAddress.Country)
    </div>
    <button type="submit">Submit</button>
} 
```

你可以看到这个问题，当你链接`/Home/CreatePerson ,提交表单，你填写的 City 和 Country 不会显示在 DisplaySummary 视图

*给 Action Method 提供绑定属性*

```c#
public ActionResult DisplaySummary([Bind(Prefix = "HomeAddress")]AddressSummary summary)
{
	return View(summary);
} 
```

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4r14mdhghj30lb0bg0ud.jpg" style="width:80%" />

### 有选择的绑定属性

如果 AddressSummary 的 Country 属性不能修改，首先要做的是隐藏此字段，然而，有些恶意用户可能提交了 Country 值，通过 Bind 特性来避免修改

```c#
 public ActionResult DisplaySummary([Bind(Prefix = "HomeAddress", Exclude = "Country")]AddressSummary summary)
{
	return View(summary);
}
```

 Exclude 属性允许你在 model 绑定中排除某个属性，当 Bind 特性加在 action 方法参数上时，只在 action 方法上起作用，我们也可以排除 model class 的属性

```c#
[Bind(Include = "City")]
public class AddressSummary
{
	public string City { get; set; }         
	public string Country { get; set; }
}
```

>* `[Bind(Include = "City")]`:显示 City 属性，
>* `[Bind(Exclude = "City")]`:显示 Country 字段

### 绑定 Arrays 

为了演示绑定 Arrays ，新建一个 Names action 

```c#
public ActionResult Names(string[] names)
{
	names = names ?? new string[0];
	return View(names);
} 
```

创建对应的视图

```html
@model string[]
@{
    ViewBag.Title = "Names";
}
<h2>Names</h2>
@if (Model.Length == 0)
{
    using (Html.BeginForm())
    {
        for (int i = 0; i < 3; i++)
        {
            <div><label>@(i + 1):</label>@Html.TextBox("names")</div>
        }
        <button type="submit">Submit</button>
    }
}
else
{
    foreach (string str in Model)
    {
        <p>@str</p>
    }
    @Html.ActionLink("Back", "Names");
} 
```

生成的 HTML 如下

```html
<form action="/Home/Names" method="post">             
    <div><label>1:</label><input id="names" name="names" type="text" value="" /></div>     <div><label>2:</label><input id="names" name="names" type="text" value="" /></div> 
    <div><label>3:</label><input id="names" name="names" type="text" value="" /></div> 
    <button type="submit">Submit</button> 
</form>
```

当我们点击提交按钮，可以看到下面的结果

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4r3ufawtyj30mz094wfi.jpg" style="width:80%" />

### 绑定 Collections 

```c#
public ActionResult Names(IList<string> names) {     
	names = names ?? new List<string>(); 
    return View(names); 
} 
```

我们使用 IList 接口，修改 Names.cshtml 视图

```html
@model IList<string>
@{
    ViewBag.Title = "Names";
}
<h2>Names</h2>
@if (Model.Count == 0)
{
    using (Html.BeginForm())
    {
        for (int i = 0; i < 3; i++)
        {
            <div><label>@(i + 1):</label>@Html.TextBox("names")</div>
        }
        <button type="submit">Submit</button>
    }
}
else
{
    foreach (string str in Model)
    {
        <p>@str</p>
    }
    @Html.ActionLink("Back", "Names");
} 
```

### 绑定自定义集合

```c#
public ActionResult Address(IList<AddressSummary> addresses) {             
	addresses = addresses ?? new List<AddressSummary>(); 
	return View(addresses); 
} 
```

新建一个 /Views/Home/Address.cshtml 视图

```html
@using MvcApplication2.Models
@model IList<AddressSummary>
@{
    ViewBag.Title = "Address";
}
<h2>Addresses</h2>
@if (Model.Count() == 0)
{
    using (Html.BeginForm())
    {
        for (int i = 0; i < 3; i++)
        {
            <fieldset>
                <legend>Address @(i + 1)</legend>
                <div><label>City:</label>@Html.Editor("[" + i + "].City")</div>
                <div><label>Country:</label>@Html.Editor("[" + i + "].Country")</div>
            </fieldset>
        }
        <button type="submit">Submit</button>
    }
}
else
{
    foreach (AddressSummary str in Model)
    {
        <p>@str.City, @str.Country</p>
    }
    @Html.ActionLink("Back", "Address");
} 
```

### 手动调用模型绑定

```c#
public ActionResult Address()
{
	IList<AddressSummary> addresses = new List<AddressSummary>();
	UpdateModel(addresses); 
	return View(addresses);
}
```

 UpdateModel 方法带有一个 object 参数，当我们手动调用了绑定，我们可以限制绑定的数据

```c#
public ActionResult Address()
{
	IList<AddressSummary> addresses = new List<AddressSummary>();
	UpdateModel(addresses, new FormValueProvider(ControllerContext));
	return View(addresses);
}
```

 UpdateModel 方法实现 IValueProvider 接口

Source				|IValueProvider接口	
Request.Form		|FormValueProvider
RouteData.Values	|RouteDataValueProvider
Request.QueryString	|QueryStringValueProvider
Request.Files		|HttpFileCollectionValueProvider

最通用的获取数据的方式是 form 值

*限制绑定的数据*

```c#
public ActionResult Address(FormCollection formData)
{
	IList<AddressSummary> addresses = new List<AddressSummary>();
	UpdateModel(addresses, formData);
	return View(addresses);
}
```

 FormCollection 实现了 IValueProvider ，如果我们定义一个 parameter 类型的 action 方法， model binder 将提供给 UpdateModel 对象

### 处理 Binding Error 

 model binder 绑定错误会抛出 InvalidOperationException ,错误详细信息可以在 ModelState 中找到

```c#
public ActionResult Address(FormCollection formData)
{
	IList<AddressSummary> addresses = new List<AddressSummary>(); 
	try
	{
		UpdateModel(addresses, formData);
	}
	catch (InvalidOperationException ex)
	{
		// provide feedback to user 
	}
	return View(addresses);
}
```

作为一种替代方式，我们可以使用 TryUpdateModel 

```c#
public ActionResult Address(FormCollection formData)
{
	IList<AddressSummary> addresses = new List<AddressSummary>();
	if (TryUpdateModel(addresses, formData))
	{
		// proceed as normal 
	}
	else
	{
		// provide feedback to user 
	}
	return View(addresses);
}
```

### 自定义 model binding 

自定义 model binding 需要实现 IValueProvider 

```c#
public interface IValueProvider { 
	bool ContainsPrefix(string prefix); 
	ValueProviderResult GetValue(string key); 
}
```

添加 CountryValueProvider.cs 类，实现 IValueProvider 

```c#
public class CountryValueProvider : IValueProvider 
{
	public bool ContainsPrefix(string prefix)
	{
		return prefix.ToLower().IndexOf("country") > -1;
	}

	public ValueProviderResult GetValue(string key)
	{
		if (ContainsPrefix(key))
		{
			return new ValueProviderResult("USA", "USA",CultureInfo.InvariantCulture);
		}
		else
		{
			return null;
		}
	}
}
```

为了注册 value provider ，我们还需创建 ValueProviderFactory 派生类

```c#
public class CustomValueProviderFactory : ValueProviderFactory
{
	public override IValueProvider GetValueProvider(ControllerContext controllerContext)
	{
		return new CountryValueProvider();
	}
}
```

我们在 Global.asax 的 Application_Start 中注册 factory 

```c#
ValueProviderFactories.Factories.Insert(0, new CustomValueProviderFactory());
```

添加 action 方法，测试自定义绑定

```c#
public ActionResult Address()
{
	IList<AddressSummary> addresses = new List<AddressSummary>();
	UpdateModel(addresses); 
	return View(addresses);
}
```

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f4rdlvb9szj30n10kk771.jpg" style="width:80%" />

### 自定义 Modle Binder 

```c#
public class AddressSummaryBinder : IModelBinder
{
	public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
	{
		AddressSummary model = (AddressSummary)bindingContext.Model ?? new AddressSummary(); 
		model.City = GetValue(bindingContext, "City");
		model.Country = GetValue(bindingContext, "Country"); 
		return model;
	}

	private string GetValue(ModelBindingContext context, string name)
	{
		name = (context.ModelName == "" ? "" : context.ModelName + ".") + name;
		ValueProviderResult result = context.ValueProvider.GetValue(name);
		if (result == null || result.AttemptedValue == "")
		{
			return "<Not Specified>";
		}
		else
		{
			return (string)result.AttemptedValue;
		}
	}
}
```

MVC框架需要 model 实例的时候调用 BindModel ,我们将展示如何注册 model binder 

 BindModel 的参数是 ControllerContext 对象，你可以获得详细的请求和 ModelBindingContext 对象

* ModelBindingContext 有用的属性*

属性			|描述
Model			|通过调用 UpdateModel 方法返回 model 对象
ModelName		|被绑定的模型名称
ModelType		|被绑定的模型类型
ValueProvider	|返回 IValueProvider 的实例，用于取数据

### 注册自定义 Model Binder 

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f4rgjgirghj30n00jiack.jpg" style="width:80%" />





