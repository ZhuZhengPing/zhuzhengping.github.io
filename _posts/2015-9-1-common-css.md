---
layout : post
title : "css通用样式"
category : css
duoshuo: true
date : 2015-9-1

---

今天加班等同事，发现好无聊的说，想到整理整理前些天写的样式，以后做页面的时候，说不定还会用到。

####banner样式

首先设置手机的自适应模式，每次找这个代码都得找半天，得记下来

	<meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,initial-scale=1.0" />

body样式，每个页面都要有的，其实都是大同小异

	html{
		height:100%;
	}
	body {
		margin:0;
		padding:0;
		font-size:100%;
		font-family: 'Lucida Sans', 'trebuchet MS', Arial, Helvetica;
		background-color:#F8F9FB;
		 -webkit-tap-highlight-color: rgba(0,0,0,0);
		/*background-color:#EBECEE;*/
	}

* PS：设置html 样式 height:100% 的作用是，必须先设置父元素的高度，如果不设置高度的话， div元素设置的height 百分比属性都无效，当然如果用px肯定还是有效的，但是很多情况下，手机布局的时候用px不是很好，所以这里还是先设置下比较好,-webkit-tap-highlight-color这个样式的作用是 点击事件不会出现元素的背景，特别是我们在点击图标的时候，如果对图片进行了处理以后，再点击的话，会出现图片原有的背景，有时候会破坏页面的布局。 *

作为一个手机版的页面，首先要做的肯定是做banner部分，这一部分大同小异，我现在是仿照QQ做的banner，样子还过得去，首先贴一下html代码

	<div id="banner">
        <a class="back" href="javascript:history.go(-1);">返回</a>
        <span id="title"></span>
        <span class="more_info" onclick="refresh();"></span>
    </div>
	
一般左边是一个返回图标，中间是一个标题，右边是一个刷新图标这种模式，当然右边也可以有多个图标，看自己的喜好，下面贴这个代码的css

	#banner{
		font-size:1.2rem;
		background-color:#18B4ED;
		line-height:2.3rem;
		height:2.3rem;
		border-bottom: 1px solid #bfbfbf;
		margin:0 auto;
		padding:.3rem;
		text-align:center;
		color:white;
	}
	#banner .more_info{
		display:inline-block;
		height:2.9rem;
		background:url("../images/icon-refresh.png") center no-repeat;
		background-size:3rem;
		width:2.9rem;
		position:absolute;
		right:0;
		top:0;
		padding-right:.5rem;
	}
	#banner .back{
		display:inline-block;
		height:2.9rem;
		line-height:2.9rem;
		text-indent:1.5rem;
		background:url("../images/icon-back.png") left center no-repeat;
		background-size:50%;
		position:absolute;
		top:0;
		left:0;
		color:white;
		font-size:1rem;
		text-decoration:none;
	}

####首页导航

	有时候，一个手机网站的导航样式基本上都是大同小异，一般都会以列表的样子展示，反正我碰到过很多次。下面是一些经常用到的网页导航。
	
	.contant{
		min-height:80%;
	}
	.contant ul{
		margin:0;
		padding:0;
		list-style:none;
		font-size:1.1rem;
		background-color:#EBECEE;
		clear:both;
	}
	.contant ul li{
		background-color:white;
		line-height:3rem;
		height:3rem;
		text-indent:1rem;
		margin-bottom:1px;
	}
	.contant ul li .right{
		position:absolute;
		color:#bfbfbf;
		font-size:1rem;

		width: 1.1rem;
		height: 1.1rem;
		border-radius: 50%;
		margin-top: .4rem;
		text-indent: 0;
		text-align: center;
		line-height:1.1rem;
		color:#FFEDC5;
		background-color:#18B4ED;
	}
	.contant ul li .left {
		margin-left:1rem;
	}
	.contant ul li:last-child{
		border:0;
	}
	.contant ul li:after{
		float:right;
		content: url("../images/icon-back-act.png");
		font-size:small;
		margin-right:1rem;
	}
	
#### 最后出现一个加载的图层

	.load{
		width:100%;
		height:100%;
		z-index:9996;
		text-align:center;
		vertical-align:middle;
		position:fixed;
		top:0;
		left:0;
		filter: alpha(Opacity=28);
		opacity:0.28;
		background:center no-repeat url("../images/load.gif") black;
		display:none;
	}

#### css 倾斜,只对区块有用

	transform:rotate(45deg);
	display:block;







	
	