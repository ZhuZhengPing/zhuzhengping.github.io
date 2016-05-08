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

<img src='http://img2.ph.126.net/2i1eO8hfU7TxRqkyF2gusw==/6598096710578598344.png' width="100%"/>




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
请求了，它返回一个`CustomerController`的实例













