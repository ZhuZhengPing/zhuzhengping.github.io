---
layout: post
title:  "helper"
date:   2016-04-30 16:32:18 +0800
categories: mvc
tags: mvc model
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在这一章我们关注`helper`方法，你可以在整个mvc框架项目中运用







### 创建`inline helper`方法

```html
@model string

@{
    Layout = null;
}

@helper ListArrayItems(string[] items)
{     foreach (string str in items)
    {
    <b>@str </b>
    }
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <div>
        Here are the fruits: @ListArrayItems(ViewBag.Fruits)
    </div>
    <div>
        Here are the cities: @ListArrayItems(ViewBag.Cities)
    </div>
    <div>
        Here is the message:
        <p>@Model</p>
    </div>
</body>
</html> 
```

`inline helpers`和`c#`代码类似，在上面的例子中，我们定义了一个`ListArrayItems`，带有一个`string[]`参数，
虽然`inline helpers`像方法，但是它没有返回值

`inline helpers`语句需要`@`字符串前缀，下面的`helper`例子包含`html`标签

```html
@helper ListArrayItems(string[] items) { 
    <ul> 
        @foreach(string str in items) {             
			<li>@str</li>    
        } 
    </ul> 
}
```

结果如下图所示

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f40zfnv8ibj30g308idgl.jpg" style="width:100%" />

### 创建外部的`helper`方法

`inline helpers`虽然方便，但是如果太复杂，写在视图里面会很难阅读，另一种选择是创建一个外部`HTML`辅助方法，
它们就是`c#`的扩展方法，外部的`helper`方法应用非常广泛

```c#
public class CustomHelpers
{
	public static MvcHtmlString ListArrayItems(this HtmlHelper html, string[] list)
	{

		TagBuilder tag = new TagBuilder("ul");

		foreach (string str in list)
		{
			TagBuilder itemTag = new TagBuilder("li");
			itemTag.SetInnerText(str);
			tag.InnerHtml += itemTag.ToString();
		}

		return new MvcHtmlString(tag.ToString());
	}
}
```

`helper`方法和之前的`inline helper`拥有同样的功能，它带有一个`string`数组，并生成`ul`元素，
下面是属性介绍

属性			|描述
RouteCollection	|返回`application`的`routes`
ViewBag			|返回该`view`对应的`action`方法里面的`ViewBag`
ViewContext		|返回`ViewContext`实体，它包含`request`的详细信息

`ViewContext` 的一些有用的属性如下图

属性			|描述
Controller		|返回控制器处理的请求
HttpContext		|返回描述当前请求的`HttpContext`对象
IsChildAction 	|如果`view`调用的`helper`调用`child action`，返回`true`
RouteData		|为当前请求返回`routing data`
View			|返回被`helper`方法调用的实现`IView`的视图

下面是`TagBuilder`的一些属性

成员								|描述
InnerHtml							|一个属性,可以让你设置HTML元素的内容，分配给此属性的值不会被编码
SetInnerText(string)				|设置元素的文本值，`string`参数会设置编码确保安全
AddCssClass(string)					|给`html`添加`css`
MergeAttribute(string,string,bool)　|将一个属性添加到`HTML`元素。第一个参数是属性的名称,和第二个是价值。bool参数指定如果现有的属性相同的名称应该取代

返回的结果是`MvcHtmlString`对象，内容直接写到客户端

```c#
return new MvcHtmlString(tag.ToString());
```

### 使用自定义的外部`helper`方法

使用自定义的`helper`方法和`inline helper`有一点不同，下面创建`/Views/Home/Index.cshtml`

```html
@using MvcApplication2.Infrastructure

@{
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <div>
        Here are the fruits: @Html.ListArrayItems((string[])ViewBag.Fruits)
    </div>
    <div>
        Here are the cities: @Html.ListArrayItems((string[])ViewBag.Cities)
    </div>
    <div>
        Here is the message:
        <p>@Model</p>
    </div>
</body>
</html>
```

### 管理字符串编码`helper`方法

MVC框架通过自动编码努力保护你免受恶意数据攻击,以便它可以被添加到一个Web页面，你可以在我们的示例应用程序中看到一个这样的例子。

后台代码还是之前的`HomeController`

```c#
public class HomeController : Controller { 
	public ActionResult Index() { 
		ViewBag.Fruits = new string[] { "Apple", "Orange", "Pear" };             ViewBag.Cities = new string[] { "New York", "London", ViewBag.Cities = new string[] { "New York", "London", "Paris" };  
		string message = "This is an HTML element: <input>"; 
		return View((object)message); 
	} 
}
```

后台代码包含`html`标签，前台代码会直接显示出`html`标签

```html
<div>     
	Here is the message: 
    <p>This is an HTML element: &lt;input&gt;</p> 
</div> 
```

#### 重现错误 定义一个新的`helper`方法

```c#
public static class CustomHelpers
{
	public static MvcHtmlString ListArrayItems(this HtmlHelper html, string[] list)
	{
		TagBuilder tag = new TagBuilder("ul");
		
		foreach (string str in list)
		{
			TagBuilder itemTag = new TagBuilder("li");
			itemTag.SetInnerText(str);
			tag.InnerHtml += itemTag.ToString();
		}
		return new MvcHtmlString(tag.ToString());
	}

	public static MvcHtmlString DisplayMessage(this HtmlHelper html, string msg)
	{
		string result = String.Format("This is the message: <p>{0}</p>", msg);
		return new MvcHtmlString(result);
	}
}
```

我们使用`String.Format`生成`html`作为结果参数传递给`MvcHtmlString`，你可以看到前端
页面的修改

