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
		transition:all 2s ease-in-out 3s;
		//5.分3步到达
		transition:2s steps(3s,start);
		
	}

#### css3 动画

	div{
		width:50px;
		height:100px;
		background-color:green;
	}
	
	// 为一组关键帧起一个名字
	@keyframes mybox{
		// 动画第一帧状态
		from{width:50px;}
		// 最后一帧状态
		to{width:200px;}
	}
	
	// 兼容webkit内核的浏览器
	@-webkit-keyframes mybox{
		// 1. 使用 to from 来定义关键帧
		from{width:50px;}
		to{width:200px;}
		// 2. 使用百分比来定义关键帧 (使宽度和高度变化)
		0%{width:50px; height:100px;}
		50%{width:200px; height:100px;}
		100%{width:200px; height:200px;}
		// 3.位置移动
		0%{transform:translate(0,200px);}  // 向下移动200px
		50%{transform:translate(200px,0);} // 向右移动200px
		100%{transform:translate(200px,200px);} // 向右向下移动200px
		// 透明度动画
		0%,50%,100%{opacity:1;}
		25%,75%{0pacity:0;}
		// 旋转
		100%{transform:rotate(360deg);}
	}
	
	div:hover{
		-webkit-animation-name:mybox;
		-webkit-animation-duration:2s;
		// 动画曲线
		-webkit-animation-timing-function:ease-in-out;
		// 动画延迟
		-webkit-animation-delay:3s;
		// 动画次数 无穷次
		-webkit-animation-iteration-count:infinite;
		// 动画方向 (1.reverse 反方向 2.alternate 平滑运动 3.alternate-reverse)
		-webkit-animation-direction:reverse;
		// (1.backwards 动画播放之前，元素的位置和第一个关键帧的位置相同)
		// (2.forwards 停留在最后一个元素的地方)
		// (3.both 播放器和第一个帧相同，播放后和最后一个相同)
		-webkit-animation-fill-mode:backwards;
		// 动画控制状态 (1.running 2 paused)
		animation-play-state: 运行，停止
		
		// 写在一行
		-webkit-animation:mybox 1s ease 3s reverse infinite both paused;
		
		// 同时使用2组动画
		-webkit-animation:myball-1 5s linear infinite,myball-2 5s linear infinite;
	}

####css3 背景

	div{
		width:400px;
		height:400px;
		border:1px solid #000000;
		// 先定义的显示在前面，后定义的显示在后面
		background-image:url(bg1.png),url(bg2.png);
		background-position:top left; center right;
		background-repeat:no-repeat,no-repeat;
		//1. 定义宽度和高度
		background-size:250px 200px;
		//2. 定义百分比
		background-size:50% 50%;
		//3. 关键字(1.cover 刚好覆盖，保存比例 2.contain 缩小完全显示在div内部)
		background-size:cover;
		// border-box
		background-origin:
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




	
	