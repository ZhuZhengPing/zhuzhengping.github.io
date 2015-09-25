---
layout : post
title : "css背景"
category : css
duoshuo: true
date : 2015-9-1

---

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
		// 1.border-box 背景图片以边框为基准定位
		// 2.padding-box 默认值，背景图片在padding区域定位
		// 3.content-box 背景图片在内容区域定位
		background-origin:border-box;
		// 可以定义背景图片的剪裁区域
		// 1.border-box 默认值 背景图片以边框为基准定位
		// 2.padding-box 剪裁超出padding-box的区域
		// 3.content-box 剪裁超出内容区域的背景图片
		background-clip:border-box;
		// 完整显示
		background:pink url('xx.png') no-repeat center/contain border-box padding-box;
		
	}
	




	
	