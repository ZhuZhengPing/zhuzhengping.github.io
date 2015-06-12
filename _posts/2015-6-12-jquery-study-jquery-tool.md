---
layout : post
title : "工具函数"
category : jquery
duoshuo: true
date : 2015-6-7

---

工具函数是指直接依附于 `jQuery` 对象，针对 `jQuery` 对象本身定义的方法，即全局性
的函数。它的作用主要是提供比如字符串、数组、对象等操作方面的遍历。


####一. 字符串操作


在 `jQuery` 中，字符串的工具函数只有一个，就是去除字符串左右空格的工具函数：
`$.trim()`。

{% highlight javascript %}
	//$.trim()去掉字符串两边空格
	var str = ' jQuery ';
	alert(str);
	alert($.trim(str));
{% endhighlight %}

####二. 数组和对象操作


`jQuery` 为处理数组和对象提供了一些工具函数， 这些函数可以便利的给数组或对象进行
遍历、筛选、搜索等操作。

	//$.each()遍历数组
	var arr = ['张三', '李四', '王五', '马六'];
	$.each(arr, function (index, value) {
		$('#box').html($('#box').html() + index + '.' + value + '<br />');
	});
	
---
	
	//$.each()遍历对象
	$.each($.ajax(), function (name, fn) {
		$('#box').html($('#box').html() + name + '.' + '<br /><br />');
	})
	
*注意：$.each()中 index 表示数组元素的编号，默认从 0 开始。*

	//$.grep()数据筛选
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arrGrep = $.grep(arr, function (element, index) {
		return element < 6 && index < 5;
	});
	alert(arrGrep);
	
*注意：$.grep()方法的 index 是从 0 开始计算的。*

	//$.map()修改数据
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arrMap = $.map(arr, function (element, index) {
		if (element < 6 && index < 5) {
			return element + 1;
		}
	});
	alert(arrMap);

---

	//$.inArray()获取查找到元素的下标
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arrInArray = $.inArray(1, arr);
	alert(arrInArray);
	
*注意：$.inArray()的下标从 0 开始计算。*

	//$.merge()合并两个数组
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arr2 = [23,2,89,3,6,7];
	alert($.merge(arr, arr2));
	
---
	
	//$.unique()删除重复的 DOM 元素
	<div></div>
	<div></div>
	<div class="box"></div>
	<div class="box"></div>
	<div class="box"></div>
	<div></div>
	
	var divs = $('div').get();
	divs = divs.concat($('.box').get());
	alert($(divs).size());
	$.unique(divs);
	alert($(divs).size());
	
---
	
	//.toArray()合并多个 DOM 元素组成数组
	alert($('li').toArray());

####三. 测试操作

在 `jQuery` 中，数据有着各种类型和状态。有时，我们希望能通过判断数据的类型和状
态做相应的操作。`jQuery` 提供了五组测试用的工具函数。

<center><strong>测试工具函数</strong></center>

	

















