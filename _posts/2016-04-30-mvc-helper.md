---
layout: post
title:  "helper"
date:   2016-04-30 16:32:18 +0800
categories: mvc
tags: mvc model
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在这一章我们关注`helper`方法，你可以在整个mvc框架项目中运用







### 创建`inline helper`方法

```html
@model string

@{
    Layout = null;
}

@helper ListArrayItems(string[] items)
{     foreach (string str in items)
    {
    <b>@str </b>
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <div>
        Here are the fruits: @ListArrayItems(ViewBag.Fruits)
    </div>
    <div>
        Here are the cities: @ListArrayItems(ViewBag.Cities)
    </div>
    <div>
        Here is the message:
        <p>@Model</p>
    </div>
</body>
</html> 
```

`inline helpers`和`c#`代码类似，在上面的例子中，我们定义了一个`ListArrayItems`，带有一个`string[]`参数，
虽然`inline helpers`像方法，但是它没有返回值

`inline helpers`语句需要`@`字符串前缀，下面的`helper`例子包含`html`标签

```html
@helper ListArrayItems(string[] items) { 
    <ul> 
        @foreach(string str in items) {             
			<li>@str</li>    
        } 
    </ul> 
}
```

结果如下图所示

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f40zfnv8ibj30g308idgl.jpg" style="width:100%" />

### 创建外部的`helper`方法

`inline helpers`虽然方便，但是如果太复杂，写在视图里面会很难阅读，另一种选择是创建一个外部`HTML`辅助方法，
它们就是`c#`的扩展方法，外部的`helper`方法应用非常广泛

```c#
public class CustomHelpers
{
	public static MvcHtmlString ListArrayItems(this HtmlHelper html, string[] list)
	{

		TagBuilder tag = new TagBuilder("ul");

		foreach (string str in list)
		{
			TagBuilder itemTag = new TagBuilder("li");
			itemTag.SetInnerText(str);
			tag.InnerHtml += itemTag.ToString();
		}

		return new MvcHtmlString(tag.ToString());
	}
}
```

`helper`方法和之前的`inline helper`拥有同样的功能，它带有一个`string`数组，并生成`ul`元素，
下面是属性介绍

属性			|描述
RouteCollection	|返回`application`的`routes`
ViewBag			|返回该`view`对应的`action`方法里面的`ViewBag`
ViewContext		|返回`ViewContext`实体，它包含`request`的详细信息

`ViewContext` 的一些有用的属性如下图

属性			|描述
Controller		|返回控制器处理的请求
HttpContext		|返回描述当前请求的`HttpContext`对象
IsChildAction 	|如果`view`调用的`helper`调用`child action`，返回`true`
RouteData		|为当前请求返回`routing data`
View			|返回被`helper`方法调用的实现`IView`的视图

下面是`TagBuilder`的一些属性

成员								|描述
InnerHtml							|一个属性,可以让你设置HTML元素的内容，分配给此属性的值不会被编码
SetInnerText(string)				|设置元素的文本值，`string`参数会设置编码确保安全
AddCssClass(string)					|给`html`添加`css`
MergeAttribute(string,string,bool)　|将一个属性添加到`HTML`元素。第一个参数是属性的名称,和第二个是价值。bool参数指定如果现有的属性相同的名称应该取代

返回的结果是`MvcHtmlString`对象，内容直接写到客户端

```c#
return new MvcHtmlString(tag.ToString());
```

### 使用自定义的外部`helper`方法

使用自定义的`helper`方法和`inline helper`有一点不同，下面创建`/Views/Home/Index.cshtml`

```html
@using MvcApplication2.Infrastructure

@{
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <div>
        Here are the fruits: @Html.ListArrayItems((string[])ViewBag.Fruits)
    </div>
    <div>
        Here are the cities: @Html.ListArrayItems((string[])ViewBag.Cities)
    </div>
    <div>
        Here is the message:
        <p>@Model</p>
    </div>
</body>
</html>
```

### 管理字符串编码`helper`方法

MVC框架通过自动编码努力保护你免受恶意数据攻击,以便它可以被添加到一个Web页面，你可以在我们的示例应用程序中看到一个这样的例子。

后台代码还是之前的`HomeController`

