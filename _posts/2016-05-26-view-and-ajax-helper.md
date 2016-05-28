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

我们关注生成`URLs,links,Ajax`等元素，Ajax是一个关键的功能丰富的`Web`应用程序和MVC框架包括一些有用的功能,是基于`jQuery`库





### 重写和准备示例项目

*`/App_Start/RouteConfig.cs`文件的内容*

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

我们的`routing`配置非常简单，下面创建一个`PersonController`

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
			Role selected = (Role)Enum.Parse(typeof(Role), selectedRole); return View(personData.Where(p => p.Role == selected));
		}
	} 
}
```

我们也需要一些`css`样式，我们创建`/Content/Site.css`

```css
table, td, th { 
    border: thin solid black; 
	border-collapse: collapse; padding: 5px;     background-color: lemonchiffon; 
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

### 创建基本的`links`和`urls`

*`HTML Helper`启用URLs*

描述						| 示例
`Application-relative URL`	|Url.Content("~/Content/Site.css")输出:<br /> `/Content/Site.css`
跳转到 `action/controller`	|Html.ActionLink("My Link","Index","Home")输出:<br /> `<a href="/">My Link</a>`
`action`链接				|Url.Action("GetPeople","People")输出：<br />`/People/GetPeople`
`route url`					|Url.RouteUrl(new{controller="People",action="GetPeople"})输出:<br />`/People/GetPeople`
`route`链接					|Html.RouteUrl("My Link",new{controller="People",action="GetPeople"})输出:<br />`<a href="/People/GetPeople">My Link</a>`
链接到指定的`route`			|Html.RouteLink("My Link","FormRoute",new {controller="People",action="GetPeople"})输出：<br />`<ahref="/app/forms/People/GetPeople">My Link</a>`
















