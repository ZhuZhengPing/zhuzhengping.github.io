---
layout: post
title:  "URL和Ajax"
date:   2016-05-26 16:32:18 +0800
categories: mvc
tags: url ajax
author: Zhengping Zhu
---

* content
{:toc}

## 概念

我们关注生成 URLs,links,Ajax 等元素，Ajax是一个关键的功能丰富的 Web 应用程序和MVC框架包括一些有用的功能,是基于 jQuery 库





### 重写和准备示例项目

*/App_Start/RouteConfig.cs 文件的内容*

```c#
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

	routes.MapRoute(name: "FormRoute",
		url: "app/forms/{controller}/{action}"
	); 
}
```

我们的 routing 配置非常简单，下面创建一个 PersonController 

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

	public ActionResult Index()
	{
		return View();
	}

	public ActionResult GetPeople()
	{
		return View(personData);
	}

	[HttpPost]
	public ActionResult GetPeople(string selectedRole)
	{
		if (selectedRole == null || selectedRole == "All")
		{
			return View(personData);
		}
		else
		{
			Role selected = (Role)Enum.Parse(typeof(Role), selectedRole); 
			return View(personData.Where(p => p.Role == selected));
		}
	} 
}
```

我们也需要一些 css 样式，我们创建 /Content/Site.css 

```css
table, td, th { 
    border: thin solid black; 
	border-collapse: collapse; padding: 5px;     
	background-color: lemonchiffon; 
	text-align: left; margin: 10px 0; 
} 
div.load {
	color: red; 
	margin: 10px 0; 
	font-weight: bold;
} 
div.ajaxLink {
	margin-top: 10px;
	margin-right: 5px;
	float: left;
} 
```

### 创建基本的 links 和 urls 

*HTML Helper 启用URLs*

描述						| 示例
 Application-relative URL 	|Url.Content("~/Content/Site.css")输出:<br />  /Content/Site.css 
跳转到  action/controller 	|Html.ActionLink("My Link","Index","Home")输出:<br />  <a href="/">My Link</a>
 action 链接				|Url.Action("GetPeople","People")输出：<br /> /People/GetPeople 
 route url 					|Url.RouteUrl(new{controller="People",action="GetPeople"})输出:<br /> /People/GetPeople 
 route 链接					|Html.RouteUrl("My Link",new{controller="People",action="GetPeople"})输出:<br /> <a href="/People/GetPeople">My Link</a> 
链接到指定的 route 			|Html.RouteLink("My Link","FormRoute",new {controller="People",action="GetPeople"})输出：<br /> <a href="/app/forms/People/GetPeople">My Link</a> 

为了演示 action 的 helper ，我们创建了 /People/Index.cshtml 文件

```html
@{
    ViewBag.Title = "Index";
}
<h2>Basic Links & URLs</h2>
<table>
    <thead><tr><th>Helper</th><th>Output</th></tr></thead>
    <tbody>
        <tr>
            <td>Url.Content("~/Content/Site.css")</td>
            <td>@Url.Content("~/Content/Site.css")</td>
        </tr>
        <tr>
            <td>Html.ActionLink("My Link", "Index", "Home")</td>
            <td>@Html.ActionLink("My Link", "Index", "Home")</td>
        </tr>
        <tr>
            <td>Url.Action("GetPeople", "People")</td>
            <td>@Url.Action("GetPeople", "People")</td>
        </tr>
        <tr>
            <td>Url.RouteUrl(new {controller = "People", action="GetPeople"})</td>
            <td>@Url.RouteUrl(new { controller = "People", action = "GetPeople" })</td>
        </tr>
        <tr>
            <td>
                Html.RouteLink("My Link", new {controller = "People",
                action="GetPeople"})
            </td>
            <td>
                @Html.RouteLink("My Link", new
			   {
				   controller = "People",
				   action = "GetPeople"
			   })
        </td>
        URL AND AJAX HELPER METHODS
    </tr>
    <tr>
        <td>
            Html.RouteLink("My Link", "FormRoute", new {controller = "People",
            action="GetPeople"})
        </td>
        <td>
            @Html.RouteLink("My Link", "FormRoute", new
           {
               controller = "People",
               action = "GetPeople"
           })
    </td>
