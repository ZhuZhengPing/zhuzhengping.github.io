---
layout : post
title : "javascript 滚动"
category : javascript
duoshuo: true
date : 2015-10-28

---

做网站时经常会用到一些滚动，这里记录一下以备以后会用到。
这里实现的思路是：使用`scrollTop`属性，通过设置滚动div的这个属性，来实现滚动的效果，
废话少说，下面是实现的代码

	// html
	<div class='container'>
		<div class="top" onclick="prev();"></div>
		<div class="scroll">
			<p>1百亿投资开启罗湖时代</p>
			<p>2百亿投资开启罗湖时代</p>
			<p>3百亿投资开启罗湖时代</p>
			<p>4百亿投资开启罗湖时代</p>
			<p>5百亿投资开启罗湖时代</p>
			<p>6百亿投资开启罗湖时代</p>
			<p>7百亿投资开启罗湖时代</p>
			<p>8百亿投资开启罗湖时代</p>
			<p>9百亿投资开启罗湖时代</p>
			<p>0百亿投资开启罗湖时代</p>
			<p>11百亿投资开启罗湖时代</p>
			<p>12百亿投资开启罗湖时代</p>
			<p>13百亿投资开启罗湖时代</p>
			<p>14百亿投资开启罗湖时代</p>
			<p>15百亿投资开启罗湖时代</p>
			<p>16百亿投资开启罗湖时代</p>
			<p>17百亿投资开启罗湖时代</p>
			<p>18百亿投资开启罗湖时代</p>
			<p>19百亿投资开启罗湖时代</p>
			<p>10百亿投资开启罗湖时代</p>
			<p>21百亿投资开启罗湖时代</p>
			<p>22百亿投资开启罗湖时代</p>
			<p>23百亿投资开启罗湖时代</p>
			<p>24百亿投资开启罗湖时代</p>
			<p>25百亿投资开启罗湖时代</p>
			<p>26百亿投资开启罗湖时代</p>
			<p>27百亿投资开启罗湖时代</p>
			<p>28百亿投资开启罗湖时代</p>
			<p>29百亿投资开启罗湖时代</p>
			<p>20百亿投资开启罗湖时代</p>
			<p>31百亿投资开启罗湖时代</p>
			<p>32百亿投资开启罗湖时代</p>
			<p>33百亿投资开启罗湖时代</p>
			<p>34百亿投资开启罗湖时代</p>
			<p>35百亿投资开启罗湖时代</p>
			<p>36百亿投资开启罗湖时代</p>
			<p>37百亿投资开启罗湖时代</p>
		</div>
		<div class="down" onclick="prev();"></div>
	</div>
	
这里写css样式，需要固定div的高度，才会出现滚动条，另外，如果不想出现滚动条的话，可以隐藏滚动条
实现的代码为：	`overflow:hidden;`

*特别注意，设置为滚动的div最好不要设置padding属性，因为如果这样的话，在IE下会出现一些意想不到的问题，最好在滚动div外部的div设置padding*

完整的css如下
	
	/*容器*/
	.container{
		position:relation;
		width:80%;
	}
	
	/*向上的样式*/
	.top{
		height:35px;
		position:absolute;
		top:0;
		z-index:99;
		width:100%;
		background:center url("../images/top.png") no-repeat #CCCCCC;
	}
	
	/*滚动容器样式*/
	.scroll {
		overflow:hidden;height:573px;
	}
	
	/*向下的样式,其实只是一个图片不同而已*/
	.down{
		height:35px;
		position:absolute;
		bottom:0;
		z-index:99;
		width:100%;
		background:center url("../images/down.png") no-repeat #CCCCCC;
	}

下面实现滚动的效果，使用`jquery`的事件，所以首先必须先引用`jquery`的事件，所以首先必须先引用`j

	// 初始化滚动的值
	var scrollTop = 0;
	
	//向下滚动
	function next() {
		
		// 计算需要滚动的高度
		// 需要滚动的高度 = div里面元素的个数 * 元素的高度 - 容器的高度
		// 为什么要减去容器的高度，是因为 只有超过容器高度的部门才需要滚动。
		var maxHeight = $('.scroll p').outerHeight() * $('.scroll p').size() - $('.container').height();
		
		// 累加滚动的高度
		scrollTop += $('.wuye_left_content').height();
		
		// 如果达到最大高度，不再累加
		if (scrollTop > maxHeight) {
			scrollTop = maxHeight;
		}
		$(".wuye_left_content").animate({ scrollTop: scrollTop }, 500);
	}
	
	// 向上滚动
	function prev() {
		// 计算向上滚动的高度
		scrollTop -= $('.wuye_left_content').height();
		
		if (scrollTop < 0) {
			scrollTop = 0;
		}
		$(".wuye_left_content").animate({ scrollTop: scrollTop }, 500);
	}

	