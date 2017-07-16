---
layout: post
title:  "模板化的helper方法"
date:   2016-05-23 16:32:18 +0800
categories: mvc
tags: mvc linq
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在这个章节，我们论证模板化的 helper 方法，我们指定相应的属性，让MVC框架展示 Html 元素，这是一个更灵活的方式向用户显示数据





### 使用 Templated Helper Method 

首先我们要了解的是 Html.Editor 和 Html.EditorFor ， Editor 方法带有一个 string 参数，对应该 view 的实体， EditorFor 方法是强类型的，它允许你使用 lambda 表达式指定 model 的属性

*使用 Editor 和 EditorFor *

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

 Editor 和 EditorFor 创建的 HTML 元素都是相同的，唯一不同的地方是指定属性的 editor 创建元素，可以看看下面创建出来的示例

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f45jrz0yy5j30dr07umy0.jpg" style="width:100%" />

*MVC  Templated HTML Helpers *

Helper			|Example							|Description
Display			|Html.Display("FirstName")			|根据 model 的属性创建一个 read-only 的值
DisplayFor		|Html.DisplayFor(x => x.FirstName) 	| Display 的强类型版本
Editor			|Html.Editor("FirstName") 			|根据 model 的属性创建 editor 元素
EditorFor		|Html.EditorFor(x => x.FirstName)	| Editor 的强类型版本
Label			|Html.Label("FirstName") 			|根据 model 的属性创建 <label> 元素
LabelFor		|Html.LabelFor(x => x.FirstName)	| Label 的强类型版本

### 生成 Label 和 Display 元素

为了显示其他的 helper 方法，我们将添加新的 controller 和 view 来做示例

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
```

我们在  /Views/Home 下面创建了一个 DisplayPerson.cshtml 

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

当我们在 /Home/CreatePerson 里面点 submit 按钮，会跳转到 DisplayPerson 页面，如下图显示

<img src="http://ww2.sinaimg.cn/mw690/006dag38gw1f45n8ek3dsj30gp091aat.jpg" style="width:100%" />

你可以看到输出的 Html 元素

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

### 使用整体的 Model Template Helpers 

我们已经使用 templated helpers 根据单个属性生成元素，MVC框架也可以使用 helpers 生成 entity 对象

Helper				|示例					|描述
DisplayForModel		|Html.DisplayForModel()	| model 全部生成 read-only 的值
EditorForModel		|Html.EditorForModel()	| model 全部生成 editor 元素
LabelForModel		|Html.LabelForModel()	| model 全部生成 label 元素

下面我们可以使用 LabelForModel 和 EditorForModel 创建简单的 CreatePerson.cshtml 

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

下面是生成的 html 的例子

```html
<div class="editor-label"> 
    <label for="FirstName">FirstName</label> 
</div> 
<div class="editor-field"> 
    <input class="text-box single-line" id="FirstName" name="FirstName" type="text" value="" />
</div> 
```

使用 Model Metadata 控制 editing 显示隐藏

```c#
public class Person
{
	[HiddenInput] 
	public int PersonId { get; set; }        
	public string FirstName { get; set; }      
	public string LastName { get; set; }      
	public DateTime BirthDate { get; set; }       
	public Address HomeAddress { get; set; }      
	public bool IsApproved { get; set; }         
	public Role Role { get; set; } 
}
```

当使用了 Html.EditorFor 或者 Html.EditorForModel ， view 会显示 read-only 模式，如下图

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f46op27idwj308205274l.jpg" style="width:50%" />

 PersonId 属性显示了，可是不能编辑，这个属性生成的 html 如下

```html
<div class="editor-field"> 
    0 
    <input id="PersonId" name="PersonId" type="hidden" value="0" />  