```c#
public class HomeController : Controller { 
	public ActionResult Index() { 
		ViewBag.Fruits = new string[] { "Apple", "Orange", "Pear" };    
		ViewBag.Cities = new string[] { "New York", "London", "Paris" };  
		string message = "This is an HTML element: <input>"; 
		return View((object)message); 
	} 
}
```

后台代码包含`html`标签，前台代码会直接显示出`html`标签

```html
<div>     
	Here is the message: 
    <p>This is an HTML element: &lt;input&gt;</p> 
</div> 
```

#### 重现错误 定义一个新的`helper`方法

```c#
public static class CustomHelpers
{
	public static MvcHtmlString ListArrayItems(this HtmlHelper html, string[] list)
	{
		TagBuilder tag = new TagBuilder("ul");
		
		foreach (string str in list)
		{
			TagBuilder itemTag = new TagBuilder("li");
			itemTag.SetInnerText(str);
			tag.InnerHtml += itemTag.ToString();
		}
		return new MvcHtmlString(tag.ToString());
	}

	public static MvcHtmlString DisplayMessage(this HtmlHelper html, string msg)
	{
		string result = String.Format("This is the message: <p>{0}</p>", msg);
		return new MvcHtmlString(result);
	}
}
```

我们使用`String.Format`生成`html`作为结果参数传递给`MvcHtmlString`，你可以看到前端
页面的修改

```html
@model string
@using MvcApplication2.Infrastructure

@{
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <p>This is the content from the view:</p>
    <div style="border: thin solid black; padding: 10px">
        Here is the message:
        <p>@Model</p>
    </div>

    <p>This is the content from the helper method:</p>
    <div style="border: thin solid black; padding: 10px">
        @Html.DisplayMessage(Model)
    </div>
</body>
</html>
```

*在`Index view`使用`DisplayMessage helper`*

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422m3swhoj309w090753.jpg" style="width:100%" />

### `encoding helper`方法内容

这里有好几种办法解决这个问题，最简单的办法是改变返回的类型，

```c#
public static string DisplayMessage(this HtmlHelper html, string msg)
{
	return String.Format("This is the message: <p>{0}</p>", msg); 
}
```

`Razor`会`encode helper`返回的内容，当你返回的是`html`标签时就会出现问题

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422tg6nh7j30i30e375t.jpg" style="width:100%" />

我们可以解决这个`input`元素的问题

```c#
public static MvcHtmlString DisplayMessage(this HtmlHelper html, string msg) { 
    string encodedMessage = html.Encode(msg); 
    string result = String.Format("This is the message: <p>{0}</p>", encodedMessage);     
	return new MvcHtmlString(result); 
}
```

`HtmlHelper`定义了一个`Encode`的方法，用来解决`string`类型的编码问题。

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422tg6nh7j30i30e375t.jpg" style="width:100%" />

### 使用内置的`Form Helper`方法

MVC框架包括一个内置的选择辅助方法,帮助您管理创建`HTML`表单元素，下面我们创建一个`Person`和`Address`、`Role`来显示这些语法，首先创建几个实体类

```c#
public class Person
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

我们在`Home controller`里面添加一个`action`来使用这些`model`

```c#
public class HomeController : Controller
{
	public ActionResult CreatePerson()
	{
		return View(new Person());
	}
	[HttpPost]
	public ActionResult CreatePerson(Person person)
	{
		return View(person);
	}
}
```

我们使用创建了2`CreatePerson`方法，一个是`HttpGet`请求，一个事`HttpPost`请求，并且
方法的参数还需要不一样，在前端创建数据

```html
@model MvcApplication2.Models.Person
@{
    ViewBag.Title = "CreatePerson";
}
<h2>CreatePerson</h2>
<form action="/Home/CreatePerson" method="post">
    <div class="dataElem">
        <label>PersonId</label>
        <input name="personId" value="@Model.PersonId" />
    </div>
    <div class="dataElem">
        <label>First Name</label>
        <input name="FirstName" value="@Model.FirstName" />
    </div>
    <div class="dataElem">
        <label>Last Name</label>
        <input name="lastName" value="@Model.LastName" />
    </div>
    <input type="submit" value="Submit" />
