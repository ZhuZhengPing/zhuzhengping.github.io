---
layout: post
title:  "MVC 路由"
date:   2016-04-30 16:32:18 +0800
categories: mvc
tags: mvc routing
author: Zhengping Zhu
---

* content
{:toc}

## 概念

MVC路由用来处理 MVC的 Url，ASP.NET 平台使用路由系统，路由系统有两个功能
	
>* 检查用户请求的URL,访问对应的controller和action
>* 生成URL，在我们开发的网站中，当用户单击按钮时，将调用一个特定的链接





### URL匹配示例 如果在`APP_Start`文件夹里面的`RouteConfig` 里面的代码时这样的话

```java
public static void RegisterRoutes(RouteCollection routes)
{
	routes.MapRoute(
		null,"{controller}/{action}"
	);
}
```

匹配规则可能是这样的：

请求的URL    		|变量
http://mysite.com/Admin/Index			|controller = Admin  action = Index 
http://mysite.com/Index/Admin  			|controller = Index  action = Admin
http://mysite.com/Apples/Oranges		|controller = Apples  action = Oranges 
http://mysite.com/Admin 				|匹配失败—少于两个变量
http://mysite.com/Admin/Index/Soccer 	|匹配失败-多于两个变量

URL模式的匹配行为

>* URL模式都是比较保守的，只会匹配和URL相同的变量
>* 如果URL的数量和变量相同的话，routing会提取变量的值

### 创建有默认值的路由

```js   
public class RouteConfig { 
	public static void RegisterRoutes(RouteCollection routes) { 
		routes.MapRoute("MyRoute", "{controller}/{action}",                 
		new { controller = "Home", action = "Index" }); 
	} 
} 
```

#### `controller`和`action`都提供了默认值,可以匹配带有1个、2个、3个的URL

变量数量		|示例							|匹配
0				|mydomain.com					|controller = Home  action = Index  
1				|mydomain.com/Customer			|controller = Customer  action = Index  
2				|mydomain.com/Customer/List 	|controller = Customer  action = List 
3				|mydomain.com/Customer/List/All	|没匹配-变量太多

#### 使用静态的URL变量

URL不是所有的部分都需要变量，你也可以在URL上面创建一个静态的变量，就像下面使用静态变量`Public`一样

```
http://mydomain.com/Public/Home/Index 
```

#### 创建自定义的部分变量

Routing不仅仅是接收URL的变量，我们也可以定义自己的变量

```js
public static void RegisterRoutes(RouteCollection routes) { 
	routes.MapRoute("MyRoute", "{controller}/{action}/{id}",                 
	new { controller = "Home", action = "Index",  
	id = "DefaultId" }); 
} 
```

我们可以根据Routing的部分变量访问`RouteData.Values`属性，为了验证这一点，下面创建了一个action

```js
public ActionResult CustomVariable() { 
	ViewBag.Controller = "Home"; 
	ViewBag.Action = "CustomVariable"; 
	ViewBag.CustomVariable = RouteData.Values["id"]; 
	return View(); 
} 
```

`RouteData.Values["id"]` 可以获取到`RouteCollection`里面的自定义参数`id`

### 创建选择性的部分变量

一个选择性的部分变量不需要再`RouteCollection`里面指定，并且没有默认值，下面创建了一个选择性变量的示例，我们设置部分变量为选择性变量的语法为：`UrlParameter.Optional`

```js
public static void RegisterRoutes(RouteCollection routes) { 
	routes.MapRoute("MyRoute", "{controller}/{action}/{id}",    
	new { controller = "Home", action = "Index",  
	id = UrlParameter.Optional }); 
}
```

这个route匹配URL 不管id有没有提供，下面的表格列出URL匹配项

变量			|示例URL								|匹配
0				|mydomain.com 							|controller = Home  action = Index 
1				|mydomain.com/Customer					|controller = Customer  action = Index 
2				|mydomain.com/Customer/List				|controller = Customer  action = List 
3				|mydomain.com/Customer/List/All 		|controller = Customer  action = List id = All 
4				|mydomain.com/Customer/List/All/Delete 	|匹配失败-太多变量

创建一个action来验证选择性的变量是否有值

```js
public ActionResult CustomVariable(string id) { 
	ViewBag.Controller = "Home"; 
	ViewBag.Action = "CustomVariable"; 
	ViewBag.CustomVariable = id == null ? "<no value>" : id; 
	return View(); 
}
```

###创建可变长度的Routes

Routes可接受数量变化的部分变量，定义一个支持可变长度的URL变量`catchall`，通过加上一个前缀(*),下面定义了一个为Callchall的变量

```js
public static void RegisterRoutes(RouteCollection routes) { 
	routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}",                
	new { controller = "Home", action = "Index",  
	id = UrlParameter.Optional }); 
} 
```

上面的RouteCollection添加了一个`catchall`变量，这个route将匹配任何URL，开始的三个参数分别是controller,action和id变量，特别说明的是，最后一个参数catchall将匹配所有

*使用catchall匹配URL*

变量					|示例URL						|匹配
0						|/								|controller = Home  action = Index  
1						|Customer 						|controller = Customer  action = Index 
2						|/Customer/List 				|controller = Customer  action = List 
3						|/Customer/List/All 			|controller = Customer  action = List id = All  
4						|/Customer/List/All/Delete 		|controller = Customer  action = List id = All catchall = Delete
5						|/Customer/List/All/Delete/Perm |controller = Customer  action = List id = All catchall = Delete/Perm 

### 指定控制器的命名空间