```html
@model string
@using MvcApplication2.Infrastructure

@{
    Layout = null;
}

<!DOCTYPE html>
<html>
<head>
    <meta name="viewport" content="width=device-width" />
    <title>Index</title>
</head>
<body>
    <p>This is the content from the view:</p>
    <div style="border: thin solid black; padding: 10px">
        Here is the message:
        <p>@Model</p>
    </div>

    <p>This is the content from the helper method:</p>
    <div style="border: thin solid black; padding: 10px">
        @Html.DisplayMessage(Model)
    </div>
</body>
</html>
```

*在`Index view`使用`DisplayMessage helper`*

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422m3swhoj309w090753.jpg" style="width:100%" />

### `encoding helper`方法内容

这里有好几种办法解决这个问题，最简单的办法是改变返回的类型，

```c#
public static string DisplayMessage(this HtmlHelper html, string msg)
{
	return String.Format("This is the message: <p>{0}</p>", msg); 
}
```

`Razor`会`encode helper`返回的内容，当你返回的是`html`标签时就会出现问题

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422tg6nh7j30i30e375t.jpg" style="width:100%" />

我们可以解决这个`input`元素的问题

```c#
public static MvcHtmlString DisplayMessage(this HtmlHelper html, string msg) { 
    string encodedMessage = html.Encode(msg); 
    string result = String.Format("This is the message: <p>{0}</p>", encodedMessage);     
	return new MvcHtmlString(result); 
}
```

`HtmlHelper`定义了一个`Encode`的方法，用来解决`string`类型的编码问题。

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f422tg6nh7j30i30e375t.jpg" style="width:100%" />

### 使用内置的`Form Helper`方法



#### Helper example

Helper    		|Example    						|Description
Display    		|Html.Display("FirstName")   		|Renders a read-only view of the specified model property, choosing an HTML element according to the property’s type and metadata 
DisplayFor 		|Html.DisplayFor(x => x.FirstName) 	|Strongly typed version of the previous helper
Editor     		|Html.Editor("FirstName") 			|Renders an editor for the specified model property, choosing an HTML element according to the property’s type and metadata 
EditorFor		|Html.EditorFor(x => x.FirstName) 	|Strongly typed version of the previous helper
Label 			|Html.Label("FirstName") 		  	|Renders an HTML `<label>` element referring to the specified model property 
LabelFor		|Html.LabelFor(x => x.FirstName)  	|Strongly typed version of the previous 
DisplayForModel	|Html.DisplayForModel()				|Renders a read-only view of the entire model object
EditorForModel	|Html.EditorForModel() 				|Renders editor elements for the entire model object
LabelForModel 	|Html.LabelForModel() 				|Renders an HTML <label> element referring to the

#### The Values of the `DataType` Enumeration 

Value			|Description 
DateTime 		|Displays a date and time (this is the default behavior for System.DateTime values)
Date 			|Displays the date portion of a DateTime 
Time 			|Displays the time portion of a DateTime
Text 			|Displays a single line of text 
PhoneNumber		|Displays a phone number 
MultilineText 	|Renders the value in a textarea element
Password 		|Displays the data so that individual characters are masked from view 
Url 			|Displays the data as a URL (using an HTML a element) 
EmailAddress	|Displays the data as an e-mail address (using an a element with a  mailto href) 

#### The Built-In MVC Framework View Templates

Value 			|Effect (Editor) 					|Effect (Display) 
Boolean			|Renders a checkbox for bool values. For nullable bool? values, a select element is created with options for True, False, and Not Set. 					|As for the editor helpers, but with the addition of the disabled attribute, which renders read-only HTML controls. 
Collection		|Renders the appropriate template for each of the elements in an IEnumerable  sequence. The items in the sequence do not have to be of the same type. 	|As for the editor helpers. 
Decimal 		|Renders a single-line textbox input  element and formats the data value to display two decimal places. |Renders the data value formatted to two decimal places. 
DateTime		|Renders an input element whose type attribute is datetime and which contains the complete date and time. |Renders the complete value of a DateTime variable. 
Date 			|Renders an input element whose type attribute is dateand that contains the date component (but not the time). |Renders the date component of a DateTime variable 
EmailAddress 	|Renders the value in a single-line textbox input element. |Renders a link using an HTML a element and an href attribute that is formatted as a mailto URL. 
HiddenInput		|Creates a hidden input element. |Renders the data value and creates a hidden input element. 
Html 			|Renders the value in a single-line textbox input element. |Renders a link using an HTML a element. 
MultilineText 	|Renders an HTML textarea element that contains the data value. |Renders the data value. 
Number			|Renders an input element whose type attribute is set to number. |Renders the data value 
Object			|See explanation after this table. |See explanation after this table. 
Password		|Renders the value in a single-line textbox input element so that the characters are not displayed but can be edited. |Renders the data value—the characters are not obscured. 
String 			|Renders the value in a single-line textbox input element. |Renders the data value. 
Text 			|Identical to the String template. |Identical to the String template
Tel 			|Renders an input element whose type attribute is set to tel. |Renders the data value 
Time 			|Renders an input element whose type attribute is time and which contains the time component (but not the date). |Renders the time component of a DateTime variable 

#### Creating a Custom Editor Template

>1. The template passed to the helper—for example, Html.EditorFor(m => m.SomeProperty, "MyTemplate") would lead to MyTemplate being used.
>2. Any template that is specified by metadata attributes, such as UIHint. 
>3. The template associated with any data type specified by metadata, such as the DataType attribute.
>4. Any template that corresponds to the.NET class name of the data type being processed.
>5. The built-in String template if the data type being processed is a simple type.
>6. Any template that corresponds to the base classes of the data type.
>7. 7.If the data type implements IEnumerable, then the built-in Collection template will be used.If all else fails, the Object template will be used—subject to the rule that scaffolding is not recursive. 

#### Creating a Generic Template