</form> 
```

这个`view`直接把`model`绑定到`input value`上，我们在`view`上套用一个`layout`，当运行这个`view`的时候，
可以看`input`能正确显示`model`的数据

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f42wqwdp0jj30by08ggmf.jpg" style="width:100%" />

MVC框架不是强制性的使用`helper`来生成`html`标记例如`form`,`input`，如果你喜欢，你可以使用静态的`html`标签，使用`helper`生成的更加方便和后台进行交互

### 创建`Form`元素

最有用的两个`helper`是`Html.BeginForm`和`Html.EndForm`，他们能创建`form`标签，
并且生成`action`参数

```html
<h2>CreatePerson</h2>

@{Html.BeginForm();}
<div class="dataElem">
    <label>PersonId</label>
    <input name="personId" value="@Model.PersonId" />
</div>
<div class="dataElem">
    <label>First Name</label>
    <input name="FirstName" value="@Model.FirstName" />
</div>
<div class="dataElem">
    <label>Last Name</label>
    <input name="lastName" value="@Model.LastName" />
</div>
<input type="submit" value="Submit" />
@{Html.EndForm();}
``` 

这个`Form helper` 是一个丑陋的设计，这种方式一般很少会使用，常用的方式是下面这种

```html
<h2>CreatePerson</h2> 
 
@using(Html.BeginForm()) { 
    <div class="dataElem"> 
        <label>PersonId</label> 
        <input name="personId" value="@Model.PersonId"/> 
    </div> 
    <div class="dataElem"> 
        <label>First Name</label> 
        <input name="FirstName" value="@Model.FirstName"/> 
    </div> 
    <div class="dataElem"> 
        <label>Last Name</label> 
        <input name="lastName" value="@Model.LastName"/> 
    </div> 
    <input type="submit" value="Submit" /> 
} 
```

这种方式称为自闭方式，这样用使得代码干净，`BeginForm`还有一些其它的属性

重载														|描述
BeginForm()													|`Post`方式到`view`对应的`action`
BeginForm(action,controller)								|`Post`方式到传递的参数的`controller`，`action`
BeginForm(action,controller,method)							|根据`method`参数传递过来的方式，把表单数据传递到`controller`下面的`action`
BeginForm(action,controller,method,attributes)				|`attributes` :允许指定`form`的`html`属性，例如：class,id等
BeginForm(action,controller,routeValues,method,attributes)  |`routeValues`:指定路由参数

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginForm("CreatePerson", "Home", 
new { id = "MyIdValue" }, FormMethod.Post, 
new { @class = "personClass", data_formType = "person" })){
    <div class="dataElem">
        <label>PersonId</label>
        <input name="personId" value="@Model.PersonId" />
    </div>
    <div class="dataElem">
        <label>First Name</label>
        <input name="FirstName" value="@Model.FirstName" />
    </div>
    <div class="dataElem">
        <label>Last Name</label>
        <input name="lastName" value="@Model.LastName" />
    </div>
    <input type="submit" value="Submit" />
}
```	

在这个例子中，我们指定了更加具体的`form`信息

```html
<form action="/Home/CreatePerson/MyIdValue" class="personClass" data-formType="person" method="post">
```

### 指定`route`所使用的一种形式

当你使用`BeginForm`方法，MVC框架找到第一个匹配的路由配置来生成`url`，如果你确定想使用一个特定的`route`，你可以使用`BeginRouteForm`

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
			});
		routes.MapRoute(name: "FormRoute",
			url: "app/forms/{controller}/{action}"
		);
	}
}
```

如果我们调用`BeginForm`,默认会调用`Default route`，如果要调用`FormRoute`这个`route`，可以像下面这样

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>
@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{
    <div class="dataElem">
        <label>PersonId</label>
        <input name="personId" value="@Model.PersonId" />
    </div>
    <div class="dataElem">
        <label>First Name</label>
        <input name="FirstName" value="@Model.FirstName" />
    </div>
    <div class="dataElem">
        <label>Last Name</label>
        <input name="lastName" value="@Model.LastName" />
    </div>
    <input type="submit" value="Submit" />
}
```

这将生成一下的标签形式，这个`action`属性符合新`route`结构