</tr>
</tbody>
<//table>
```

当我们允许这个 view ，能看到出现下图所示的界面

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f4aw8ybkmuj30n10bdgo9.jpg" style="width:100%" />

### 使用MVC  Unobtrusive Ajax 

我们使用 GetPeople action,创建/Views/People/GetPeople.cshtml 文件

```html
@using MvcApplication2.Models
@model IEnumerable<Person>
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
}
<h2>Get People</h2>
<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody>
        @foreach (Person p in Model)
        {
            <tr>
                <td>@p.FirstName</td>
                <td>@p.LastName</td>
                <td>@p.Role</td>
            </tr>
        }
    </tbody>
</table>

@using (Html.BeginForm())
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
} 
```

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f4ax0haqgjj30mx0a140i.jpg" style="width:100%" />

### 为项目准备 Unobtrusive Ajax 

 Unobtrusive Ajax 需要在程序中两个地方设置，第一个地方是`/Web.config`(程序根目录的那个web.config)

```c#
<appSettings>
    <add key="UnobtrusiveJavaScriptEnabled" value="true" />
</appSettings>
```

我们需要添加 jQuery 库来实现 Unobtrusive 的功能，你可以在单独的 view 添加引用，但是大多数情况下在 layout 里面添加，下面我们重新准备下 Controller 

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

	public ActionResult Index()
	{
		return View();
	}

	public PartialViewResult GetPeopleData(string selectedRole = "All")
	{
		IEnumerable<Person> data = personData;
		if (selectedRole != "All")
		{
			Role selected = (Role)Enum.Parse(typeof(Role), selectedRole); 
			data = personData.Where(p => p.Role == selected);
		}
		return PartialView(data);
	}

	public ActionResult GetPeople(string selectedRole = "All")
	{
		return View((object)selectedRole);
	} 
}
```

* GetPeopleData view *

```html
@using MvcApplication2.Models
@model IEnumerable<Person>

@foreach (Person p in Model)
{
    <tr>
        <td>@p.FirstName</td>
        <td>@p.LastName</td>
        <td>@p.Role</td>
    </tr>
}
```

我们也更新了 /Views/People/GetPeople 

```html
@using MvcApplication2.Models
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
}
<h2>Get People</h2>
<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody>
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>

@using (Html.BeginForm())
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}
```

### 创建 Ajax 表单

目前为止我们还是同步的功能，新功能将加入 ajax 

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions
    {
        UpdateTargetId = "tableBody"
    };
}
<h2>Get People</h2>
<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>
@using (Ajax.BeginForm("GetPeopleData", ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
} 
```

MVC框架核心支撑 Ajax.BeginForm 表单，携带一个 AjaxOptions 参数， AjaxOptions 在命名空间 System.Web.Mvc.Ajax 下

* AjaxOptions 属性*

属性					|描述
Confirm					|在 Ajax 之前显示 confirm 消息
HttpMethod				|设置请求方式,Get 或者 Post 
InsertionMode			|指定的 html 位置插入数据， InsertionMode enum 有3个选择， InsertAfter,InsertBefore,Replace(默认的)
LoadingElementId|指定一个 ID ， ajax 请求时将显示
LoadingElementDuration	|指定动画的持续时间用于显示指定的元素
UpdateTargetId			|向指定元素插入接收的值
Url						|设置 ajax 的 URL 

我们为 tableBody 上设置 UpdateTargetId 属性，当用户点击 submit 按钮，将从 GetPeopleData action 异步请求

### 理解 Unobtrusive Ajax 如何工作

当我们调用 Ajax.BeginForm helper 方法，我们设置的 AjaxOptions 将生成 form 元素

```html
<form action="/People/GetPeopleData" data-ajax="true"data-ajax-mode="replace"  
    data-ajax-update="#tableBody" id="form0" method="post">
```

### 设置 Ajax Options 

在接下来的示例中，我们将演示 GetPeopleData action ,将调用 partial view 

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4b4n2ejnnj30g909jwg4.jpg" style="width:100%" />

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions
    {
        UpdateTargetId = "tableBody",
        Url = Url.Action("GetPeopleData") 
    };
}
<h2>Get People</h2>
<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>
@using (Ajax.BeginForm(ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
} 
```

我们使用 Url.Action helper 创建一个URL，调用 GetPeopleData action ，生成如下的 html 

```html
<form action="/People/GetPeople" data-ajax="true" data-ajax-mode="replace"      data-ajax-update="#tableBody" data-ajax-url="/People/GetPeopleData" id="form0"      method="post">
```

如果 javascript 可用， unobtrusive ajax 库将取出 data-ajax 中的 url ，将调用 child action ，如果 javascript 不可用，浏览器将使用常规的 post 技术

###  ajax 回调方法

 ajax 的一个缺点是，它是在后台运行的，用户不知道它的运行状态，我们可以使用 AjaxOptions.LoadingElementId 和 AjaxOptions.LoadingElementDuration 属性，修改 GetPeople.cshtml 文件

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions
    {
        UpdateTargetId = "tableBody",
        Url = Url.Action("GetPeopleData") ,
        LoadingElementId="loading",
        LoadingElementDuration=3000
    };
}
<h2>Get People</h2>
<div id="loading" class="load" style="display:none">
    <p>Loading Data...</p>
