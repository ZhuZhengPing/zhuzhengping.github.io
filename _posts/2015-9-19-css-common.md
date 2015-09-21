---
layout : post
title : "常用的css样式"
category : css
duoshuo: true
date : 2015-9-1

---

有时候感觉自己记性太差了，一些经常用到的知识，也会经常忘记，所以现在试着记下一些防止再次忘记

####手机自适应

	<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,initial-scale=1.0" />

#### css 倾斜,只对区块有用

	transform:rotate(45deg);
	display:block;

#### 按钮按下无样式

    -webkit-tap-highlight-color: rgba(0,0,0,0);

#### 元素高度 = 元素高度， 不加上 padding

	box-sizing:border-box;
	
#### 搜索框样式
	
	// html
	<input type="search" id="txtSearch" placeholder="搜索" />
	
	// css
	-webkit-appearance:textfield;
	-moz-appearance:textfield;
	
#### div float 清除浮动

	.contant ul li:after{
		clear:both;
		display:block;
		content:"";
	}

#### css截取字符串

	overflow: hidden;
    white-space: nowrap;
    -o-text-overflow: ellipsis;
    text-overflow: ellipsis;




	
	