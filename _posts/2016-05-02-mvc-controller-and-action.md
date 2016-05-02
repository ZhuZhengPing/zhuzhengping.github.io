---
layout: post
title:  "MVC Controller 和 Action"
date:   2016-05-02 16:32:18 +0800
categories: mvc
tags: mvc controller action
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在MVC系统中，每一个MVC请求都是由合适的`controller`来处理的，这意味着我们不把业务逻辑和数据存储逻辑放在控制器里面，控制器也不生成用户界面。




### 重写控制器

控制器实现了`IController`接口，可以自己重写控制器

```js
public class BasicController : IController { 
	public void Execute(RequestContext requestContext) { 
		string controller = (string)requestContext.RouteData.Values["controller"];             
		string action = (string)requestContext.RouteData.Values["action"]; 
		if (action.ToLower() == "redirect")
		{
			requestContext.HttpContext.Response.Redirect("/Derived/Index");
		}
		else
		{
			requestContext.HttpContext.Response.Write(string.Format("Controller: {0}, Action: {1}",
				controller, action));
		}  
	} 
} 
```

如果你现在访问`http://localhost:10905/base/Index`，页面会输出`Controller: base, Action: Index`

### 接收参数

控制器一个主要的功能就是接收从页面过来的参数，例如 string类型的参数，form参数，以及路由parameters的参数，下面有3种获取参数的方法

> 从一组上下文对象中提取

> 数据作为参数传递到 action 方法

> 显示地调用框架模型绑定的功能

下面是用`Context`对象中取参数

属性					|类型						|描述
Request.QueryString		|NameValueCollection		|浏览器Get类型的参数
Request.Form			|NameValueCollection		|浏览器Post类型的参数
Request.Cookies			|HttpCookieCollection		|浏览器发送的Cookie
Request.HttpMethod		|string						|Http的方法(Get/Post)
Request.Headers			|NameValueCollection		|Http请求的头
Request.Url				|Uri 						|URL
Request.UserHostAddress	|string						|浏览器IP地址
RouteData.Route			|RouteBase					|RouteTable.Routes 实体
RouteData.Values		|RouteValueDictionary		|路由参数(从URL中提取或默认值)
HttpContext.Application	|HttpApplicationStateBase	|应用程序状态
HttpContext.Cache		|Cache						|应用程序缓存
HttpContext.Items		|IDictionary				|当前请求的状态
HttpContext.Session		|HttpSessionStateBase		|访问者的session
User					|IPrincipal					|当前登录的用户信息
TempData				|TempDataDictionary			|临时存储

### 明白 `Action Result`

`action` 返回一个对象 `ActionResult`,而不是直接使用 `Response`返回，调用一个视图，或者跳转到另外的`action‘，我们演示定义自己的`ActionResult`

```js
public class CustomRedirectResult:ActionResult
{
	public string Url { get; set; } 
	public override void ExecuteResult(ControllerContext context)
	{
		string fullUrl = UrlHelper.GenerateContentUrl(Url, context.HttpContext);
		context.HttpContext.Response.Redirect(fullUrl); 
	}
}
```

下面使用自定义的`ActionResult`来实现简单的页面跳转

```js
public ActionResult Index()
{
	if (Server.MachineName != "TINY")
	{
		return new CustomRedirectResult { Url = "/Basic/Index" };
	}
	else
	{
		Response.Write("Controller: Derived, Action: ProduceOutput");
		return null;
	}
}
```

现在你已经看到了 `ActionResult`是怎样工作的，MVC框架还提供页面跳转的功能

*使用`RedirectResult`对象*

```js
public ActionResult ProduceOutput() {     
	return new RedirectResult("/Basic/Index");
	// return Redirect("/Basic/Index");
}
```

下面列出所有的 `ActionResult`类型

类型					|描述							|方法
ViewResult				|视图							|View 
PartialViewResult		|部分视图						|PartialView 
RedirectToRouteResult	|跳转到路由配置的地址			|RedirectToAction,RedirectToActionPermanent,RedirectToRoute,RedirectToRoutePermanent 
RedirectResult			|重定向到一个特定的URL			|Redirect，RedirectPermanent
HttpUnauthorizedResult	|返回状态为401的错误			|None
HttpNotFoundResult		|返回404错误					|HttpNotFound 
HttpStatusCodeResult	|返回Http状态					|None

如果你需要访问一个特定的视图，你可以向下面这样

```js
public ViewResult Index() { 
	return View("~/Views/Other/Index.cshtml"); 
}
```

绑定模型到视图

```js
public ViewResult Index() { 
    DateTime date = DateTime.Now;     
	return View(date); 
}
```

在当前在视图访问的时候，可以取出模型

```js
@model DateTime 
@{ 
    ViewBag.Title = "Index"; 
} 
<h2>Index</h2> 
The day is: @Model.DayOfWeek  
```