</div>
<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>
@using (Ajax.BeginForm(ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}
```

 AjaxOptions.LoadingElementId 指定的 id 元素将在 ajax 调用的时候显示， LoadingElementDuration 属性指定 loading 时的动画

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f4b6g3xy6xj30n00dqdj7.jpg" style="width:100%" />

### 请求前的用户提示

 AjaxOptions.Confirm 属性在 ajax 前弹出提示，用户可以选择确定或取消

```html
@{ 
    ViewBag.Title = "GetPeople"; 
    AjaxOptions ajaxOpts = new AjaxOptions { 
        UpdateTargetId = "tableBody", 
        Url = Url.Action("GetPeopleData"), 
        LoadingElementId = "loading", 
        LoadingElementDuration = 1000,         
		Confirm = "Do you wish to request new data?" 
    };    
} 
```

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4b7gbc5mcj306q0453yn.jpg" style="width:40%" />

### 创建 ajax 链接

我们能使用 unobtrusive Ajax 创建 a 标签，你可以看到下面在 GetPeople.cshtml 上添加 ajax 链接

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions
    {
        UpdateTargetId = "tableBody",
        Url = Url.Action("GetPeopleData") ,
        LoadingElementId="loading",
        LoadingElementDuration=3000,
        Confirm = "Do you wish to request new data?"
    };
}
<h2>Get People</h2>

<div id="loading" class="load" style="display:none">
    <p>Loading Data...</p>
</div>

<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>

@using (Ajax.BeginForm(ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}

<div>
    @foreach (string role in Enum.GetNames(typeof(Role)))
    {         
        <div class="ajaxLink">
        @Ajax.ActionLink(role, "GetPeopleData",
                new { selectedRole = role },
                new AjaxOptions { UpdateTargetId = "tableBody" })
    </div>
    }
</div> 
```

我们使用 foreach 循环为每个 Role 调用 Ajax.ActionLink ，创建 ajax-enable 的 a 元素，生成的属性如下

```html
<a data-ajax="true" data-ajax-mode="replace" data-ajax-update="#tableBody"  
    href="/People/GetPeopleData?selectedRole=Guest">Guest</a>
```

<a href="http://ww3.sinaimg.cn/mw690/006dag38jw1f4b81o3vzvj30bp0awdhl.jpg" style="width:100%" />

### 确保链接优雅降级

表单中的 ajax-enabled 链接面临着一个问题，当浏览器不支持 javascript ，点击一个链接将显示 GetPeopleData 对应的 action 所生产的 html ，我们使用 AjaxOptions.Url 指定 ajax 请求地址

```html
<div> 
    @foreach (string role in Enum.GetNames(typeof(Role))) { 
        <div class="ajaxLink"> 
            @Ajax.ActionLink(role, "GetPeople",new {selectedRole = role},
			new AjaxOptions { 
				UpdateTargetId = "tableBody",                     
				Url = Url.Action("GetPeopleData", new {selectedRole = role}) 
            }) 
        </div>         
    } 
</div>
```

### 使用 Ajax Callbacks 

 AjaxOptions 允许你在 Ajax 生命周期里指定不同的 Callback 

属性		|jQuery事件		|描述
OnBegin		|beforeSend		|请求之前调用
OnComplete	|complete		|请求成功后调用
OnFailure	|error			|请求失败后调用
OnSuccess	|success		|请求完成后调用，不管是成功还是失败

每个 AjaxOptions callback 属性都得到jquery库的支持

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions
    {
        UpdateTargetId = "tableBody",
        Url = Url.Action("GetPeopleData") ,
        LoadingElementId="loading",
        LoadingElementDuration=3000,
        Confirm = "Do you wish to request new data?"
    };
}
<script type="text/javascript">
     function OnBegin() {
        alert("This is the OnBegin Callback");
    }

    function OnSuccess(data) {
        alert("This is the OnSuccessCallback: " + data);
    }

    function OnFailure(request, error) {
        alert("This is the OnFailure Callback:" + error);
    }

    function OnComplete(request, status) {
        alert("This is the OnComplete Callback: " + status);
    }
