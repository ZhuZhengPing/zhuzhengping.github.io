---
layout: post
title:  "filters"
date:   2016-05-03 16:32:18 +0800
categories: mvc
tags: mvc filter
author: Zhengping Zhu
---

* content
{:toc}

## 概念

 filters 向MVC框架请求注入额外业务逻辑，他们能实现简单而优雅的面向切面的编程，他们可以使用到应用程序的任何位置，经典的面向切面编程示例是工作日志，身份验证和缓存...




### 使用  filters 

当做一个项目的时，很多时候都需要用到身份验证、权限等东西，在MVC项目中，我们需要验证  controller 的权限，或者验证 action 的权限，可以使用`[Authorize]`

介绍4种基本的 filters 

 Filter 类型	|实现的接口				|默认实现				|描述
Authorization	|IAuthorizationFilter 	|AuthorizeAttribute		|比其它的 filters 和 action 先运行
Action			|IActionFilter			|ActionFilterAttribute	|在 action 方法之前，之后执行
Result			|IResultFilter			|ActionFilterAttribute	|在 action result 之前，之后执行
Exception		|IExceptionFilter		|HandleErrorAttribute	|在其它的 filter 、 action 方法或者 action result 抛出异常以后

### 创建一个 filter 示例项目

创建一个自定义 filter 继承 AuthorizeAttribute ，实现一个自定义的 filter 功能

```c#
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

这是一个简单的 filter ，它允许你访问本机的 action ，在 action 里面调用  CustomAuthAttribute 

```c#
public class HomeController : Controller { 
	[CustomAuth(false)]         
	public string Index() { 
		return "This is the Index action on the Home controller"; 
	} 
} 
```

上面传递一个布尔类型的参数 false 给 CustomAuth ，这个 filter 最后返回 false 给 CustomAuth ，这个 filter 最后返回 false 
，页面会出现401身份验证未通过错误

### 使用内置的 Authorization Filter 类型

尽管上面自定义的 filter 很有用，可是还是可以使用系统内置的身份验证

* Authorization 属性*

名称		|类型			|描述
Users		|string			|一个以逗号分隔的允许访问 action 的一组用户名
Roles		|string			|一个以逗号分隔的允许访问 action 的一组角色名

*使用内置的 filter * 

```c#
[Authorize(Users = "adam, steve, jacqui", Roles = "admin")]
public ActionResult Index()
{
	return View();
}
```		

### 使用  Exception filters 

当你运行一个 action 抛出异常后， Exception filters 就会运行,`Exception 会从下面这些地方生成

>* 另外一种 filter  (`authorization`,`action 或者 result filter`)
>*  action 本身
>* 当 action result 执行的时候

#### 创建一个 Exception filter 

 Exception filters 必须实现 IExceptionFilter 接口

* ControllerContext 属性 

名称			|类型				|描述
Controller		|ControllerBase		|返回控制器对象
HttpContextBase	|HttpContextBase	|`request 的访问详细以及 response 的详细
IsChlidAction	|bool				|如果是 child action`,返回true
RequestContext	|RequestContext		|能够访问 HttpContext 和 Route Data 
RouteData		|RouteData			|为 Request 提供 Routing data 

 ExceptionContext 定义了一些有用的属性

* ExceptionContext 属性*

名称			|类型				|描述
ActionDescriptor|ActionResult		|提供 action 方法的详细信息
Result			|ActionResult		|`action 方法的 result ，一个 filter 设置这个属性值为 non-null 取消请求
Exception		|Exception			|未处理的 Exception 
ExceptionHandled|bool				|如果其它 filter 标记这个 Exception 为已处理，则返回true

创建一个示例的 Exception filter 

*实现  Exception filter *

```c#
public class RangeExceptionAttribute:FilterAttribute,IExceptionFilter
{
	public void OnException(ExceptionContext filterContext)
	{
		if (!filterContext.ExceptionHandled 
		&& filterContext.Exception is ArgumentOutOfRangeException)
		{
			filterContext.Result = new RedirectResult("~/Content/RangeErrorPage.html");
			filterContext.ExceptionHandled = true;
		}
	}
}
```

新建一个错误处理的 Html 页面，处理 filter 返回的错误

```html
<!DOCTYPE html> 
<html xmlns="http://www.w3.org/1999/xhtml"> 
<head> 
    <title>Range Error</title> 
