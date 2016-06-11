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

`model`绑定是使用`http`请求传输数据，每次我们定义了一个操作方法需要一个参数时，我们一直依赖于`model`绑定，`model`绑定创建参数对象





### 准备项目

我们创建了一个`basic templete`的MVC项目，在`Models`文件夹下面创建`Person.cs class`

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

我们也创建了一个`Home controller`，定义了`Person`对象

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

我们创建`/Views/Home/Index.cshtml`来支持`action`

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

最后，我们在`/Content/Site.css`中添加一些css样式

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

### 理解`model`绑定

`model`绑定是`http`请求和`c# action`的桥梁，大多数MVC框架的项目依赖`model`绑定，当我们请求`/Home/Index/1`,将显示如下结果

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4mz2aleqhj30as07774u.jpg" style="width:50%" />

MVC框架转义URL部分，最后调用`Home controller`下的`index action`

```c#
public ActionResult Index(int id) { }
```

在接下来的示例中，我们没有改`/App_Start/RouteConfig.cs`文件

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

当我们访问`/Home/Index/1`，URL最后的部分分配到`routing`的`id`属性，当方法参数符合的时候，`action invoker`使用`routing`信息来调用`index action`方法，`ControllerActionInvoker`为默认的`action invoker`,依赖`model`绑定生成的数据来调用`action`,`model`绑定在`IModelBinder`定义

```c#
namespace System.Web.Mvc { 
    public interface IModelBinder { 
        object BindModel(ControllerContext controllerContext,  
            ModelBindingContext bindingContext); 
    } 
}
```

你可以使用多种`model`绑定，每个`model`绑定负责一个或多个`model`类型，当`action invoker`需要调用`action`方法时，它会`action`方法的参数，并且在`model`绑定负责的类型里面查找

### 使用默认的`model`绑定

尽管可以创建自定义的`model`绑定，一般还是使用内置的绑定类`DefaultModelBinder`

*`DefaultModelBinder`查找参数的顺序*

Source				|描述
Request.Form		|`HTML form`里面取值
RouteData.Values 	|`routes`里面包含的值
Request.QueryString	|请求的URL里面取值
Request.Files		|上传文件里面取值

### 绑定简单类型

当我们处理简单的`parameter types`，`DefaultModelBinder`使用`System.ComponentModel.TypeDescriptor`把请求的数据转换成`parameter type`,例如，如果提供的参数是`apple`可是`paramter type`需要`int`类型，`DefaultModelBinder`不会模型绑定，设置参数类型为`nullable`可以变得简单

```
public ActionResult Index(int? id) { 
    Person dataItem = personData.Where(p => p.PersonId == id).First(); 
    return View(dataItem); 
} 
```

还可以设置参数的默认值，当参数为`null`时使用

```
public ActionResult Index(int id = 1) { 
    Person dataItem = personData.Where(p => p.PersonId == id).First(); 
    return View(dataItem); 
}
```

### 绑定复杂类型

当`action`方法是一个复杂类型时，`DefaultModelBinder`使用反射获得`public properties`并绑定

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

`CreatePeople`有一个带参的重载方法，并创建`/View/Home/CreatePerson.cshtml`视图

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

如果`model`需要复杂的类型,如下图所示，我们可以嵌套属性

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

如果我们需要显示`Line1`的值，`model binder`会查找`HomeAddress.Line1`的值

### 创建`Easily-Bound HTML`

如下面所示，可以修改`CreatePeople.cshtml`视图，以便显示`Address`的属性

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

我们使用强类型`EditorFor`,指定`HomeAddress`属性，`helper`自动设置`model`绑定的值到对应的文本框

```html
<input class="text-box single-line" id="HomeAddress_Country" name="HomeAddress.Country" type="text" value="" />
```

我们还需要修改`Index.cshtml`视图，显示传递过来的`HomeAddress`属性值

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

程序开发时可能有一种需求，你根据一个类型生成了`html`,可是需要绑定到另外一个，我们增加一个类

```c#

```