</script>

<h2>Get People</h2>

<div id="loading" class="load" style="display:none">
    <p>Loading Data...</p>
</div>

<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>

@using (Ajax.BeginForm(ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}

<div>
    @foreach (string role in Enum.GetNames(typeof(Role)))
    {
        <div class="ajaxLink">
            @Ajax.ActionLink(role, "GetPeople", new { selectedRole = role }, new AjaxOptions
       {
           UpdateTargetId = "tableBody",
           Url = Url.Action("GetPeopleData", new { selectedRole = role }),
           OnBegin = "OnBegin",
           OnFailure = "OnFailure",
           OnSuccess = "OnSuccess",
           OnComplete = "OnComplete"
       })
        </div>
    }
</div>
```

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f4bcsamadej30fc06x0tn.jpg" style="width:100%" />

### 使用 JSON 

MVC框架的 action 返回 JSON 而不是 html ,使得代码非常简单，你可以看到我们在 People controller 中添加了这样的 action 

```c#
private IEnumerable<Person> GetData(string selectedRole)
{
	IEnumerable<Person> data = personData;
	if (selectedRole != "All")
	{
		Role selected = (Role)Enum.Parse(typeof(Role), selectedRole);
		data = personData.Where(p => p.Role == selected);
	} return data;
}

public JsonResult GetPeopleDataJson(string selectedRole = "All")
{
	IEnumerable<Person> data = GetData(selectedRole); 
	return Json(data, JsonRequestBehavior.AllowGet);
}
```

我们创建了 JsonResult`,通过转换成 JSON 格式

```c#
return Json(data, JsonRequestBehavior.AllowGet);
```

我们需要设置 JsonRequestBehavior 枚举的 AllowGet 值，默认的， JSON 数据只响应 POST 请求

### 浏览器中处理 JSON 

我们在 AjaxOptions 的 OnSuccess callback 中指定一个 javascript 方法，下面是更新过的 GetPerson.cshtml view 

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    AjaxOptions ajaxOpts = new AjaxOptions {
        UpdateTargetId = "tableBody",
        Url = Url.Action("GetPeopleData"),
        LoadingElementId = "loading",
        LoadingElementDuration = 1000,
        Confirm = "Do you wish to request new data?"
    };
}

<script type="text/javascript">
     function processData(data) {
         var target = $("#tableBody");
         target.empty();
         for (var i = 0; i < data.length; i++) {
             var person = data[i];
             target.append("<tr><td>" + person.FirstName + "</td><td>"
                 + person.LastName + "</td><td>" + person.Role + "</td></tr>");
         }
     }
</script>

<h2>Get People</h2>

<div id="loading" class="load" style="display:none">
    <p>Loading Data...</p>
</div>

<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new {selectedRole = Model })
    </tbody>
</table>

@using (Ajax.BeginForm(ajaxOpts)) {
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new [] {"All"}.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}

<div>
    @foreach (string role in Enum.GetNames(typeof(Role))) {
        <div class="ajaxLink">
            @Ajax.ActionLink(role, "GetPeople",new {selectedRole = role},new AjaxOptions {
                    Url = Url.Action("GetPeopleDataJson", new {selectedRole = role}),
                    OnSuccess = "processData"
                })
        </div>
    }
