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
	img:hover{
		transform:rotate(45deg);
		
		// 也可以向右向下移动,向右向下移动600像素
		transform:translate(600px,600px);
		
		background:green;
		display:block;
	}
	// 2秒内完成旋转 transition参数：过度属性，例如可以是transform
	img{
		transition: transform 2s
		//1.也可以这样, 旋转2秒，背景转换3秒
		transition: transform 2s,background 3s;
		//2.全部5秒完成
		transition: all 5s;
		//3.塞北尔曲线
		 transition:2s cubic-bezier(0.6,0.1,0.1,0.7);
		//4.第四个参数,匀速运动，还有 ease-out,ease-in,ease-in-out
		transition:2s linear;
		//5.分3步到达
		transition:2s steps(3s,start);
	}

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




	
	