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

变量			|示例URL			|匹配
0				|/					|controller = Home  action = Index  
1				|Customer 			|controller = Customer  action = Index 





