</div> 
```

我们移除了 AjaxOptions 的 UpdateTargetId ，而是直接在 html 元素上绑定数据

### 数据 Encoding 编码

下面是MVC框架生成的 JSON 数据

```js
{
	"PersonId":0,
	"FirstName":"Adam",
	"LastName":"Freeman", 
	"BirthDate":"\/Date(62135596800000)\/",
	"HomeAddress":null,
	"IsApproved":false,
	"Role":0
}
```

我们可以选择我们需要的列，并不需要所有的字段，可以在 action 里面筛选

```c#
public JsonResult GetPeopleDataJson(string selectedRole = "All") { 
    var data = GetData(selectedRole).Select(p => new { 
        FirstName = p.FirstName, 
        LastName = p.LastName, 
        Role = Enum.GetName(typeof(Role), p.Role) 
    });     
	return Json(data, JsonRequestBehavior.AllowGet); 
} 
```

现在返回值就变成这样

```js
{"FirstName":"Adam","LastName":"Freeman","Role":"Admin"} 
```

### 在 action 方法中监测 ajax 请求

 controller 中创建了2个 action 方法分别处理 HTML 和 JSON 数据，但是我们可以监测到 ajax 请求，这样的话你只需要创建一个单独的 action 方法

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

	public ActionResult Index()
	{
		return View();
	}
	public ActionResult GetPeopleData(string selectedRole = "All")
	{
		IEnumerable<Person> data = personData;
		if (selectedRole != "All")
		{
			Role selected = (Role)Enum.Parse(typeof(Role), selectedRole);
			data = personData.Where(p => p.Role == selected);
		}
		if (Request.IsAjaxRequest())
		{
			var formattedData = data.Select(p => new
			{
				FirstName = p.FirstName,
				LastName = p.LastName,
				Role = Enum.GetName(typeof(Role), p.Role)
			});
			return Json(formattedData, JsonRequestBehavior.AllowGet);
		}
		else
		{
			return PartialView(data);
		}
	}

	public ActionResult GetPeople(string selectedRole = "All")
	{
		return View((object)selectedRole);
	}   
}
```

我们使用了 Request.IsAjaxRequest 方法监测是否为 ajax 请求，也需要修改 GetPerson.cshtml view 

```html
@using MvcApplication2.Models
@model string
@{
    ViewBag.Title = "GetPeople";
    Layout = "/views/shared/_layout.cshtml";
    AjaxOptions ajaxOpts = new AjaxOptions { 
        Url = Url.Action("GetPeopleData"), 
        LoadingElementId = "loading", 
        LoadingElementDuration = 1000,         
        OnSuccess = "processData"         
    };
}

<script type="text/javascript">
    function processData(data) {
    var target = $("#tableBody");
         target.empty();
         for (var i = 0; i < data.length; i++) {
             var person = data[i];
             target.append("<tr><td>" + person.FirstName + "</td><td>"
                 + person.LastName + "</td><td>" + person.Role
                 + "</td></tr>");
         }
     }
</script>

<h2>Get People</h2>

<div id="loading" class="load" style="display:none">
    <p>Loading Data...</p>
</div>

<table>
    <thead><tr><th>First</th><th>Last</th><th>Role</th></tr></thead>
    <tbody id="tableBody">
        @Html.Action("GetPeopleData", new { selectedRole = Model })
    </tbody>
</table>

@using (Ajax.BeginForm(ajaxOpts))
{
    <div>
        @Html.DropDownList("selectedRole", new SelectList(new[] { "All" }.Concat(Enum.GetNames(typeof(Role)))))
        <button type="submit">Submit</button>
    </div>
}

<div>
    @foreach (string role in Enum.GetNames(typeof(Role)))
    {
        <div class="ajaxLink">
            @Ajax.ActionLink(role, "GetPeople", new { selectedRole = role }, new AjaxOptions
       {
           Url = Url.Action("GetPeopleData", new { selectedRole = role }),
           OnSuccess = "processData"
       })
        </div>
    }
</div> 
```








