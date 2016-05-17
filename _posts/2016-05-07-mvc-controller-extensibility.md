---
layout: post
title:  "controller 扩展性"
date:   2016-05-07 16:32:18 +0800
categories: mvc
tags: mvc controller
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在这一章，我们介绍`controller`的高级特性，下面的图是基本组件之间的控制流程。

<img src='http://ww2.sinaimg.cn/mw690/006dag38gw1f3mz7fovnbj30f903n3yr.jpg' width="100%"/>




### 创建自定义的`Controller Factory`

理解`Controller Factory`最好的方式是自己创建一个自定义功能，在实际的工作中，有可能你不需要创建这个`Controller Factory`

*`CustomControllerFactory`的内容*

```c#
public class CustomControllerFactory : IControllerFactory
{
	public IController CreateController(
	RequestContext requestContext, string controllerName)
	{
		Type targetType = null; 
		switch (controllerName)
		{
			case "ControllerTest":
				targetType = typeof(ControllerTestController);
				break;
			case "Home":
				targetType = typeof(HomeController);
				break;
			default: requestContext.RouteData.Values["controller"] = "Product";
				targetType = typeof(RouteTestController);
				break;
		}
		return targetType == null ? null :
			(IController)DependencyResolver.Current.GetService(targetType); 
	}

	public SessionStateBehavior GetControllerSessionBehavior(
	RequestContext requestContext, string controllerName)
	{
		return SessionStateBehavior.Default; 
	}

	public void ReleaseController(IController controller)                            
	{
		IDisposable disposable = controller as IDisposable; 
		if (disposable != null)
		{
			disposable.Dispose();
		} 
	}
}
```

最重要的方法为`CreateController`，当一个请求需要一个`Controller`为它服务的时候调用，
这个方法的参数为`RequestContext`

*`RequestContext`的属性*

名称			|类型				|描述
HttpContext		|HttpContextBase	|提供Http请求的信息
RouteData		|RouteData			|请求所匹配的路由信息

#### 实现其他的`IControllerFactory`接口

>* `GetControllerSessionBehavior`方法确认是否帮`controller`保存`session`值
>* `ReleaseController`在不需要使用`controller`时调用

我们告诉MVC框架在`ControllBuilder`类里使用`IControllerFactory`,需要在
`Global.asax.cs`中注册

```c#
public class MvcApplication : System.Web.HttpApplication
{
	protected void Application_Start()
	{
		AreaRegistration.RegisterAllAreas();

		WebApiConfig.Register(GlobalConfiguration.Configuration);
		FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
		RouteConfig.RegisterRoutes(RouteTable.Routes);
		ControllerBuilder.Current.SetControllerFactory(new CustomControllerFactory());
	}
}
```

### 使用内置的`Controller Factory`

我们已经创建了一个自定义的`Controller Factory`,仅仅是为了演示如何`Controller Factory`如何工作的，
系统内置的名称为`DefaultControllerFactory`,当 `routing system`接收到一个请求，`DefaultControllerFactory`
会在`routing data`里面找到`controller`的属性，该`controller`必须符合以下特性

>* `controller`所在的类名必须为public
>* 类名必须是具体的（不能为抽象类）
>* 这个类不能带泛型参数
>* 类名必须以`Controller`结尾
>* 类名必须实现`IController`接口

`DefaultControllerFactory`保留`controller`类的列表，这样就不需要每次都请求这些信息，
如果匹配到合适的`controller`，创建一个`controller`实例

### `Namespaces`优先级

我们可以在`route`里面设置`namespaces`的优先级，我们也可以在`DefaultControllerFactory`
把他们设置优先级

```c#
public class MvcApplication : System.Web.HttpApplication { 
	protected void Application_Start() { 
		AreaRegistration.RegisterAllAreas(); 
		WebApiConfig.Register(GlobalConfiguration.Configuration); 
		FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters); 
		RouteConfig.RegisterRoutes(RouteTable.Routes); 

		ControllerBuilder.Current.DefaultNamespaces.Add("MyControllerNamespace"); 
		ControllerBuilder.Current.DefaultNamespaces.Add("MyProject.*"); 
	} 
}
```

