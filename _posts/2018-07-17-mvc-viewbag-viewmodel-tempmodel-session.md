---
layout: post
title:  "MVC中的 ViewModel Vs ViewData Vs ViewBag Vs TempData Vs Session"
date:   2018-01-09 16:32:18 +0800
categories: mvc
tags: mvc
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在培训期间，程序员经常要求将数据从控制器传递到ASP.NET MVC中的视图，主要问题是何时使用ViewModel，ViewData，ViewBag，TempData或Session？它们之间有什么区别？要弄清楚它们的用法，我们需要了解这些对象的功能。然后我们将通过一些简单的例子来讨论它们的用法。最后，我们将看到ViewModel与ViewData和ViewBag对比TempData与Session的比较。













### ViewModel

ASP.NET MVC中的ViewModel是一个强类型类，它表示一个或多个数据模型或数据表中的数据，以呈现ASP.NET MVC中的特定视图。它可以从单个数据源中获取数据，如数据库中的表或多个表，或者只是一个数据或字符串。从本质上讲，ViewModel就像模型或数据与MVC中的视图之间的桥梁。

ViewModel在视图中呈现优化后的数据。单个ViewModel对象具有多个属性或其他子ViewModel。它将在控制器中填充并传递给视图模板然后在视图中呈现，ViewModel具有所有验证规则，范围等。因此，视图中的代码是可维护和扩展的。由于它们是强类型，因此它们在编译期间需要检查错误。

### 在MVC中的ViewModel

<img src="http://wx4.sinaimg.cn/mw690/006dag38gy1ftd7t8lg1qj30df0fy3yu.jpg" style="display:block;" />

### ViewData

ViewData是从System.Web.Mvc.ViewDataDictionary类派生的键值字典。数据在ViewData中存储为键值对。这用于在控制器和视图之间传递数据。在控制器中，ViewData填充数据并在视图中检索。 ViewData的生命周期仅存在于当前请求期间.即它在控制器中启动并在渲染视图后完成。

<img src="http://wx2.sinaimg.cn/mw690/006dag38gy1ftd7wis78kj30cb02bdfq.jpg" style="display:block;" />

#### C#中ViewData的示例

```c#
// Populating ViewData in Controller
public ActionResult Index()
{
    ViewData[&amp;quot;SomeKey&amp;quot;] = &amp;quot;Some Data&amp;quot;;
 
    return View();
}
 
// Retriving ViewData value in the view
@ViewData[&amp;quot;SomeKey&amp;quot;].ToString()
```

### ViewBag

ViewBag是一个动态对象，它是ViewData的包装器。它派生自System.Web.Mvc.ControllerBase.ViewBag属性。由于这是一个动态对象，因此它没有预先定义的任何属性。就像ViewData一样，ViewBag的生命周期在当前请求中开始和结束。即它在控制器中启动并在渲染视图后完成。通过添加所需的属性，可以在控制器中创建和填充ViewBag动态对象。使用相同的属性名称在视图中取到对应的数据。

<img src="http://wx2.sinaimg.cn/mw690/006dag38gy1ftd8018fgbj30cb02bgli.jpg" style="display:block;" />

#### C#中ViewBag的示例

```c#
// Populating ViewBag in Controller
public ActionResult Index()
{
    ViewBag.SomeProperty = &amp;quot;Some Value&amp;quot;;
 
    return View();
}
 
// Retriving ViewBag value in the view
@ViewBag.SomeProperty.ToString()
TempData
```

### TempData

TempData对象派生自System.Web.Mvc.TempDataDictionary类。它是一个未键入的键值对字典对象。TempData的生命周期从一个请求跨越到另一个请求。即仅当从一个操作方法重定向到另一个操作方法时调用，数据才会持续存在。通常，TempData对象用于存储少量数据，例如从一个操作方法到另一个操作方法的错误消息。

如果您想在第一次重定向后将数据保留在TempData中，那么你必须使用TempData.Keep（）方法来保留数据。

TempData将其内容存储在ASP.NET Session中，因此，在使用TempData时应该小心，就像会话一样，TempData会在webfarm（服务器集群）环境中使用它时产生问题。您可能需要将“会话状态模式”设置为“进程外”以使其正常工作。最好避免在webfarm中使用。

#### C#中TempData的示例 

```c#
// Populating TempData in Controller
public ActionResult Index()
{
    TempData[&amp;quot;ErrorMsg&amp;quot;] = &amp;quot;Some Error Here&amp;quot;;
 
    return RedirectToAction(&amp;quot;Error&amp;quot;);
}
 
// Retriving TempData value in redirected action method
public ActionResult Error() 
{     
    var msg = TempData[&amp;quot;ErrorMsg&amp;quot;];
    // Do Something
} 
```

