---
layout: post
title:  "CSS入门"
date:   2017-12-22 16:32:18 +0800
categories: XHTML
tags: css
author: Zhengping Zhu
---

* content
{:toc}

### 所有P标签背景颜色为红色

```css
p{
	background-color:red;
}
```























#### 灰色实线边框(solid)

```css
p{
	// 所有边框为灰色实线
	border:1px solid gray;
	
	// 下边框
	border-bottom:1px solid red;
	
	// 上边框
	border-top:1px solid red;
	
	// 左边框
	border-left:1px solid red;
	
	// 右边框
	border-right:1px solid red;
}
```

#### CSS放入HTML

```css
<!-- 嵌套在页面里面的CSS样式 -->
<style>
	p{
		// P标签里面的文字颜色
		color:maroon;
	}
</style>

<!-- 引用外部的CSS样式 -->
<link type="text/css" rel="stylesheet" href="lounge.css">
```

#### 字体和字体颜色

```css
h1{
	// 字体为宋体
	font-family:'宋体';
	// 字体颜色为灰色
	color:gray;
}
```

#### 样式沿用到多个选择器上

```css
h1,h2{
	// h1 和 h2 标签的文字都是灰色
	color:gray;
}
```

#### 创建一个类选择器

```css
.greentea{
	color:green;
}
```

使用 `class="greentea"` 来引用这个类选择器

#### 创建一个ID选择器

```css
#koukou{
	color:red;
}
```

`id="koukou"` 就能使用这个#koukou选择器

#### 字体粗细

```css
p{
	// 字体加粗
	font-weight:bold;
}
```

#### 文字对齐

```css
p{
	// right:右对齐，left:左对齐，center:居中
	text-align:right;
}
```

#### 字体缩进

```css
p{
	// 字体缩进2像素
	letter-spacing:2px;
}
```

#### 元素与边框的距离（内边距）

```css
p{
	// 左边距
	padding-left:2px;
	
	// 右边距
	padding-right:2px;
	
	// 上边距
	padding-top:2px;
	
	// 下边距
	padding-bottom:2px;
}

#### 项目列表样式

```css
ul{
	// 清除项目列表默认样式
	list-style:none;
}
```

#### 背景图片

```css
p{
	background-image:url('koukou.png');
}
```

#### 字体风格(斜体)

```css
p{
	// 字体为斜体
	font-style:italic;
}
```