我们使用`ControllerBuilder.Current.DefaultNamespaces.Add`方法添加的`namespaces`应该放在首要的位置，
所有用`Add`方法添加的命名空间的优先级别都是平等的。

### 使用`Controller Activator`

*实现`IControllerActivator`接口*

```c#
public class CustomControllerActivator : IControllerActivator
{
	public IController Create(RequestContext requestContext, Type controllerType)
	{
		if (controllerType == typeof(ControllerTestController))
		{
			controllerType = typeof(ControllerTestController);
		}
		return (IController)DependencyResolver.Current.GetService(controllerType); 
	}
}
```

我们的`IControllerActivator`功能非常简单，如果`ControllerTestController`被
请求了，它返回一个`CustomerController`的实例，使用这个功能，我们只需要在`Application_Start`里面注册一下

```c#
public class MvcApplication : System.Web.HttpApplication {         
	protected void Application_Start() { 
		AreaRegistration.RegisterAllAreas(); 
		WebApiConfig.Register(GlobalConfiguration.Configuration); 
		FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters); 
		RouteConfig.RegisterRoutes(RouteTable.Routes); 

		ControllerBuilder.Current.SetControllerFactory(new  
			DefaultControllerFactory(new CustomControllerActivator())); 
	} 
} 
```

### 重写`DefaultControllerFactory`方法

方法					|结果				|描述
CreateController		|IController		|默认的，这个方法会调用`GetControllerType`来实例化`controller`
GetControllerType 		|Type				|将请求映射到控制器类型，这就是大多数章的前面列出的标准执行
GetControllerInstance	|IController		|创建指定的类型

### 创建自定义的 `Action Invoker`

当`controller factory`创建了一个类，MVC框架需要调用这个类的`action`,也就是执行一个
`action invoker`

```js
public class CustomActionInvoker:IActionInvoker
{
	public bool InvokeAction(ControllerContext controllerContext, string actionName)
	{
		if (actionName == "Index")
		{
			controllerContext.HttpContext.Response.Write("This is output from the Index action");
			return true;
		}
		else
		{
			return false;
		} 
	}
}
```

`action invoker`不关心`controller`类，它只处理`action`本身，调用这个自定义的`action invoker`
我们还需要设置`controller`的`Controller

```c#
public class ActionInvokerController : Controller 
{
	public ActionInvokerController()
	{
		this.ActionInvoker = new CustomActionInvoker();
	}
}
```

### 使用内置的 `Action Invoker`

系统内置的`Invoker`，就是`ControllerActionInvoker`类，
有一些非常复杂的技术匹配请求的行为，我们下面列举出来

>* 方法必须为`public`
>* 方法不能为`static`
>* 方法不能为`System.Web.Mvc.Controller`或者是它的子类
>* 方法不能有特别的名称

### 使用自定义的`Action Name`

在默认情况下，`action`方法的名称就是代表它，可是你可以重新指定它的名称。

```c#
[ActionName("Enumerate")]
public ViewResult List()
{
	return View();
} 
```

### 使用`Action Method`选择器

经常有不同的`actions`有同样的名称，因为有的是相同的方法，不同的参数，
或者你使用`ActionName`，不同的方法代表相同的`action`，需要`Get`请求，
`Post`请求，`Put`请求，或者`NoAction`，它不能被`route`访问，只能作为方法使用

```c#
[NonAction]
public ActionResult MyAction()
{
	return View();
} 
```

### 创建一个自定义的`action`方法选择器

`action`方法选择器是`ActionMethodSelectorAttribute`的子类，我们创建一个简单
的自定义的`action`方法`LocalAttribute`

*自定义的`action`方法选择器*

```c#
public class LocalAttribute : ActionMethodSelectorAttribute
{
	public override bool IsValidForRequest(ControllerContext controllerContext,MethodInfo methodInfo)
	{
		return controllerContext.HttpContext.Request.IsLocal; 
	}
}
```

我们重写了`IsValidForRequest`方法，当在本机运行的时候，会返回true,下面是
`LocalAttribute`的使用方法

```c#
public class ControllerTestController : Controller
{
	public ActionResult Index()
	{
		return View();
	}

