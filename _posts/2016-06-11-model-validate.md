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

我们更新`MakeBooking.cshtml`视图，显示`model-level`错误，并且把`property-level`错误显示在文本框

```html
@model MvcApplication2.Models.Appointment

@{
    ViewBag.Title = "MakeBooking";
}
<link href="~/Content/Site.css" rel="stylesheet" />

<h4>Book an Appointment</h4>

@using (Html.BeginForm())
{
    @Html.ValidationSummary(true)
    <p>@Html.ValidationMessageFor(m => m.ClientName)</p>
    <p>Your name: @Html.EditorFor(m => m.ClientName)</p>
    <p>@Html.ValidationMessageFor(m => m.Date)</p>
    <p>Appointment Date: @Html.EditorFor(m => m.Date)</p>
    <p>@Html.ValidationMessageFor(m => m.TermsAccepted)</p>     
    <p>@Html.EditorFor(m => m.TermsAccepted) I accept the terms & conditions</p>
    <input type="submit" value="Make Booking" />
}
```

`Html.ValidationMessageFor`显示单个的`model`错误信息

### 使用交替的验证技术

如果我们提供的的值不能转换为`model`属性，则提示下面的信息

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f4w7axm3pqj30df07xab0.jpg" style="width:100%" />

内置的`DefaultModelBinder`提供很多有用的方法

方法				|描述									|默认实现
DefaultModelBinder	|当`binder`尝试给`model`属性分配值时调用|应用模型元数据定义的验证规则,在`ModelState`中注册错误
SetProperty	|当`binder`提供值给指定的属性时调用|如果该属性不能保存`null`值，并且没有提供值，这时`ModelState`将注册`The <name> field is required`

### 使用`Metadata`指定验证规则

使用元数据的优势是我们的验证规则在整个应用程序执行任何绑定过程应用,不止一个`action`方法，验证属性通过内置的默认模型绑定器类`DefaultModelBinder`发现和实施，我们在`Appointment`类中演示

```c#
public class Appointment
{
	[Required]
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	[Required(ErrorMessage = "Please enter a date")] 
	public DateTime Date { get; set; }
	[Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms")] 

	public bool TermsAccepted { get; set; } 
}
```

我们使用了`Required`和`Range`验证属性，`Range`指定只有一个子集可以接受

属性				|示例							|描述
Compare				|[Compare("MyOtherProperty")]	|两个属性必须有相同的值
Range				|[Range(10, 20)] 				|属性提供的值在10和20之间
RegularExpression	|[RegularExpression("pattern")]	|正则表达式验证
Required			|[Required] 					|非空
StringLength		|[StringLength(10)]				|字符串长度，不能超过10，[StringLength(10, MinimumLength=2)]

上面的所有验证信息都能指定一个错误信息`ErrorMessage`

```c#
[Required(ErrorMessage="Please enter a date")]
```

我们仍然需要使用一些技巧,例如`TermsAccepted`属性

```c#
[Range(typeof(bool), "true", "true", ErrorMessage="You must accept the terms")]
```

### 创建自定义的验证属性

上面的`Range`属性验证使用有点怪，创建`ValidationAttribute`的派生类来实现自定义的验证属性，创建`MustBeTrueAttribute`类

```c#
public class MustBeTrueAttribute : ValidationAttribute  
{
	public override bool IsValid(object value)
	{
		return value is bool && (bool)value;
	}
}
```

验证逻辑非常简单，如果传过来的值为`bool`并且值为`true`，返回`true`表明验证通过，替换掉`Range`验证

```c#
public class Appointment
{
	[Required]
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	[Required(ErrorMessage = "Please enter a date")] 
	public DateTime Date { get; set; }
	[MustBeTrue(ErrorMessage = "You must accept the terms")] 
	public bool TermsAccepted { get; set; } 
}
```

### 从`Built-In`验证属性派生新`class`

我们可以从`built-in`属性派生新`class`,创建一个新的`FutureDateAttribute.cs`类

