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

	//$.inArray()获取查找到元素的下标
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arrInArray = $.inArray(1, arr);
	alert(arrInArray);
	
*注意：$.inArray()的下标从 0 开始计算。*

	//$.merge()合并两个数组
	var arr = [5,2,9,4,11,57,89,1,23,8];
	var arr2 = [23,2,89,3,6,7];
	alert($.merge(arr, arr2));
	
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
	
	//.toArray()合并多个 DOM 元素组成数组
	alert($('li').toArray());

####三. 测试操作

在 `jQuery` 中，数据有着各种类型和状态。有时，我们希望能通过判断数据的类型和状
态做相应的操作。`jQuery` 提供了五组测试用的工具函数。

|函数名|说明
|:-----|:-----
|`$.isArray(obj)`|判断是否为数组对象，是返回 `true`
|`$.isFunction(obj)`|判断是否为函数，是返回 `true`
|`$.isEmptyObject(obj)`|判断是否为空对象，是返回 `true`
|`$.isPlainObjet(obj)`|判断是否为纯粹对象，是返回 `true`
|`$.contains(obj)`|判断 DOM 节点是否含另一个 DOM 节点，是返回 `true`
|`$.type(data)`|判断数据类型
|`$.isNumeric(data)`|判断数据是否为数值
|`$.isWindow(data)`|判断数据是否为 `window` 对象

	//判断是否为数组对象
	var arr = [1,2,3];
	alert($.isArray(arr));

	//判断是否为函数
	var fn = function () {};
	alert($.isFunction(fn));
	
	//判断是否为空对象
	var obj = {}
	alert($.isEmptyObject(obj));

	//判断是否由`{}`或 `new Object()`创造出的对象
	var obj = window;
	alert($.isPlainObject(obj));

*注意：如果使用 `new Object('name')`;传递参数后，返回类型已不是 `Object`，而是字符串，
所以就不是纯粹的原始对象了。*

	//判断第一个 DOM 节点是否含有第二个 DOM 节点
	alert($.contains($('#box').get(0), $('#pox').get(0)));
	
	//$.type()检测数据类型
	alert($.type(window));
	
	//$.isNumeric 检测数据是否为数值
	alert($.isNumeric(5.25));
	
	//$.isWindow 检测数据对象是否为 window 对象
	alert($.isWindow(window));

####四. URL 操作
	
URL 地址操作，在之前的 Ajax 章节其实已经讲到过。只有一个方法：$.param()，将对
象的键值对转化为 URL 键值对字符串形式。
	
	//$.param()将对象键值对转换为 URL 字符串键值对
	var obj = {
		name : 'Lee',
		age : 100
	};
	alert($.param(obj));
	
####五．浏览器检测

由于在早期的浏览器中，分 IE 和 W3C 浏览器。而 IE678 使用的覆盖率还很高，所以，
早期的 jQuery 提供了$.browser 工具对象。而现在的 jQuery 已经废弃删除了这个工具对象，
如果还想使用这个对象来获取浏览器版本型号的信息，可以使用兼容插件。	

|属性　　　　　|说明　　　　　
|:-----|:-----
|`webkit`|判断 webkit 浏览器，如果是则为 `true`
|`mozilla`|判断 mozilla 浏览器，如果是则为 `true`
|`safari`|判断 safari 浏览器，如果是则为 `true`
|`opera`|判断 opera 浏览器，如果是则为 `true`
|`msie`|判断 IE 浏览器，如果是则为 `true`
|`version`|获取浏览器版本号

	//获取火狐浏览器和版本号
	alert($.browser.mozilla + ':' + $.browser.version);
	
*注意：火狐采用的是 mozilla 引擎，一般就是指火狐；而谷歌 Chrome 采用的引擎是
webkit，一般验证 Chrome 就用 webkit。*

还有一种浏览器检测，是对浏览器内容的检测。比如：W3C 的透明度为 opacity，而 IE
的透明度为 alpha。这个对象是$.support。

|属性名|说明
|:-------------|:-------------
|`hrefNormalized`|如果浏览器从 getAttribute("href")返回的是原封不动的结果，则返回 `true`。在 `IE` 中会返回 `false`，因为他的 URLs 已经常规化了
|`htmlSerialize`|如果浏览器通过 innerHTML 插入链接元素的时候会序列化这些链接，则返回 true，目前 IE 中返回 false
|`leadingWhitespace`|如果在使用 innerHTML 的时候浏览器会保持前导空白字符，则返回 true，目前在 IE 6-8 中返回 false
|`objectAll`|如果在某个元素对象上执行getElementsByTagName("*")会返回所有子孙元素， 则为true，目前在 IE 7 中为 false
|`opacity`|如果浏览器能适当解释透明度样式属性，则返回 true，目前在 IE 中返回 false，因为他用 alpha 滤镜代替
|`scriptEval`|使用 appendChild/createTextNode 方法插入脚本代码时，浏览器是否执行脚本，目前在 IE 中返回 false，IE使用 .text 方法插入脚本代码以执行
|`style`|如果 `getAttribute("style")`返回元素的行内样式，则为 true。目前 IE 中为 false，因为他用 cssText 代替
|`tbody`|如果浏览器允许 table 元素不包含 tbody 元素，则返回true。目前在 IE 中会返回 false，他会自动插入缺失的`tbody`
|`Ajax`|如果浏览器支持 ajax 操作，返回 true

	//$.support.ajax 判断是否能创建 ajax
	alert($.support.ajax);
	//$.support.opacity 设置不同浏览器的透明度
	if ($.support.opacity == true) {
		$('#box').css('opacity', '0.5');
	} else {
		$('#box').css('filter', 'alpha(opacity=50)');
	}

*注意：由于 jQuery 越来越放弃低端的浏览器，所以检测功能在未来使用频率也越来越
低。所以，$.brower 已被废弃删除，而$.support.boxModel 检测 W3C 或 IE 盒子也被删除。
并且 http://api.jquery.com/jQuery.support/官网也不提供属性列表和解释，给出一个 Modernizr
第三方小工具来辅组检测。*

####六．其他操作

jQuery 提供了一个预备绑定函数上下文的工具函数：$.proxy()。这个方法，可以解决诸
如外部事件触发调用对象方法时 this 的指向问题。

	//$.proxy()调整 this 指向
	var obj = {
		name : 'Lee',
		test : function () {
			alert(this.name);
		}
	};
	//指向的 this 为#box 元素
	$('#box').click(obj.test); 
	//指向的 this 为方法属于对象 box
	$('#box').click($.proxy(obj, 'test')); 