	[ActionName("Index")]
	public ActionResult LocalIndex()
	{
		return View("Result");
	} 
}
```

我们上面的控制器里面会出现2个`Index action`，当调用时，会抛出以下错误

<img src="http://img2.ph.126.net/-loi-HyXW51qkwdOs3GUdQ==/1994250210096713081.png" alt="action error" width="100%" />

解决这个错误的方法是，给其中一个`action`打上`[Local]`标签

```c#
[Local] 
[ActionName("Index")] 
public ActionResult LocalIndex() {     
	return View(); 
}
```

### 处理未知的`actions`

如果`action`调用者不能找到`action`方法，`InvokeAction`返回false，`Controller`类
调用`HandleUnknownAction`方法，默认的，这个方法返回404，可是你可以重写这个方法

```c#
public class ControllerTestController : Controller
{
	protected override void HandleUnknownAction(string actionName)
	{
		Response.Write(string.Format("You requested the {0} action", actionName));
	}
}
```

### 在自定义的`IControllerFactory`中管理`Session State`

在这个章节的开始部分，我们熟悉了`IControllerFactory`接口，里面宝航一个`GetControllerSessionBehavior`
方法，它返回一个`SessionStateBehavior`枚举

*`SessionStateBehavior`枚举*

Value		|描述
Default		|使用默认的Asp.net行为，判断`HttpContext`里面的`Session state`
Required	|全面启用`read-write session`会话状态
ReadOnly	|启用 `Read-only session`状态
Disabled	|禁用`session`状态

```c#
public class CustomControllerFactory : IControllerFactory
{

	public SessionStateBehavior GetControllerSessionBehavior(RequestContext requestContext, string controllerName)
	{
		switch (controllerName)
		{
			case "Home":
				return SessionStateBehavior.ReadOnly;
			case "Product":
				return SessionStateBehavior.Required;
			default:
				return SessionStateBehavior.Default;
		}
	}
}
```

### 使用`DefaultControllerFactory`管理`Session state`

当你使用内置的`controller factory`,你可以使用`SessionState`属性来控制
`Session state`

```c#
[SessionState(SessionStateBehavior.Disabled)] 
public class ControllerTestController : Controller
{
}
```

### 使用异步的`Controller`

asp.net平台底层维护一个拥有.net线程池的客户端用户请求进程，这个池叫做
`worker thread pool`，这些线程叫做`worker threads`，当收到一个请求，
池里面的一个`worker thread`处理请求，当请求被处理，这个`worker thread`返回池，
并且能处理新请求，asp.net线程池有两个关键的好处

>* 通过`worker threads`，你能避免每次创建一个新的来处理请求
>* 只有固定数量的线程可用，避免服务器产生过多请求以至于不能处理

当请求可以在很短的时间内处理，`worker thread pool`性能最好，如果你有依赖其它的服务
并且需要处理很久的`action`，性能会最慢

#### 创建一个异步的控制器

有2种方法创建异步的控制器，一种是实现`System.Web.Mvc.Async.IAsyncController`接口，
相当于实现了异步的`IController`,异步的`controller`需要4.5框架,我们创建一个这样的示例

*创建异步的`Controller`*

```c#
public class RemoteDataController : AsyncController
{
	public async Task<ActionResult> Data()
	{
		string data = await Task<string>.Factory.StartNew(() =>
		{
			return new RemoteService().GetRemoteData();
		});
		return View((object)data);
	}
	
	// 调用异步的方法
	public async Task<ActionResult> ConsumeAsyncMethod()
	{
		string data = await new RemoteService().GetRemoteDataAsync(); 
		return View("Data", (object)data);
	}
}
````

### 使用异步的`controller`方法

你也可以使用一个异步的控制器来执行一个异步的方法

*`RemoteService`类*

```c#
public class RemoteDataController : AsyncController
{
	public async Task<ActionResult> Data()
	{
		string data = await Task<string>.Factory.StartNew(() =>
		{
			return new RemoteService().GetRemoteData();
		});

		return View((object)data);
	}

	public async Task<ActionResult> ConsumeAsyncMethod()
	{
		string data = await new RemoteService().GetRemoteDataAsync(); 
		return View("Index", (object)data);
	}
}
```