### Session

Session也是从System.Web.SessionState类派生的键值对对象。会话用于跨控制器传递数据。会话的生命周期一直持续到使用超时或使用clear清除、removeall或abandon方法或用户关闭浏览器时为止，一种好的做法是，尽量减少会话的使用。如上面在TempData中所解释的，Session在webfarm环境中不可靠。解决方法是将会话状态模式设置为进程外。

#### C#中Session的示例

```c#
// Populating session
public ActionResult Index()
{
    Session[&amp;quot;SomeKey&amp;quot;] = &amp;quot;Some Value&amp;quot;;
 
    return RedirectToAction(&amp;quot;Error&amp;quot;);
}
 
// Retriving session value 
public ActionResult Error() 
{     
    var msg = Session[&amp;quot;SomeKey&amp;quot;];
    // Do Something
} 
```

### 比较：ViewModel Vs ViewData Vs ViewBag Vs TempData Vs Session

#					|ViewModel								|ViewData									|ViewBag							|TempData						|Session
1					|它是一个类，它特定用于渲染视图的模型	|是一个从ViewDataDictionary派生的键值字典	|是动态属性。它是ViewData的封装		|是一个从TempDataDictionary派生的键值字典|是一个从TempDataDictionary派生的键值字典。
2					|强类型类，所以不需要类型转换			|非强类型，复杂数据需要类型转换		|类型转换不是必须的	|非强类型，复杂数据需要类型转换	|非强类型，复杂数据需要类型转换并检查空值
3					|仅呈现视图所需的模型数据。				|在控制器和视图之间传递数据。		|在控制器和视图之间传递数据。|在请求之间传递数据。即将数据从一个控制器传递到另一个控制器。|用于在访问网站的用户期间存储少量数据
4					|生命周期仅适用于当前的请求。			|生命周期仅适用于当前的请求。 |生命周期仅适用于当前的请求。	|生命周期用于当前和后续请求。使用TempData.Keep（）方法可以将TempData的生命周期增加到第一次重定向之外。|会话的生命周期一直持续到服务器或用户强行销毁为止。
5					|在重定向时，ViewModel对象将被销毁。	|在重定向时，ViewData中的值变为Null。|在重定向时，ViewData中的值变为Null。|存储在TempData中的数据仅在重定向期间保留。|存储在Session中的数据在任意数量的重定向期间都会持续存在。
6					|提供编译时错误检查和智能提示。|不提供编译时错误检查。|不提供编译时错误检查。|不提供编译时错误检查。|不提供编译时错误检查。
7		|在webfarm（服务器集群）环境中使用ViewModel是安全的，因为它们不依赖于会话。|ViewData在webfarm环境中使用是安全的，因为它们不依赖于会话。|在webfarm环境中使用ViewBag是安全的，因为它们不依赖于会话。|TempData在具有服务器集群的webfarm中不可靠，因为TempData使用ASP.NET Session进行存储。解决方法是将会话状态模式设置为进程外，并使存储在TempData中的数据可序列化。|会话在Web场中不可靠，因为它们存储在服务器的内存中。在webfarm方案中，如果会话由服务器创建并且返回请求转到群集中的另一个服务器，则会话将丢失。解决方法是将会话状态模式设置为进程外
8|（a）在具有主子关系的表中显示数据。 （b）汇总和汇总的报告。 （c）在表格中分页数据。 （d）灵活，来自多个数据源的非常简单和高度复杂的数据。|（a）传递数据列表以呈现下拉列表。 （b）传递要在视图中呈现的少量数据。 （c）不适合涉及多个数据源的复杂数据。|（a）传递数据列表以呈现下拉列表。 （b）传递要在视图中呈现的少量数据。 （c）不适合涉及多个数据源的复杂数据。|（a）用于存储一次性消息，如错误消息和验证消息。 （b）用于将小数据从一个操作传递到另一个操作或一个控制器调用另一个控制器调用的方案。|（a）检查用户是否登录到网站。 （b）存储用户的许可信息。


### 结论

我的观点是：

>* 使用ViewModel而不是ViewData和ViewBag。由于ViewModel在Visual Studio IDE中提供了编译时错误检查和智能感知支持，因此代码将是干净的，并且不易出错。
>* 使用TempData进行错误处理。在捕获和异常或错误时，使用TempData将错误详细信息传递到错误页面，以显示正确的错误详细信息。
>* 使用Session检查用户的登录状态和权限级别。
>* 如果您的Web应用程序位于webfarm环境中，请尽量避免使用TempData和Session。











