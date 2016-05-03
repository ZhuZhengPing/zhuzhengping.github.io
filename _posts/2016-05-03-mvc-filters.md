---
layout: post
title:  "MVC filters"
date:   2016-05-03 16:32:18 +0800
categories: mvc
tags: mvc controller action
author: Zhengping Zhu
---

* content
{:toc}

## 概念

`filters`向MVC框架请求注入额外业务逻辑，他们能实现简单而优雅的面向切面的编程，他们可以使用到应用程序的任何位置，经典的面向切面编程示例是工作日志，身份验证和缓存...




### 使用 `filters`

当做一个项目的时，很多时候都需要用到身份验证、权限等东西，在MVC项目中，我们需要验证 `controller`的权限，或者验证`action`的权限，可以使用`[Authorize]`

介绍4种基本的`filters`

`Filter`类型	|实现的接口				|默认实现				|描述
Authorization	|IAuthorizationFilter 	|AuthorizeAttribute		|比其它的`filters`和`action`先运行
Action			|IActionFilter			|ActionFilterAttribute	|在`action`方法之前，之后执行
Result			|IResultFilter			|ActionFilterAttribute	|在`action result`之前，之后执行
Exception		|IExceptionFilter		|HandleErrorAttribute	|在其它的`filter`、`action`方法或者`action result`抛出异常以后

### 创建一个`filter`示例项目

创建一个自定义`filter`继承`AuthorizeAttribute`，实现一个自定义的`filter`功能

```js
public class CustomAuthAttribute : AuthorizeAttribute
{
	private bool localAllowed;
	public CustomAuthAttribute(bool allowedParam)
	{
		localAllowed = allowedParam;
	}
	protected override bool AuthorizeCore(HttpContextBase httpContext)
	{
		if (httpContext.Request.IsLocal)
		{
			return localAllowed;
		}
		else
		{
			return true;
		} 
	}
}
```

这是一个简单的`filter`，它允许你访问本机的`action`，在`action`里面调用 `CustomAuthAttribute`

```js
public class HomeController : Controller { 
	[CustomAuth(false)]         
	public string Index() { 
		return "This is the Index action on the Home controller"; 
	} 
} 
```

上面传递一个布尔类型的参数`false`给`CustomAuth`，这个`filter`最后返回`false`给`CustomAuth`，这个`filter`最后返回`f
，页面会出现401身份验证未通过错误

### 使用内置的`Authorization Filter`类型

尽管上面自定义的`filter`很有用，可是还是可以使用系统内置的身份验证

*`Authorization`属性*

名称		|类型			|描述
Users		|string			|一个以逗号分隔的允许访问`action`的一组用户名
Roles		|string			|一个以逗号分隔的允许访问`action`的一组角色名

