</head> 
<body> 
    <h2>Sorry</h2> 
    <span>One of the arguments was out of the expected range.</span> 
</body> 
</html>
```

接下来，我们在控制器里面创建就一个 action 来使用上面新建的 filter 

```c#
[RangeException] 
public string RangeTest(int id) { 
	if (id > 100) { 
		return String.Format("The id value is: {0}", id); 
	} else { 
		throw new ArgumentOutOfRangeException("id", id, ""); 
	} 
} 
```

### 使用视图来响应 Exception 

使用一个页面来响应 Exception 是一种非常简单的方式，但是这种方式不能很好的把错误呈现给用户，为了显示具体的错误，我们可以返回一个视图显示错误。

```c#
public class RangeExceptionAttribute:FilterAttribute,IExceptionFilter
{
	public void OnException(ExceptionContext filterContext)
	{
		if (!filterContext.ExceptionHandled && 
		filterContext.Exception is ArgumentOutOfRangeException)
		{
			int val = (int)(((ArgumentOutOfRangeException)filterContext.Exception).ActualValue); 
			filterContext.Result = new ViewResult
			{
				ViewName = "RangeError",
				ViewData = new ViewDataDictionary<int>(val)
			}; 
			filterContext.ExceptionHandled = true;
		} 
	}
}
```

我们创建了一个 ViewResult 对象并且给 ViewName 和 ViewData 属性赋值，上面的 Filter 指定了视图名为
 RangeError 

```html
@model int 
<!DOCTYPE html> 
<html> 
<head> 
    <meta name="viewport" content="width=device-width" /> 
    <title>Range Error</title> 
</head> 
<body> 
    <h2>Sorry</h2> 
    <span>The value @Model was out of the expected range.</span>         
    <div> 
        @Html.ActionLink("Change value and try again", "Index") 
    </div> 
</body> 
</html>
```

### 使用内置的 Exception filter 

我们创建一个自定义的 Exception filter 是为了明白它是怎么工作的，在真正的工作环境中，我们是不需要创建
 Exception filter 的，因为MVC框架已经内置了 HandleErrorAttribute ，它是一个内置的 Exception filter ，
实现了 IExceptionFilter 

* HandleErrorAttribute 属性*

名称			|类型			|描述
ExceptionType	|Type			|默认值是 System.Exception ，这意味着它能处理所有的 Exception 
View			|string			|`filter 对应的 View ，如果你不指定一个值，会带有一个默认值 Error 
Master			|string			|`filter 对应的 View  的模板

如果要使用 Exception filter ，需要在 Web.config 中启用，添加 customErrors 节点

*在 Web.config 中启用自定义错误*

```c#
<system.web> 
  <httpRuntime targetFramework="4.5" /> 
  <compilation debug="true" targetFramework="4.5" /> 
  <pages> 
    <namespaces> 
      <add namespace="System.Web.Helpers" /> 
      <add namespace="System.Web.Mvc" /> 
      <add namespace="System.Web.Mvc.Ajax" /> 
      <add namespace="System.Web.Mvc.Html" /> 
      <add namespace="System.Web.Routing" />       
	  <add namespace="System.Web.WebPages" />     
	</namespaces> 
  </pages>   
  <customErrors mode="On"  defaultRedirect="/Content/RangeErrorPage.html"/> 
</system.web>
```

在 action 中使用 HandleError 

```c#
[HandleError(ExceptionType = typeof(ArgumentOutOfRangeException), View = "RangeError")] 
public string RangeTest(int id) { 
    if (id > 100) { 
        return String.Format("The id value is: {0}", id); 
    } else { 
        throw new ArgumentOutOfRangeException("id", id, ""); 
    } 
} 
```

当我们启动一个视图， HandleErrorAttribute filter 传递 HandleErrorInfo 视图模型对象

*HandleErrorInfo 属性*

名称				|类型				|描述
ActionName			|string				|返回产生错误的 action 
ControllerName		|string				|返回产生错误的 controller 的权限，或者验证 action 的权限，可以使用 
Exception			|Exception			|返回错误

### 使用 Action filters 

 Action filters 有很多用途，一般用在 Action 执行前和执行后

*ActionExecutingContext 属性*

名称				|类型				|描述
ActionDescriptor	|ActionDescriptor	|提供 Action 方法的详细信息
Result				|ActionResult		|`Action 方法的返回值， filter 设置 non-null 来取消请求

