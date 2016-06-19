---
layout: post
title:  "bundles和显示方式"
date:   2016-06-18 16:32:18 +0800
categories: mvc
tags: bundles
author: Zhengping Zhu
---

* content
{:toc}

## 概念

Bundles用于打包CSS和javascript脚本文件，优化对它们的组织管理。显示模式则允许我们为不同的设备显示不同的视图。

### 默认Script库

MVC经常用到的Script库

名称							|描述
jquery-1.7.1.js 				|jquery的基本类库
jquery-ui-1.8.20.js				|jquery的UI类库，方便我们创建丰富的用户控件，基于jquery基本类库
jquery.mobile-1.1.0.js 			|用于移动设备UI控件的类库，在创建移动模板的工程时添加
jquery-validate.js				|用于客户端验证的类库
knockout-2.1.0.js 				|客户端的模型-视图-视图模式类库，在客户端将显示数据和没模型分开，可以认为是浏览器上的MVC
modernizr-2.5.3.js 				|用于检测浏览器对HTML5和CSS3的支持
jquery-1.7.1.intellisense.js	|用于Visual studio在编写jQuery代码时提供函数名称的提示
jquery.unobtrusive-ajax.js 		|用于MVC框架的unobtrusive Ajax功能
jquery.validate-vsdoc.js 		|用于Visual studio在编写jQuery验证函数时提示函数名称
jquery.validate.unobtrusive.js	|用于MVC的客户端验证，依赖jquery-validate.js 

一些脚本文件有常规和最小化两个版本，最小化版本删除注释剪短变量名以缩小文件尺寸，在功能上和正常版本一致。正常版本的jquery-1.7.1.js文件大小252K，而缩小版的jquery-1.7.1.min.js只有92K，如果网站每天数以百万计的访问量，带来的流量节省还是很巨大的。缩小版的脚本很难阅读，所以开发时我们使用正常版本的脚本库方便调试，发布时再切换为缩小版本。

### 打包脚本和风格

```c#
public class BundleConfig {
	public static void RegisterBundles(BundleCollection bundles) {
		bundles.Add(new ScriptBundle("~/bundles/jquery").Include("~/Scripts/jquery-{version}.js"));
		bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include("~/Scripts/jquery-ui-{version}.js"));
		bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include("~/Scripts/jquery.unobtrusive*","~/Scripts/jquery.validate*"));

		// Use the development version of Modernizr to develop with and learn from. Then, when you're
		// ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
		bundles.Add(new ScriptBundle("~/bundles/modernizr").Include("~/Scripts/modernizr-*"));
		bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));
		bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
		"~/Content/themes/base/jquery.ui.core.css",
		"~/Content/themes/base/jquery.ui.resizable.css",
		"~/Content/themes/base/jquery.ui.selectable.css",
		"~/Content/themes/base/jquery.ui.accordion.css",
		"~/Content/themes/base/jquery.ui.autocomplete.css",
		"~/Content/themes/base/jquery.ui.button.css",
		"~/Content/themes/base/jquery.ui.dialog.css",
		"~/Content/themes/base/jquery.ui.slider.css",
		"~/Content/themes/base/jquery.ui.tabs.css",
		"~/Content/themes/base/jquery.ui.datepicker.css",
		"~/Content/themes/base/jquery.ui.progressbar.css",
		"~/Content/themes/base/jquery.ui.theme.css"));
	}
}
```

ScriptBundle创建脚本包，StyleBundle创建CSS风格包，两者都使用Include包含一组文件。VS创建的默认包并不一定适合我们的需要，我们可以自行定义：

```c#
public class BundleConfig {
	public static void RegisterBundles(BundleCollection bundles) {

		bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/*.css"));

		bundles.Add(new ScriptBundle("~/bundles/clientfeaturesscripts")
			.Include("~/Scripts/jquery-{version}.js",
					"~/Scripts/jquery.validate.js",
					"~/Scripts/jquery.validate.unobtrusive.js",
					"~/Scripts/jquery.unobtrusive-ajax.js"));

	}
}

```

注意这里的“~/Scripts/jquery-{version}.js”，{version}匹配对应文件的任何版本并通过工程配置文件选择正常版本还是缩小版，具体是web.config中的debug设置，如果为true选择正常版本，false则是缩小版。需要注意的是我们不能把相同文件的不同版本号放在一起，比如“jquery-1.7.2.js”和“jquery-1.7.1.js”，两个版本号都会被发送给客户端反而造成混淆。

在布局文件中使用Scripts.Render()输出脚本包，Styles.Render()输出风格包：

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <title>@ViewBag.Title</title>
    @Styles.Render("~/Content/css")
