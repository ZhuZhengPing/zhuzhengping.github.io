---
layout : post
title : "css渐变"
category : css
duoshuo: true
date : 2015-9-25

---

####css 渐变

	div{
		width:200px;
		height:100px;
		// to bottom 渐变方向 red 第一种颜色 yellow 第二种颜色
		background:linear-gradient(to bottom,red,yellow);
	}

*使用关键字表示方向*

>left , right , top , bottom
>left top , right top , left bottom , right bottom

	background: linear-gradient(to left top,red,yellow);
	background: linear-gradient(to right bottom,red,yellow);

用数字表示角度

	background: linear-gradient(方向或角度,颜色1，颜色2,...)

1. 取值范围从0到360
2. 单位是deg(degree的简写)

> 0度表示渐变的方向是从下到上
> 90度表示渐变的方向是从左到右

	background:linear-gradient(10deg,red,yellow)
	background:linear-gradient(200deg,red,yellow)

颜色列表

1.两个或更多颜色的组合,用逗号分开
2.可以用学过的颜色表示法：关键字、十六进制、rgb、rgba、hsl、hsla

	background:linear-gradient(0deg,red,yellow,blue);
	
####径向渐变,

	div{
		width:200px;
		height:100px;
		background:radial-gradient(aqua,blue);
	}

>从元素中重心向四周放射性渐变，呈椭圆形
>默认情况下椭圆的大小自动匹配所在的元素的尺寸
>在参数中指定渐变的形状：circle(圆形)、ellipse(椭圆形，默认值)

	background:radial-gradient(ellipse,aqua,blue);
	background:radial-gradient(circle,aqua,blue);

####渐变的大小
	
	radial-gradient(形状 大小 at 位置,颜色1,颜色2,...)
	
>使用长度表示：如10px
>使用百分比表示: 如50%

	background:radial-gradient(20px,aqua,blue);

*径向渐变的渐变直径是20px*
	
	background:radial-gradient(80% 20%,aqua,blue);
	
*横轴的渐变直径是元素宽度的80%，纵轴的渐变直径是元素高度的20%*

####渐变开始的位置

>center(默认值)、left、right、top、bottom
>left top、right top、left bottom、right bottom
	
	background:radial-gradient(at left,aqua,blue);

*渐变中心从元素的左侧开始*

	background:radial-gradient(at right bottom,aqua,blue);
	
*渐变中心从元素的右下*

	background:radial-gradient(at right bottom,aqua,blue);

有立体效果的球型

	div{
		width:200px;
		height:200px;
		border-radius:50%;
		background:radial-gradient(at left top,aqua,blue);
	}
	