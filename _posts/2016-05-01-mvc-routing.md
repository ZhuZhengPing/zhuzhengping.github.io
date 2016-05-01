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

###创建注册一个简单的路由