</head>
<body>
    @RenderBody()

    @Scripts.Render("~/bundles/clientfeaturesscripts")

    @RenderSection("scripts", required: false)
</body>
</html>
```

生成的HTML文件会通过<link href="XXX" rel="stylesheet"/>包含所有包里的CSS文件，所有的脚本文件则通过<script src="XXX"></script>引用。

上面的例子中还使用“@RenderSection("scripts", required: false)”输出一个节，requried=false表示不是必须的，只有在视图文件中定义了这个节才会渲染，我们可以利用它来包含视图需要的额外脚本文件，比如我们在MakeBooking.cshtml中定义Scripts节来包含脚本文件：

```html
@model ClientFeatures.Models.Appointment

@{
    ViewBag.Title = "Make A Booking";
    AjaxOptions ajaxOpts = new AjaxOptions {
        OnSuccess = "processResponse"
    };
}
<h4>Book an Appointment</h4>
@section scripts {
    <script src="~/Scripts/Home/MakeBooking.js" type="text/javascript"></script>
}
```

使用这种可选节我们可以有选择的视图中包含视图仅需的脚本文件。

### 面向移动设备

人们越来越多的使用移动设备浏览网站，MVC应用也要考虑如何兼容这些移动设备以提供的更好的阅读体验。我们可以使用安卓、苹果手机访问开发测试网站，更方便的是从www.opera.com/developer/tools/mobile下载模仿移动版本的Opera浏览器，用它可以模仿不同设备设置不同屏幕大小的显示分辨率来测试。在MVC WEB应用中我们在普通的视图文件外可以添加面向移动设备的视图，视图文件名里在文件后缀名前加入“.Mobile”表示这是移动设备专用，比如“/Views/Home/MakeBooking.Mobile.cshtml”：

```html
@model ClientFeatures.Models.Appointment

@{
    ViewBag.Title = "Make A Booking";
    AjaxOptions ajaxOpts = new AjaxOptions {
        OnSuccess = "processResponse"
    };
}
<h4>This is the MOBILE View</h4>
@section scripts {
    <script src="~/Scripts/Home/MakeBooking.js" type="text/javascript"></script>
}

<div id="formDiv" class="visible">
    @using (Ajax.BeginForm(ajaxOpts)) {
        @Html.ValidationSummary(true)    
        <p>@Html.ValidationMessageFor(m => m.ClientName)</p>
        <p>Name:</p><p>@Html.EditorFor(m => m.ClientName)</p>
        <p>@Html.ValidationMessageFor(m => m.Date)</p>
        <p>Date:</p><p>@Html.EditorFor(m => m.Date)</p>
        <p>@Html.ValidationMessageFor(m => m.TermsAccepted)</p>
        <p>@Html.EditorFor(m => m.TermsAccepted) Terms & Conditions</p>    
        <input type="submit" value="Make Booking" />
    }
</div>
<div id="successDiv" class="hidden">
    <h4>Your appointment is confirmed</h4>
    <p>Your name is: <b id="successClientName"></b></p>
    <p>The date of your appointment is: <b id="successDate"></b></p>
    <button id="backButton">Back</button>
</div>
```

这里适当调整控件布局以更适合在移动设备上浏览，其他和桌面版基本一致。当我们从移动设备浏览时，MVC自动为我们应用移动版本的视图，MVC依赖C:\Windows\Microsoft.NET\Framework\v4.0.30319\Config\Browsers目录下的各种浏览器的描述文件检查浏览器版本，主要是匹配文件中定义的user agent特性，你会发现UC浏览器赫然在列。

### 自定义显示模式

上面的方法将所有的移动设备归为一类，如果我们还需要更细分具体是哪种移动设备，我们可以通过创建自定义显示模式来实现，这是在Application_start中注册的：

```c#
public class MvcApplication : System.Web.HttpApplication {
	protected void Application_Start() {

		DisplayModeProvider.Instance.Modes.Insert(0,
			new DefaultDisplayMode("OperaTablet") {
				ContextCondition = (context => context.Request.UserAgent.IndexOf("Opera Tablet", StringComparison.OrdinalIgnoreCase) >= 0)
			});

		AreaRegistration.RegisterAllAreas();
	}
}
```

这里通过比较请求的User agent是否包含“Operatablet”来标识OperaTablet显示模式，如果请求来自于这样的设备，MVC会查找包含OperaTablet的视图文件比如/Views/Home/MakeBooking.OperaTable.cshtml，这样我们就可以单为某种设备创建自定义的视图。