```html
<form action="/app/forms/Home/CreatePerson" class="personClass" 
data-formType="person" method="post">
```

### 使用`input helpers`

就算创建了`form`，你还需要创建`input`元素，下面的表格显示了基本的`input`元素创建方法

HTML 元素					|示例
Checkbox					|Html.CheckBox("myCheckbox",false)输出：<br /> `<input id="myCheckbox" name="myCheckbox" type="checkbox" value="true" />` <br /> `<input name="myCheckbox" type="hidden" value="false" />`
Hidden field				|Html.Hidden("myHidden","val")输出：<br /> `<input id="myHidden" name="myHidden" type="hidden" value="val" />`
Radio button				|Html.RadioButton("myRadiobutton","val",true)输出：`<input checked="checked" id="myRadiobutton" name="myRadiobutton" type="radio" value="val" />`
Password					|Html.Password("myPassword","val")输出：<br /> `<input id="myPassword" name="myPassword" type="password" value="val" />`
Textarea					|Html.TextArea("myTextarea","val",5,20,null)输出：`<textarea cols="20" id="myTextarea" name="myTextarea" rows="5">val</textarea>`
Textbox						|Html.TextBox("myTextbox","val")输出：`<input id="myTextbox" name="myTextbox" type="text" value="val" />`

每一个`helpers`都是可以重载的，上面的表格只是显示了最简单的版本，你可以看到怎样使用这些基本的`input`helper 方法

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, 
    new { @class = "personClass", data_formType = "person" }))
{

    <div class="dataElem">
        <label>PersonId</label>         
		@Html.TextBox("personId", @Model.PersonId)
    </div>
    <div class="dataElem">
        <label>First Name</label>         
		@Html.TextBox("firstName", @Model.FirstName)
    </div>
    <div class="dataElem">
        <label>Last Name</label>         
		@Html.TextBox("lastName", @Model.LastName)
    </div>
    <input type="submit" value="Submit" />
} 
```

### 从模型生成`input`元素属性

上面的章节很好的显示了`helper`方法，但是我们需要从第一个参数传递到第二个参数，下面还可以使用只有一个参数的`helper`方法

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, 
    new { @class = "personClass", data_formType = "person" }))
{

    <div class="dataElem">
        <label>PersonId</label>
        @Html.TextBox("PersonId")
    </div>
    <div class="dataElem">
        <label>First Name</label>         
		@Html.TextBox("firstName")
    </div>
    <div class="dataElem">
        <label>Last Name</label>         
		@Html.TextBox("lastName")
    </div>
    <input type="submit" value="Submit" />
} 
```

`string`类型的参数是用来查找`view data`,`viewbag`和`view`模型，如果你调用`@Html.TextBox("DataValue")`,MVC框架尝试着访问key为`DataValue`

>* ViewBag.DataValue
>* @Model.DataValue

第一个`value` 是查找生成的`html`元素的`value`属性，如果我们指定一个值为`DataValue.First.Name`，查找会更复杂。

>* ViewBag.DataValue.First.Name
>* ViewBag.DataValue["First"].Name
>* •ViewBag.DataValue["First.Name"] 
>* ViewBag.DataValue["First"]["Name"]

### 使用强类型的`input helpers`

这些`helper`只能用在强类型的`view`中

HTML元素			|示例
CheckBox			|Html.CheckBoxFor(x=>x.IsApproved)输出：<br />`<input id="IsApproved" name="IsApproved" type="checkbox" value="true" />`<br />`<input name="IsApproved" type="hidden" value="false" />`
Hidden field		|Html.HiddenFor(x => x.FirstName)输出：<br />`<input id="FirstName" name="FirstName" type="hidden" value="" /> `
Radio button		|Html.RadioButtonFor(x => x.IsApproved, "val")输出：<br />`<input id="IsApproved" name="IsApproved" type="radio" value="val" />`
Password			|Html.PasswordFor(x => x.Password)输出：<br />`<input id="Password" name="Password" type="password" />`
Textarea			|Html.TextAreaFor(x => x.Bio, 5, 20, new{})输出：<br />`<textarea cols="20" id="Bio" name="Bio" rows="5">Bio value</textarea>`
Textbox				|Html.TextBoxFor(x => x.FirstName)输出：<br />`<input id="FirstName" name="FirstName" type="text" value="" />`

