---
layout : post
title : "jquery学习"
category : jquery
duoshuo: true
date : 2015-5-18

---

####选择器
	
	 $("li:first"); // 获得第一个元素
	 $("li:last");  // 获得最后一个元素
	 $("ul li:first li:last"); // 第一个的最后一个
	 $("li:not(.red)");   // 非red样式
	 $("li:even");     // 偶数  0 2 4 6;
	 $("li:old");		// 奇数 1 3 5 ;
	 $("li:eq(2)");		// 第3个
	 $("li:gt(2)");    // 大于2
	 $("li:lt(2)");    // 小于2
	 $(":header");     // h1,h2,h3 
	 $("input").get(0).focus();
	 $("input:focus");      // 当前关注，加载可用
	 $("li").first();	//第一个
	 $("li").last();	//最后一个
	 $("li").not(".red"); // 非
	 $("li").eq(0);       //第一个
	 $('div:contains("ycku.com")') // 文本含有ycku.com
	 $('div:empty');  //不能包含子元素
	 $("ul:has(.red)");  // ul 子元素包含class
	 $("div:parent");    // 有子元素的 
	 $("ul").has(".red");  // ul被选中
	 $("li").parent();  //父节点
	 $("li").parents();  //祖先节点
	 $('p:visible')   // 显示的元素
	 $('p:hidden');   //隐藏的元素
	 $("li:first-child"); // 先返回到父元素，然后找到子元素
	 $("li:last-child");   // 子元素包含class
	 $("li:only-child");   // 只有一个子元素
	 $("li:nth-child(even)");     // 索引值从1开始 . 2 4 6
	 $("li:nth-child(odd)");	  // 1 3 5-18
	 $("li:nth-child(1)");        // 第一个
	 $("li:nth-child(3n)");	      // 每隔3倍显示  3 6 9
	 $("li:nth-child(3n+1)");     // 1 4 7
	 
####jquery 常用方法

	$('.red').is('li');			  // 判断是否为li
	$('.red').is('div');  	      
	$('.red').is($('li'));		
	$('.red').is($('li').get(2)); 	
	$('.red').is($('li').eq(2));
	$(".red").is(function(){
		// 注意，必须使用$(this)来表示判断的元素，否则，不管function里面返回的是true或者false,就和判断的无
		return $(this).attr('title') == '列表3';
	});
	 $('li').eq(2).hasClass('.red'); // 是否含有
	 $('li').slice(2,4);     //从第二个位置开始,选到第4个位置
	 $("#box").find('li').end().get(0);  // end表示元素前一个状态，这里找到ul
	 $('div:first').clildren().size(); // 标签元素
	 $('div:first').contains().size(); // 包含标签元素和文本元素
	 $('li').filter('.red,:first,:last'); // 过滤
	 $('li').filter('.red,:first-child,:last-child');
	 $('li').filter(function(){
		return $(this).attr('class')=='red' 
		&& $(this).attr('title') == '列表3';
	 });

#### jquery 常规选择器

	<form>
		<input type='text' name='user' value='123' />
		<input type='password' name='pass' value='123' />
		<textarea></textarea>
		<select name='city'></select>
		<button></button>
	</form>
	$('input[type=password]');  // 属性选择器
	$('input[type=text][name=user]');  // 属性选择器
	$(':input[name=city]') // select下拉菜单，input选中所有表单
	$(':text');  // 单行文本框
	$(':password'); // 密码框
	$(':password[name=pass]);  // 速度更快
	$(':radio');
	$(':checkbox');
	$(':submit');
	$(':reset');
	$(':image');
	$(':button');
	$('form:hidden'); // 限定范围
	$(':file');
	$('form:enable');
	$('form:disabled');
	$('form:checked');
	$('form:selected');
	
	 
	 
	
	
	