创建一个自定义的 Action filter 

```c#
public class CustomActionAttribute : FilterAttribute, IActionFilter
{
	public void OnActionExecuted(ActionExecutedContext filterContext)
	{
		throw new NotImplementedException();
	}

	public void OnActionExecuting(ActionExecutingContext filterContext)
	{
		if (filterContext.HttpContext.Request.IsLocal)
		{
			filterContext.Result = new HttpNotFoundResult();
		} 
	}
}
```

在这个示例中，我们使用 OnActionExecuting 方法来确认请求是不是在本机运行的

#### 实现 OnActionExecuted 方法

 OnActionExecuted 方法是在 Action 方法执行后再执行，下面实现这个方法

```c#
public class ProfileActionAttribute : FilterAttribute, IActionFilter
{
	private Stopwatch timer; 
	public void OnActionExecuted(ActionExecutedContext filterContext)
	{
		timer.Stop(); 
	}
	public void OnActionExecuting(ActionExecutingContext filterContext)
	{
		timer = Stopwatch.StartNew();
		filterContext.HttpContext.Response.Write(
			string.Format("<div>Action method elapsed time: {0}</div>",
			timer.Elapsed.TotalSeconds));
	}
}
```

注意： ProfileAction 的信息先显示出来，这是因为 Action filter 比 Action 方法先执行

*ActionExecutedContext属性*

名称				|类型				|描述
ActionDescriptor	|ActionDescriptor	|提供 Action 方法的详细信息
Canceled			|bool				|如果 Action 已经被处理，返回true
Exception			|Exception			|返回其它 filter 返回的错误或者 Action 返回的错误
ExceptionHandled	|bool				|如果错误已经被处理，返回true
Result				|ActionResult		|`Action 方法的结果， filter 设置这个属性为 non-null 来取消请求

### 使用 Result Filters

为了实现一个简单的 Result filter ，我们创建了一个新的类 ProfileResultAttribute 

 Result filter 在 Action 方法运行后执行

```c#
public class ProfileResultAttribute : FilterAttribute, IResultFilter
{
	private Stopwatch timer; 
	public void OnResultExecuted(ResultExecutedContext filterContext)
	{
		timer = Stopwatch.StartNew(); 
	}

	public void OnResultExecuting(ResultExecutingContext filterContext)
	{
		timer.Stop();
		filterContext.HttpContext.Response.Write(
				string.Format("<div>Result elapsed time: {0}</div>",
					timer.Elapsed.TotalSeconds));
	}
}
```

### 使用系统内置的 Action filter 和 Result filter 

MVC框架包含内置的 Action filter 和 Result filter`,叫做 ActionFilterAttribute 
我们重新创建一个 filter 继承抽象类 ActionFilterAttribute ，重写里面的方法

```c#
public class ProfileAllAttribute : ActionFilterAttribute
{
	private Stopwatch timer;
	public override void OnActionExecuted(ActionExecutedContext filterContext)
	{
		base.OnActionExecuted(filterContext);
	}

	public override void OnActionExecuting(ActionExecutingContext filterContext)
	{
		timer = Stopwatch.StartNew(); 
	}

	public override void OnResultExecuted(ResultExecutedContext filterContext)
	{
		timer.Stop();
		filterContext.HttpContext.Response.Write(
				string.Format("<div>Total elapsed time: {0}</div>",
					timer.Elapsed.TotalSeconds)); 
	}

	public override void OnResultExecuting(ResultExecutingContext filterContext)
	{
		base.OnResultExecuting(filterContext);
	}
}
```

 ActionFilterAttribute 实现了 IResult 和 IFilter ，也就是它具有这两者的功能

### 使用其他 Filter 的特性

 Controller 已经实现了 IActionFilter`,`IExceptionFilter`,`IResultFilter`,`IAuthorizationFilter ，我们可以在一个 Controller 里面
