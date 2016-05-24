---
layout: post
title:  "模板化的helper方法"
date:   2016-05-23 16:32:18 +0800
categories: mvc
tags: linq
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在这个章节，我们论证模板化的`helper`方法，我们指定相应的属性，让MVC框架展示`Html`元素，这是一个更灵活的方式向用户显示数据





### 使用`Templated Helper Method`

首先我们要了解的是`Html.Editor`和`Html.EditorFor`，`Editor`方法带有一个`string`参数，对应该`view`的实体，`EditorFor`方法是强类型的，它允许你使用`lambda`表达式指定`model`的属性

*使用`Editor`和`EditorFor`*

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
}
<h2>CreatePerson</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{


    <div class="dataElem">
        <label>PersonId</label>        
         @Html.Editor("PersonId")
    </div>
    <div class="dataElem">
        <label>First Name</label>         
        @Html.Editor("FirstName")
    </div>
    <div class="dataElem">
        <label>Last Name</label>        
         @Html.EditorFor(m => m.LastName)
    </div>
    <div class="dataElem">
        <label>Role</label>        
         @Html.EditorFor(m => m.Role)
    </div>
    <div class="dataElem">
        <label>Birth Date</label>        
         @Html.EditorFor(m => m.BirthDate)
    </div>
    <input type="submit" value="Submit" />
} 
```

`Editor`和`EditorFor`创建的`HTML`元素都是相同的，唯一不同的地方是指定属性的`editor`创建元素，可以看看下面创建出来的示例

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f45jrz0yy5j30dr07umy0.jpg" style="width:100%" />

*MVC `Templated HTML Helpers`*

Helper			|Example							|Description
Display			|Html.Display("FirstName")			|根据`model`的属性创建一个`read-only`的值
DisplayFor		|Html.DisplayFor(x => x.FirstName) 	|`Display`的强类型版本
Editor			|Html.Editor("FirstName") 			|根据`model`的属性创建`editor`元素
EditorFor		|Html.EditorFor(x => x.FirstName)	|`Editor`的强类型版本
Label			|Html.Label("FirstName") 			|根据`model`的属性创建`<label>`元素
LabelFor		|Html.LabelFor(x => x.FirstName)	|`Label`的强类型版本

### 生成`Label`和`Display`元素

为了显示其他的`helper`方法，我们将添加新的`controller`和`view`来做示例

```c#
public class HomeController : Controller
    {

        public ActionResult CreatePerson()
        {
            return View(new Person { IsApproved = true }); 
        }
        [HttpPost]
        public ActionResult CreatePerson(Person person)
        {
            return View("DisplayPerson", person); 
        }
	}
}
```

我们在` /Views/Home`下面创建了一个`DisplayPerson.cshtml`

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "DisplayPerson";
    Layout = "~/Views/Shared/_layout.cshtml";
}

<h2>DisplayPerson</h2>
<div class="dataElem">
    @Html.Label("PersonId")
    @Html.Display("PersonId")
</div>
<div class="dataElem">
    @Html.Label("FirstName")
    @Html.Display("FirstName")
</div>
<div class="dataElem">
    @Html.LabelFor(m => m.LastName)
    @Html.DisplayFor(m => m.LastName)
</div>
<div class="dataElem">
    @Html.LabelFor(m => m.Role)
    @Html.DisplayFor(m => m.Role)
</div>
<div class="dataElem">
    @Html.LabelFor(m => m.BirthDate)
    @Html.DisplayFor(m => m.BirthDate)
</div> 
```

当我们在`/Home/CreatePerson`里面点`submit`按钮，会跳转到`DisplayPerson`页面，如下图显示

<img src="http://ww2.sinaimg.cn/mw690/006dag38gw1f45n8ek3dsj30gp091aat.jpg" style="width:100%" />

你可以看到输出的`Html`元素

```html
<!DOCTYPE html> 
<html> 
<head> 
    <meta charset="utf-8" /> 
    <meta name="viewport" content="width=device-width" /> 
    <title>DisplayPerson</title> 
    <link href="/Content/Site.css" rel="stylesheet"/> 
    <style type="text/css"> 
        label { display: inline-block; width: 100px;} 
        .dataElem { margin: 5px;} 
    </style> 
</head> 
<body> 
     
<h2>DisplayPerson</h2> 
<div class="dataElem">     
	<label for="PersonId">PersonId</label> 100 
</div> 
<div class="dataElem">     
	<label for="FirstName">FirstName</label> Adam 
</div> 
<div class="dataElem">     
	<label for="LastName">LastName</label> Freeman 
</div> 
<div class="dataElem">     
	<label for="Role">Role</label> Admin 
</div>     
<div class="dataElem">     
	<label for="BirthDate">BirthDate</label> 01/01/0001 00:00:00 
</div>  
</body> 
</html>
```

### 使用整体的`Model Template Helpers`

我们已经使用`templated helpers`根据单个属性生成元素，MVC框架也可以使用`helpers`生成`entity`对象

Helper				|示例					|描述
DisplayForModel		|Html.DisplayForModel()	|`model`全部生成`read-only`的值
EditorForModel		|Html.EditorForModel()	|`model`全部生成`editor`元素
LabelForModel		|Html.LabelForModel()	|`model`全部生成`label`元素

下面我们可以使用`LabelForModel`和`EditorForModel`创建简单的`CreatePerson.cshtml`

```html
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
    Html.EnableClientValidation(false); 
}
<h2>CreatePerson: @Html.LabelForModel()</h2>

@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{
    @Html.EditorForModel()

    <input type="submit" value="Submit" />
} 
```

你可以看到下图显示的结果

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f45nstet7zj30i30hmdgv.jpg" style="width:50%" />

下面是生成的`html`的例子

```html
<div class="editor-label"> 
    <label for="FirstName">FirstName</label> 
</div> 
<div class="editor-field"> 
    <input class="text-box single-line" id="FirstName" name="FirstName" type="text" value="" />
</div> 
```

使用`Model Metadata`