当一个URL匹配route,MVC框架根据控制器的名称来访问，例如当`controller`的值为`Home`,MVC 框架会查找`HomeController`控制器，如果项目里面有多个`HomeController`控制器在不同的命名空间下，则会出现错误，这时我们需要指定命名空间。

```js
routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}", 
	new { controller = "Home", action = "Index",id = UrlParameter.Optional}, 
	new[] { "URLsAndRoutes.AdditionalControllers", "UrlsAndRoutes.Controllers" }); 
} 
```

当设置了命名空间后，MVC框架会在 `URLsAndRoutes.AdditionalControllers` 下找对应的controller和action

### 路由约束

设置限制url路由匹配

*使用正则表达式添加约束*

```js
public static void RegisterRoutes(RouteCollection routes) { 
    routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}",         
	new { controller = "Home", action = "Index", id = UrlParameter.Optional }, 
    new { controller = "^H.*", action = "^Index$|^About$"}, 
    new[] { "URLsAndRoutes.Controllers"}); 
} 
```

在上面的示例中，我们使用正则表达式的约束匹配只能以H开头的URL，并且action 只能是Index和About

### 使用Http (get 或者 post)请求约束

我们可以约束一个URL ，指定它只能是以Get或者Post访问的

```js
public static void RegisterRoutes(RouteCollection routes) { 
    routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}",         
	new { controller = "Home", action = "Index", id = UrlParameter.Optional }, 
    new { controller = "^H.*", action = "Index|About",             
			httpMethod = new HttpMethodConstraint("GET") }, 
    new[] { "URLsAndRoutes.Controllers" }); 
}
```

### 创建一个自定义约束

如果上面的route功能都不满足你的需求，你可以实现`IRouteConstraint`接口创建一个自定义的约束，我们添加一个新类`UserAgentConstraint`

```js
public class UserAgentConstraint : IRouteConstraint
{
	private string requiredUserAgent;
	public UserAgentConstraint(string agentParam)
	{
		requiredUserAgent = agentParam;
	} 
	public bool Match(HttpContextBase httpContext, Route route, string parameterName, 
		RouteValueDictionary values, RouteDirection routeDirection)
	{
		return httpContext.Request.UserAgent != null && 
			httpContext.Request.UserAgent.Contains(requiredUserAgent); 
	}
}
```

`IRouteConstraint`创建匹配的方法，`Match`方法提供客户端访问请求,下面创建了一个浏览器约束，只能在谷歌浏览器中访问。

```js
routes.MapRoute("ChromeRoute", "{*catchall}", 
	new { controller = "Home", action = "Index" }, 
	new{customConstraint = new UserAgentConstraint("Chrome")},
	new[] { "UrlsAndRoutes.AdditionalControllers" }
);
```

### 路由访问磁盘文件

不是所有的MVC请求都是请求的controller和action，我们还是需要请求一些其他的内容，例如图片，HTML页面，javascript类库等等。设置`RouteCollection`的`RouteExistingFiles`属性为true

```js
public static void RegisterRoutes(RouteCollection routes) { 
	routes.RouteExistingFiles = true; 
}
```

### 绕过routing系统

在`RouteCollection`集合里调用`IgnoreRoute`方法，可以绕过routing系统

*使用`IgnoreRoute`方法*

```js
public static void RegisterRoutes(RouteCollection routes) {
	routes.IgnoreRoute("Content/{filename}.html");
}

### 使用Routing system 生成外部链接

使用`Html.ActionLink`是最简单的生成外部链接的方式

```js
@Html.ActionLink("This is an outgoing URL", "CustomVariable")
@Html.ActionLink("This targets another controller", "Index", "Admin")  
@Html.ActionLink("This is an outgoing URL","CustomVariable", new { id = "Hello" })  
@Html.ActionLink("This is an outgoing URL", "Index", "Home", null, new{ id = "myAnchorID", @class = "myCSSClass"}) 
@Html.ActionLink("This is an outgoing URL", "Index", "Home","https", "myserver.mydomain.com", " myFragmentName", new { id = "MyId" },new { id = "myAnchorID", @class = "myCSSClass" }) 
```

### 生成URL，没有超链接

`HTML.ActionLink`生成了一个a标签的元素，可是有时候我们只想显示URL，不显示超链接。

```js
@Url.Action("Index", "Home", new { id = "MyId" }) 
```

### 在Action 方法里面生成URL

通常我们会在`view`里面生成URL，有些时候我们也想在action方法里面生成URL

```js
public ViewResult MyActionMethod() { 
    string myActionUrl = Url.Action("Index", new { id = "MyID" }); 
    string myRouteUrl = Url.RouteUrl(new { controller = "Home", action = "Index" });  
    return View(); 
}
```

另一个常用的功能是跳转到另外一个`action`,我们可以返回一个`RedirectToAction`类型

*跳转到另外一个`action`*

```ruby
public RedirectToRouteResult MyActionMethod() { 
    return RedirectToAction("Index"); 
} 
```

`RedirectToAction` 是 `RedirectToRouteResult`的子类，如果你想一个url重定向，你可以使用`RedirectToRoute`方法

*重定向URL生成匿名类型的属性*

```python
public RedirectToRouteResult MyActionMethod() { 
	return RedirectToRoute(new{controller = "Home",action = "Index",id = "MyID" }); 
} 
```

### 生成一个特定的URL

之前我们使用`Html.ActionLink`生成URL或者Link,我们将显示选择一个指定的URL，首先在`RouteConfig.cs`文件中定义route

```js

```





