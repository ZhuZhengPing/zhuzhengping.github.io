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

{% highlight c# %}
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
{% endhighlight %}


















