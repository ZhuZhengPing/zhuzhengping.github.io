---
layout: post
title:  "model验证"
date:   2016-06-11 16:32:18 +0800
categories: mvc
tags: model
author: Zhengping Zhu
---

* content
{:toc}

## 概念

`model`验证是为了保护领域模型数据，拒绝不合理的数据





### 创建示例项目

```c#
public class Appointment
{
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	public DateTime Date { get; set; }

	public bool TermsAccepted { get; set; } 
}
```

我们创建`Home controller`

```c#
public class HomeController : Controller
{
	public ViewResult MakeBooking()
	{
		return View(new Appointment { Date = DateTime.Now });
	}

	[HttpPost]
	public ViewResult MakeBooking(Appointment appt)
	{

		// statements to store new Appointment in a 
		// repository would go here in a real project 
		return View("Completed", appt);
	}
}
```

为了完成示例项目，我们需要创建一些视图，下面创建`MakeBooking.cshtml`

```html
@model MvcApplication2.Models.Appointment

@{
    ViewBag.Title = "MakeBooking";
}
<h4>Book an Appointment</h4>
@using (Html.BeginForm())
{
    <p>Your name: @Html.EditorFor(m => m.ClientName)</p>
    <p>Appointment Date: @Html.EditorFor(m => m.Date)</p>
    <p>@Html.EditorFor(m => m.TermsAccepted) I accept the terms & conditions</p>
    <input type="submit" value="Make Booking" />
}
```

当这个表单提交，`MakeBooking action`在`Completed.cshtml`里面显示结果

```html
@model MvcApplication2.Models.Appointment

@{
    ViewBag.Title = "Completed";
}

<h4>Your appointment is confirmed</h4>
<p>Your name is: <b>@Html.DisplayFor(m => m.ClientName)</b></p>
<p>The date of your appointment is: <b>@Html.DisplayFor(m => m.Date)</b></p>
```

当我们点击提交按钮，会出现如下图所示的结果

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4tc21eq41j30es06mmya.jpg" style="width:100%" />

我们的系统接收用户提交的数据，为了保护完整的领域模型，我们需要做到下面几点

>* 用户必须提供一个名称
>* 用户必须提供正确的日期格式
>* 必须检查复选框

### 验证`model`

最直接的验证`model`的方式是在`action`方法里验证

```c#
[HttpPost]
public ViewResult MakeBooking(Appointment appt)
{

	if (string.IsNullOrEmpty(appt.ClientName))
	{
		ModelState.AddModelError("ClientName", "Please enter your name");
	}

	if (ModelState.IsValidField("Date") && DateTime.Now > appt.Date)
	{
		ModelState.AddModelError("Date", "Please enter a date in the future");
	}

	if (!appt.TermsAccepted)
	{
		ModelState.AddModelError("TermsAccepted", "You must accept the terms");
	}

	if (ModelState.IsValid)
	{
		// statements to store new Appointment in a 
		// repository would go here in a real project         
		return View("Completed", appt); 
	}
	else
	{
		return View();
	}
}
```

#### 呈现验证错误

我们在`~/Content/Site.css`文件里面添加错误样式

```css
.input-validation-error {     
	border: 1px solid #f00;     
	background-color: #fee; 
}
```

<img src="http://ww1.sinaimg.cn/mw690/006dag38gw1f4tcd36c18j30g3061wew.jpg" style="width:100%" />

### 显示验证信息

我们呈现了错误的验证文本框样式，但是我们还是没有让用户明白具体的错误是什么，我们将在`MakeBooking`视图里面显示具体的错误信息

```html
@model MvcApplication2.Models.Appointment

@{
    ViewBag.Title = "MakeBooking";
}
<link href="~/Content/Site.css" rel="stylesheet" />

<h4>Book an Appointment</h4>

@using (Html.BeginForm())
{
    @Html.ValidationSummary()
    <p>Your name: @Html.EditorFor(m => m.ClientName)</p>
    <p>Appointment Date: @Html.EditorFor(m => m.Date)</p>
    <p>@Html.EditorFor(m => m.TermsAccepted) I accept the terms & conditions</p>
    <input type="submit" value="Make Booking" />
}
```

`@Html.ValidationSummary()`显示具体的验证信息

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4tcldue5rj30g30e3q4i.jpg" style="width:80%" />

显示的错误信息如下

```html
<div class="validation-summary-errors" data-valmsg-summary="true"> 
    <ul> 
        <li>Please enter your name</li> 
        <li>Please enter a date in the future</li> 
        <li>You must accept the terms</li> 
    </ul> 
</div>
```

还有一些`ValidationSummary`的重载方法，下面显示一些常用的方法

重载方法名							|描述
Html.ValidationSummary() 			|生成所有的验证错误信息
Html.ValidationSummary(bool)	|bool参数为true,只显示错误信息，false显示所有验证信息
Html.ValidationSummary(string)		|在显示验证错误前，显示string数据
Html.ValidationSummary(bool, string)|在验证前显示string数据，如果bool参数为true,只显示验证错误的信息

假设星期一叫乔的客户不能预约，验证代码如下

```c#
[HttpPost]
public ViewResult MakeBooking(Appointment appt)
{
	if (string.IsNullOrEmpty(appt.ClientName))
	{
		ModelState.AddModelError("ClientName", "Please enter your name");
	}

	if (ModelState.IsValidField("Date") && DateTime.Now > appt.Date)
	{
		ModelState.AddModelError("Date", "Please enter a date in the future");
	}

	if (!appt.TermsAccepted)
	{
		ModelState.AddModelError("TermsAccepted", "You must accept the terms");
	}
	if (ModelState.IsValidField("ClientName") && ModelState.IsValidField("Date") && appt.ClientName == "Joe" && appt.Date.DayOfWeek == DayOfWeek.Monday)
	{
		ModelState.AddModelError("", "Joe cannot book appointments on Mondays");
	}

	if (ModelState.IsValid)
	{
		// statements to store new Appointment in a 
		// repository would go here in a real project         
		return View("Completed", appt); 
	}
	else
	{
		return View();
	}
}
```

如果验证失败，在`ModelState`中添加错误信息

```c#
ModelState.AddModelError("", "Joe cannot book appointments on Mondays");
```

我们更新`MakeBooking.cshtml`视图，使用`ValidationSummary`来显示错误信息

```html
@model MvcApplication2.Models.Appointment

@{
    ViewBag.Title = "MakeBooking";
}
<link href="~/Content/Site.css" rel="stylesheet" />

<h4>Book an Appointment</h4>

@using (Html.BeginForm())
{
    @Html.ValidationSummary(false)
    <p>Your name: @Html.EditorFor(m => m.ClientName)</p>
    <p>Appointment Date: @Html.EditorFor(m => m.Date)</p>
    <p>@Html.EditorFor(m => m.TermsAccepted) I accept the terms & conditions</p>
    <input type="submit" value="Make Booking" />
}
```

如果没有通过验证，则出现如下结果

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4tp6kws4cj30eb0bwdha.jpg" style="width:80%" />

### 显示`Property-Level`验证信息