</div>
```

 helper 还包含一个隐藏 input 元素属性

```c#
[HiddenInput(DisplayValue=false)]     
public int PersonId { get; set; }
```

当重新运行的时候， PersonId 属性所对应的文本框隐藏了，生成的 html 代码如下

```html
<input id="PersonId" name="PersonId" type="hidden" value="1" />
```

如果你想一个属性，不生成 html ，你可以使用 ScaffoldColumn 属性

```c#
[ScaffoldColumn(false)] 
public int PersonId { get; set; }
```

### 使用 Labels helper 

默认的， Label , LabelFor , LabelForModel 使用属性的名称来生成 label 元素

```html
<label for="BirthDate">BirthDate</label>
```

 model 属性名称经常不是我们想要显示给用户的名称，这样的话，我们可以在 System.ComponentModel.DataAnnotations 命名空间下使用 DisplayName 

### 使用 Metadata 

我们可以使用 metadata 提供 model 属性的说明，在下面的示例中，处理 BirthDate 属性，让它显示成日期格式，我们在 model 属性上加上 DataType ，表示其日期格式

```c#
[Display(Name = "Birth Date")] 
[DataType(DataType.Date)]     
public DateTime BirthDate { get; set; } 
```

* DataType 值*

Value			|描述
DateTime		|显示日期和时间
Date			|显示日期
Time			|显示时间
Text			|显示单行文本
PhoneNumber		|显示电话格式
MultilineText	|显示一个 textarea 元素
Password		|显示密码文本框
Url				|显示URL
EmailAddress	|显示 e-mail 地址

### 使用 Metadata  去选择显示模板

 templated helpers 使用显示模板来生成 html ,可以使用 UIHint 去指定我们想要生成的 html 

```c#
[Display(Name="First")] 
[UIHint("MultilineText")]     
public string FirstName { get; set; } 
```

我们指定了 MultilineText 模板，它将为 FirstName 生成一个 textarea 元素

*使用MVC框架内置的模板*

Value			|文本框						|显示的值
Boolean			|生成一个 checkbox 			|生成只读的 checkbox 
Collection		|为 IEnumerable 接口的每个元素呈现适应的模板，这个集合的每个元素不需要相同类型|类似于 editor helper 
Decimal			|显示一个单行文本框，文本框内容格式化成两位小数|显示有两位小数
DateTime		|显示一个日期格式的文本框，并且带有日期和时间|显示 DateTime 类型的值
Date			|显示一个日期格式的文本框，并且只有日期|显示日期
EmailAddress	|显示单行文本框元素|显示一个 a 标签，有 href 属性，并且是 mailto Url的格式
HiddenInput		|创建一个类型为 hidden 的文本框|显示值并且创建 hidden 文本框
Html			|显示单行文本框|显示一个 a 标签的超链接
MultilineText	|显示 textarea 多行文本框|显示对应的数据
Number			|显示类型为 number 的文本框|显示对应的数据
Object			|查看接下来的说明|查看接下来的说明
Password		|生成密码框	|显示相应的数据
String			|生成单行文本框|显示相应的数据
Text			|生成单行文本框|显示相应的数据
Tel				|生成 type 为 tel 的文本框|显示相应的数据
Time			|生成 type 为 Time 的文本框|显示 Time 数据
Url				|生成单行文本框|生成 a 标签的超链接， href 属性设置属性的数据

 Object 模板是一个特例，它使用 scaffolding helpers 根据 model 的属性为 view 生成 html ，这种模板检查每一个对象的属性和属性类型来选择最合适的模板， Object 模板带有 metadata ，例如 UIHint 和 DataType 属性

### 为 class 提供 metadata 

不是每一次都必须给 model class 提供 metadata ，通常是当模型自动生成，就像 ORM 工具例如 entity framework 

*一个部分的 class *

```c#
[DisplayName("New Person")]
[MetadataType(typeof(PersonMetaData))]
public partial class Person
{
	[ScaffoldColumn(false)]
	public int PersonId { get; set; }
	[Display(Name = "First")]
	[UIHint("MultilineText")]
	public string FirstName { get; set; }
	[Display(Name = "Last")]
	[DataType(DataType.Url)]
	public string LastName { get; set; }
	[DataType(DataType.Date)]
	public DateTime BirthDate { get; set; }
	public Address HomeAddress { get; set; }
	[Display(Name = "Approved")]
	public bool IsApproved { get; set; }
	public Role Role { get; set; }
}
```

我们通过 metadata 属性告诉MVC框架 buddy class ，它带有 buddy class 作为参数， buddy classes 必须是相同的 namespace ，必须是 partial class 

*定义 buddy class *

```c#
[DisplayName("New Person")]
 public partial class PersonMetaData
 {
	 [HiddenInput(DisplayValue = false)]
	 public int PersonId { get; set; }
	 [Display(Name = "First")]
	 public string FirstName { get; set; }
	 [Display(Name = "Last")]
	 public string LastName { get; set; }
	 [Display(Name = "Birth Date")]
	 [DataType(DataType.Date)]
	 public DateTime BirthDate { get; set; }
	 [Display(Name = "Approved")]
	 public bool IsApproved { get; set; }
 }