```c#
public class FutureDateAttribute : RequiredAttribute 
{
	public override bool IsValid(object value)
	{
		return base.IsValid(value) && ((DateTime)value) > DateTime.Now;
	}
}
```

当我们调用`IsValid`方法，自定义的属性将执行基本验证，包含`Required`属性

```c#
public class Appointment
{
	[Required]
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	[FutureDate(ErrorMessage = "Please enter a date in the future")]
	public DateTime Date { get; set; }
	[MustBeTrue(ErrorMessage = "You must accept the terms")] 
	public bool TermsAccepted { get; set; } 
}
```

### 创建`model`验证属性

到目前为止我们创建的自定义验证属性应用于单个模型属性，我们可以使用属性来验证整个模型，我们来创建`NoJoeOnMondaysAttribute`类

```c#
public class NoJoeOnMondaysAttribute : ValidationAttribute
{
	public NoJoeOnMondaysAttribute()
	{
		ErrorMessage = "Joe cannot book appointments on Mondays"; 
	}

	public override bool IsValid(object value)
	{
		Appointment app = value as Appointment;
		if (app == null || string.IsNullOrEmpty(app.ClientName) || app.Date == null)
		{
			// we don't have a model of the right type to validate, or we don't have 
			// the values for the ClientName and Date properties we require 
			return true;
		}
		else
		{
			return !(app.ClientName == "Joe" && app.Date.DayOfWeek == DayOfWeek.Monday);
		}
	}
}
```

当我们为`model`提供验证属性，我们验证属性检查以确保我们确实有个`Appointment `对象，并且`ClientName`和`Date`都不能为空.

```c#
[NoJoeOnMondays] 
public class Appointment
{
	[Required]
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	[FutureDate(ErrorMessage = "Please enter a date in the future")]
	public DateTime Date { get; set; }
	[MustBeTrue(ErrorMessage = "You must accept the terms")] 
	public bool TermsAccepted { get; set; } 
}
```

有了上述的验证，我们可以修改`MakeBooking action`

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
}
```

我们测试下`/Home/MakeBooking` URL,输入名字Joe，时间2/17/2014，可以看到如下结果

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f4xekp8ze2j30eu07qjsv.jpg" style="width:100%" />

### 定义`Self-Validating models`

我们实现`IValidatableObject`定义`self-validating model`

```c#
public class Appointment : IValidatableObject
{
	public string ClientName { get; set; }

	[DataType(DataType.Date)]
	public DateTime Date { get; set; }
	[MustBeTrue(ErrorMessage = "You must accept the terms")] 
	public bool TermsAccepted { get; set; }

	public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
	{
		List<ValidationResult> errors = new List<ValidationResult>();

		if (string.IsNullOrEmpty(ClientName))
		{
			errors.Add(new ValidationResult("Please enter your name"));
		}

		if (DateTime.Now > Date)
		{
			errors.Add(new ValidationResult("Please enter a date in the future"));
		}

		if (errors.Count == 0 && ClientName == "Joe" && Date.DayOfWeek == DayOfWeek.Monday)
		{
			errors.Add(new ValidationResult("Joe cannot book appointments on Mondays"));
		}

		if (!TermsAccepted)
		{
			errors.Add(new ValidationResult("You must accept the terms"));
		}

		return errors; 
	}
}
```

`model`实现`IValidatableObject`,这种方法的好处的灵活性相结合的动作方法的验证逻辑

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f4xf4tlz3hj30i50cqdhf.jpg" style="width:100%" />

### 执行客户端验证

客户端验证需要设置`Web.config`的两个地方

```c#
<appSettings> 
    <add key="ClientValidationEnabled" value="true"/>  
    <add key="UnobtrusiveJavaScriptEnabled" value="true"/>  
</appSettings>
```

并且必须引入下列3个js文件

>* /Scripts/ jquery-1.7.1.min.js
>* /Scripts/ jquery.validate.min.js
>* /Scripts/ jquery.validate.unobtrusive.min.js







