---
layout: post
title:  "Web语言"
date:   2017-10-09 16:32:18 +0800
categories: XHTML
tags: XHTML
author: Zhengping Zhu
---

* content
{:toc}

### a 标签 <b style="font-weight: normal;font-size: 17px;">(块元素/内联元素)</b>

`a标签`：超链接，`href`：指定链接的目标文件，`文字`：对于这个链接，浏览器会显示文本"文字"，单击这个文字时，用户将被带往"elixir.html"页面，`target="_blank"`: 在新窗口中打开链接，`title`：指定描述这个标签的文本，`id`：标签的唯一标识

```html
 <a target="_blank" id="koukou" title="提示" href='elixir.html'>文字</a>
```
 
#### 路径

>* 返回父文件夹时，路径加上`../`(从里面找出来)，例如`../elixir.html`
>* 进入子文件夹时，路径加上子文件夹名称(从外面找进克),例如`lounge/elixir.html`
 
 

 
 
 
 

### h1,h2,h3,h4,h5,h6 标签<b style="font-weight: normal;font-size: 17px;">(块元素)</b>
 
`h1-h6`:一级标题到六级标题

```html
<h1>一级标题</h1>
```

### p 标签 <b style="font-weight: normal;font-size: 17px;">(块元素)</b>

段落

```html
<p>段落</p>
```

### img 标签 <b style="font-weight: normal;font-size: 17px;">(内联元素)</b>

`img` ：图像，是一个空元素，`src`：指定在web页面上显示图像文件的位置，`alt`：指定描述这个图像的文本,如果图像未能显示，就会使用这个文本来取代它。`width`：告诉浏览器在页面中显示图像的宽度，`height`：高度
 
```html
<img src="http://wickedlysmarg.com/hfhtmlcss/trivia/pencil.png" alt="提示" width="48" height="100">
```
 
### q 标签 <b style="font-weight: normal;font-size: 17px;">(内联元素)</b>

每个引用都要用到一个`<q>`开始标记和一个`</q>`结束标记包围。生成双引号`""`。很短的引用。不需要换行，是内联元素。

```html
<!-- 生成"双引号" -->
<q>双引号</q>
```

### blockquote 标签 <b style="font-weight: normal;font-size: 17px;">(块元素)</b>

不会生成双引号。很长的引用。换行，是块元素。

```html
<blockquote>很长的引用</blockquote>
```

### 块元素 VS 内联元素

>* `块元素`：特力独行，显示时就好像前后各有一个换行。
>* `内联元素`：在文本流中总是行内出现。

### br 标签[块元素/内联元素]

换行

```html
<br>
```

### ol 标签 <b style="font-weight: normal;font-size: 17px;">(块元素)</b>

有序列表

```html
<ol>
	<li>第一行的内容</li>
	<li>第二行的内容</li>
	<li>第三行的内容</li>
</ol>
```

### ul 标签 <b style="font-weight: normal;font-size: 17px;">(块元素)</b>

无序列表

```html
<ul>
	<li>第一行的内容</li>
	<li>第二行的内容</li>
	<li>第三行的内容</li>
</ul>
```

### em 标签 <b style="font-weight: normal;font-size: 17px;">(内联元素)</b>

斜体强调

```html
<em>斜体强调</em>
```

### doctype

`doctype`：为浏览器指定这个页面的文本类型，`html`：页面中的根（第一个元素），`public`：html4.0标准是公共可用的
`-//w3c//dtd html 4.01//en"`：4.0版本，`http://www.w3.org/tr/html4/strict.dtd`：指向一个文件，标识这个特定的标准

```html
<!doctype html public "-//w3c//dtd html 4.01//en" "http://www.w3.org/tr/html4/strict.dtd">
```

下面给出的是 html5 doctype

```html
<!doctype html>
```

### meta 标签

`meta`：告诉浏览器关于页面的一些信息，只能加在`head`里面，`charset`：指定字符编码，`utf-8`：是unicode系列中的一个编码，这个系列还有很多编码，web页面中就是"utf-8"编码

```html
<head>
	<meta charset="utf-8">
</head>
```
































 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 