```

 buddy class 只需要包含我们需要提供 metadata 的属性，我们不需要重复所有 Person 的属性

### 使用复杂类型属性

你可能注意到， Person class 里 HomeAddress 属性没有显示出来，这是因为 Object 只在简单类型模板操作，这些类型能使用 GetConverter 从 string 值解析出来， GetConverter 属于 System.ComponentModel.TypeDescriptor ，这些类型包括 int,bool,double 和许多 c# 类型例如 guid 和 datetime ，

 scaffolding helpers 不递归，如果处理一个对象， scaffolding helpers 模板只会在简单类型的时候并且忽略复杂类型的时候生成 html ，经管它可能不方便，但是是一个明智的抉择，MVC框架不知道如何创建我们的模型对象，并且如果 Object 模板递归，然后我们可以很容易地引发我们的ORM延迟加载特性,这将使我们阅读和渲染每个对象的底层数据库，如果我们想为一个复制的属性生成 html ，我们必须显式地通过一个单独的调用一个 templated helper 方法

*处理复杂的属性类型*

```c#
@model MvcApplication2.Models.Person

@{
    ViewBag.Title = "CreatePerson";
    Layout = "~/views/shared/_layout.cshtml";
    Html.EnableClientValidation(false); 
}
<h2>CreatePerson: @Html.LabelForModel()</h2>
@using (Html.BeginRouteForm("FormRoute", new { }, FormMethod.Post, new { @class = "personClass", data_formType = "person" }))
{
    <div class="column">
        @Html.EditorForModel()
    </div>
    <div class="column">
        @Html.EditorFor(m => m.HomeAddress)
    </div>
    <input type="submit" value="Submit" />
} 
```

显示结果如图所示

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f47zhiij60j30mz0em768.jpg" style="width:100%" />

### 自定义 view helper 模板

为了显示自定义模板，我们为 Person 的 role 属性创建一个自定义模板，这个属性类型是一个枚举值类型，MVC框架会在 /Views/Shared/EditorTemplates 下面找模板

*Role.cshtml 文件内容*

```html
@model HelperMethods.Models.Role 
@Html.DropDownListFor(m => m,  
    new SelectList(Enum.GetNames(Model.GetType()),          Model.ToString())) 
```

当我们允许程序的时候， /Views/Shared/EditorTemplates 将被使用，你可以看到 Role 属性变成下拉框

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f48o32qstzj30d204taaa.jpg" style="width:100%" />

 Role.cshtml 可以被调用，是因为MVC框架会为一个 c# 类型查找自定义模板

>1. 模板通过 helper ，例如 Html.EditorFor(m => m.SomeProperty, "MyTemplate")  ， MyTemplate 模板会调用
>2. 指定了 metadata 属性，例如 UIHint 
>3. 模板与指定了 metadata 的类型有关联，例如 DataType 属性
>4. 符合 class 的 data type 名称的模板将被执行
>5. 内置的 String 模板，如果 data type 是一个简单类型
>6. 任何对应 base classes 的 data type 的模板
>7. 如果 data type 实现了 IEnumerable ，其内置的 collection 模板将被使用，如果其它都不是， Object 模板将被使用

### 创建泛型的模板

我们并不仅限于创建特定的模板，还可以创建适用于所有枚举创建一个模板,然后使用 UIHint 属性指定这个模板选择，如果你看看模板搜索序列“理解模板搜索顺序”栏，你会发现模板使用 UIHint 属性优先于特定类型，为了示例泛型模板怎么工作的，我们在 /Views/Shared/EditorTemplete 文件夹

```html
@model Enum 

@Html.DropDownListFor(m => m, Enum.GetValues(Model.GetType())
    .Cast<Enum>()
    .Select(m =>
    {
        string enumVal = Enum.GetName(Model.GetType(), m);
        return new SelectListItem()
        {
            Selected = (Model.ToString() == enumVal),
            Text = enumVal,
            Value = enumVal
        };
    }))
```

这个模板是为 Enum 服务的，可以提供一个 UIHint 属性，我们的示例定义了一个 metadata buddy class ，所以为 PersonMetadata class 提供这个属性，

```c#
public partial class Person
{
	[UIHint("Enum")] 
	public Role Role { get; set; }
}
```

### 替换内置的模板

如果我们创建的自定义模板和系统内置的模板有相同的名称，MVC框架优先使用自定义模板，我们在 /Views/Shared/EditorTemplates 文件夹下面创建了
 Boolean.cshtml 文件，替换了内置的 Boolean 模板

```html
@model bool?

@if (ViewData.ModelMetadata.IsNullableValueType && Model == null) {
    @:(True) (False) <b>(Not Set)</b>
} else if (Model.Value) {
    @:<b>(True)</b> (False) (Not Set)
} else {
    @:(True) <b>(False)</b> (Not Set)
} 
```

运行后的结果如下图所示

<img src="http://ww1.sinaimg.cn/mw690/006dag38gw1f494iz6fi6j30k504pglv.jpg" style="width:100%" />