直接实现这些 Filter 

```c#
public class ControllerTestController : Controller
{
	public ActionResult Index()
	{
		return View();
	}
	private Stopwatch timer;
	protected override void OnActionExecuting(ActionExecutingContext filterContext)
	{
		timer = Stopwatch.StartNew(); 
		filterContext.HttpContext.Response.Write(
				string.Format("<div>kais: {0}</div>",
					timer.Elapsed.TotalSeconds)); 
	}
	protected override void OnResultExecuted(ResultExecutedContext filterContext)
	{
		timer.Stop();
		filterContext.HttpContext.Response.Write(
				string.Format("<div>一起话费的世界为: {0}</div>",
					timer.Elapsed.TotalSeconds)); 
	}
}
```

### 使用全局的 Filters 

在项目中，如果所有控制器都需要 Filter ，你可以设置全局的 Filter ，在 App_Start/FilterConfig.cs 文件中设置

```c#
public class FilterConfig
{
	public static void RegisterGlobalFilters(GlobalFilterCollection filters)
	{
		filters.Add(new HandleErrorAttribute());
		filters.Add(new RangeExceptionAttribute());
		filters.Add(new ProfileAllAttribute());
	}
}
```

###  Filter 执行顺序

 filter 根据类型来执行的，一次的循序为:`authorization filters`,`action filters`,`result filters`,当任何 filter 出现错误的时候，
并且未处理的时候执行 exception filter`,下面创建 SimpleMessageAttribute 做一个示范

```c#
[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)] 
public class SimpleMessageAttribute : FilterAttribute, IActionFilter
{
	public string Message { get; set; } 
	public void OnActionExecuted(ActionExecutedContext filterContext)
	{
		filterContext.HttpContext.Response.Write(string.Format("<div>[After Action: {0}]<div>", Message));
	}

	public void OnActionExecuting(ActionExecutingContext filterContext)
	{
		filterContext.HttpContext.Response.Write(string.Format("<div>[Before Action: {0}]<div>", Message)); 
	}
}
```

当 Action 调用的时候，会执行 OnActionExecuted 和 OnActionExecuting`,设置 AllowMultiple=true 可以多次指定这个 filter 
设置 filter 的 Order 功能指定排序，但是只能设置 OnActionExecuting 的执行次序，全局 filter 最先执行

```c#
[SimpleMessage(Message = "A",Order=2)]
[SimpleMessage(Message = "B",Order=1)]
public ActionResult Index()
{
	return View();
}
```

### 使用内置的 filters 

*内置的 filters*

Filter														|描述
RequireHttps												|强制使用 https 协议进行操作
OutputCache													|缓存 action 方法的返回值
ValidateInput和ValidationAntiForgeryToken，AsyncTimeout 	|授权与安全相关的过滤器
NoAsyncTimeout												|使用异步的控制器
ChildActionOnlyAttribute									|一种授权的 filter`,支持 Html.Action 和 Html.RenderAction 

### 使用 OutputCache Filter 

 OutputCache filter 告诉MVC框架缓存 action 方法返回的信息，

*OutputCache filter 参数*

参数					|类型				|描述
Duration				|int				|指定保存数据的时间
VaryByParam				|string				|根据 Reuqest.QueryString 和 Reuqest.Form 指定不同的缓存，默认值不随参数变化而变化，另外的选项是*，意思是根据请求的参数变化而变化，如果不指定，则为默认值none
VaryByHeader			|string				|根据Header信息获取不同的 cachhe 
VaryByCustom			|string				|如果指定，ASP.NET在 Global.asax 里访问 GetVaryByCustomString ，你可以生成你的 cache key 
VaryByContentEncoding	|string				|为每个浏览器编码创建一个缓存
Location				|OutputCacheLocation|指定缓存的地址
NoStore					|bool				|如果为true，告诉asp.net发送一个 CacheColtrol:no-store 请求头给浏览器，只用于保护敏感数据
CacheProfile			|string				|如果指定，命令 asp.net 从 web.config 中取`<outputCacheSettings>`参数信息
SqlDependency			|string				|缓存数据在数据库表内容发生改变时，重新设置新缓存

*SelectiveCache Controller*