强类型的`input helpers`有`lambda`表达式作为参数，表达式的值传递给`view model`对象

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{     <div class="dataElem">
        <label>PersonId</label>         
		@Html.TextBoxFor(m => m.PersonId)
    </div>
    <div class="dataElem">
        <label>First Name</label>         
		@Html.TextBoxFor(m => m.FirstName)
    </div>
    <div class="dataElem">
        <label>Last Name</label>         
		@Html.TextBoxFor(m => m.LastName)
    </div>
    <input type="submit" value="Submit" />
}
```

### 创建`select`元素

下面的表格显示创建`select`元素

Html元素			|示例
Drop-down list		|Html.DropDownList("myList", new SelectList(new [] {"A", "B"}), "Choose") 输出：<br />`<select id="myList" name="myList">`<br />` <option value="">Choose</option>`<br />`<option>A</option>`<br />`<option>B</option>`<br />`</select>`
Drop-down list		|Html.DropDownListFor(x => x.Gender, new SelectList(new [] {"M", "F"}))输出：`<select id="Gender" name="Gender">`<br />`<option>M</option> `<br />`<option>F</option> `<br />`</select> `
Multiple-select		|Html.ListBox("myList", new MultiSelectList(new [] {"A", "B"}))输出：<br />`<select id="myList" multiple="multiple" name="myList">`<br />`<option>A</option> `<br />`<option>B</option> `<br />`</select> `
Multiple-select 	|Html.ListBoxFor(x => x.Vals, new MultiSelectList(new [] {"A", "B"})) 输出：<br />`<select id="Vals" multiple="multiple" name="Vals"> `
<br />`<option>A</option>`<br />`<option>B</option>`<br />`</select>`

`select helpers`带有`SelectList`或者`MultiSelectList`参数，这两个参数不同之处在于，`MultiSelectList`有一个构造函数，当页面加载的时候，可以多个`item`被选中

```c#
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{

    <div class="dataElem">
        <label>PersonId</label>
        @Html.TextBoxFor(m => m.PersonId)
    </div>
    <div class="dataElem">
        <label>First Name</label>
        @Html.TextBoxFor(m => m.FirstName)
    </div>
    <div class="dataElem">
        <label>Last Name</label>
        @Html.TextBoxFor(m => m.LastName)
    </div>
    <div class="dataElem">
        <label>Role</label>
        @Html.DropDownListFor(m => m.Role,
             new SelectList(Enum.GetNames(typeof(MvcApplication2.Models.Role))))
    </div>
    <input type="submit" value="Submit" />
} 
```

你可以看到`html`属性

```html
<!DOCTYPE html> 
<html> 
<head> 
    <meta charset="utf-8" /> 
    <meta name="viewport" content="width=device-width" /> 
    <title>CreatePerson</title> 
    <link href="/Content/Site.css" rel="stylesheet"/> 
    <style type="text/css"> 
        label { display: inline-block; width: 100px;} 
        .dataElem { margin: 5px;} 
    </style> 
</head> 
<body> 
     
<h2>CreatePerson</h2> 
 
<form action="/app/forms/Home/CreatePerson" class="personClass" data-formType="person" 
method="post">    <div class="dataElem"> 
        <label>PersonId</label> 
        <input data-val="true" data-val-number="The field PersonId must be a number." data-valrequired="The PersonId field is required." id="PersonId" name="PersonId" type="text" value="0" 
/> 
    </div> 
    <div class="dataElem"> 
        <label>First Name</label> 
        <input id="FirstName" name="FirstName" type="text" value="" /> 
    </div> 
    <div class="dataElem"> 
        <label>Last Name</label> 
        <input id="LastName" name="LastName" type="text" value="" /> 
    </div> 
    <div class="dataElem"> 
        <label>Role</label> 
        <select data-val="true" data-val-required="The Role field is required."  
                id="Role" name="Role"> 
            <option selected="selected">Admin</option>             <option>User</option> 
            <option>Guest</option> 
        </select>     </div>         <input type="submit" value="Submit" /> 
</form> 
</body> 
</html>
```














