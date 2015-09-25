---
layout : post
title : "css颜色"
category : css
duoshuo: true
date : 2015-9-25

---
	
####HSL

H(Hue),表示色相

> 用一个色环表示不同的颜色
> 取值范围是0 - 360
> 0和360是红色
> 30是橙色
> 180是绿色
> 240是蓝色等等

S(Saturation), 表示饱和度

> 表示色彩的鲜艳程度
> 取值范围从0%到100%
> 饱和度越高,颜色越鲜艳
> 饱和度较低,颜色较暗淡
> 完全不饱和的颜色没有色相
> 如黑白之间的各种颜色

L(Lightness),表示亮度

>控制色彩的明暗变化
>取值范围是0% 到 100%
>取值越小，色彩越暗，越接近于黑色
>取值越大，颜色越亮，越接近于白色

	div{
		width:558px;
		height:300px;
		background-color:hsl(30,100%,50%);
	}
	
	// 还支持滤镜
	background-color:hsl(30,100%,50%,.5);