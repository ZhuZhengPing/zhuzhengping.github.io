---
layout : post
title : "插件"
category : jquery
duoshuo: true
date : 2015-6-13

---

插件(`Plugin`)也成为 `jQuery` 扩展(`Extension`)，是一种遵循一定规范的应用程序接口编
写出来的程序。目前 `jQuery` 插件已超过几千种，由来自世界各地的开发者共同编写、验证
和完善。而对于 `jQuery` 开发者而言，直接使用这些插件将快速稳定架构系统，节约项目成
本。

####一．插件概述

插件是以 `jQuery` 的核心代码为基础，编写出复合一定规范的应用程序。也就是说，插
件也是 `jQuery` 代码，通过 `js` 文件引入的方式植入即可。
插件的种类很多，主要大致可以分为：UI 类、表单及验证类、输入类、特效类、`Ajax`
类、滑动类、图形图像类、导航类、综合工具类、动画类等等。
引入插件是需要一定步骤的，基本如下：

1. 必须先引入 `jquery.js` 文件，而且在所有插件之前引入；
2. 引入插件；
3. 引入插件的周边，比如皮肤、中文包等。

####二．验证插件

`Validate.js` 是 `jQuery` 比较优秀的表单验证插件之一。这个插件有两个 `js` 文件，一个是主
文件，一个是中文包文件。使用的时候，可以使用 `min` 版本；在这里，为了教学，我们未
压缩版本。

验证插件包含的两个文件分别为：`jquery.validate.js` 和 `jquery.validate.messages_zh.js`。

	//HTML 内容
	<script type="text/javascript" src="jquery.validate.js"></script>
	<script type="text/javascript" src="jquery.validate.messages_zh.js"></script>
	<form>
		<p>用 户 名： <input type="text" class="required" name="username" minlength="2" />
		*</p>
		<p>电子邮件：<input type="text" class="required email" name="email" /> *</p>
		<p>网 址：<input type="text" class="url" name="url" /></p>
		<p><input type="submit" value="提交" /></p>
	</form>
	
	//jQuery 代码
	$(function () {
		$('form').validate();
	});

只要通过 `form` 元素的 `jQuery` 对象调用 `alidate()`方法，就可以实现“必填” 、 “不能小于
两位” 、 “电子邮件不正确” 、 “网址不正确”等验证效果。除了 `js` 端的 `validate()`方法调用，
表单处也需要相应设置才能最终得到验证效果。

1. 必填项：在表单设置 `class="required"`
2. 不得小于两位：在表单设置 `minlength="2"`
3. 电子邮件：在表单中设置 `class="email"`
4. 网址：在表单中设置 `class="url"`

*注意：本章就简单的了解插件的使用，并不针对某个功能的插件进行详细讲解。比如验
证插件 `validate.js`，它类似与 `jQuery` 一样，同样具有各种操作方法和功能，需要进行类似手
册一样的查询和讲解。所以，我们会在项目中再去详细讲解使用到的插件。*

####三．自动完成插件

所谓自动完成，就是当用户输入部分字符的时候，智能的搜索出包含字符的全部内容。
比如：输入 `a`，把匹配的内容列表展示出来。

	//HTML 内容
	<script type="text/javascript" src="jquery.autocomplete.js"></script>
	<script type="text/javascript" src="jquery-migrate-1.2.1.js"></script>
	<link rel="stylesheet" href="jquery.autocomplete.css" type="text/css" />

	//jQuery 代码
	var user = ['about', 'family', 'but', 'black'];
	$('form input[name=username]').autocomplete(user, {
		minChars : 0 //双击显示全部数据
	});

*注意：这个自动完成插件使用的 jQuery 版本较老，用了一些已被新版本的 jQuery 废弃
删除的方法，这样必须要向下兼容才能有效。所以，去查找插件的时候，要注意一下他坚持
的版本。*

####四．自定义插件

前面我们使用了别人提供好的插件，使用起来非常的方便。如果市面上找不到自己满意
的插件，并且想自己封装一个插件提供给别人使用。那么就需要自己编写一个 `jQuery` 插件
了。

按照功能分类，插件的形式可以分为一下三类：

1. 封装对象方法的插件； （也就是基于某个 `DOM` 元素的 `jQuery` 对象，局部性）
2. 封装全局函数的插件； （全局性的封装）
3. 选择器插件。(类似与`.find()`)

经过日积月累的插件开发，开发者逐步约定了一些基本要点，以解决各种因为插件导致
的冲突、错误等问题，包括如下：

1. 插件名推荐使用 `jquery.[插件名].js`，以免和其他 `js` 文件或者其他库相冲突；
2. 局部对象附加 `jquery.fn` 对象上，全局函数附加在 `jquery` 上；
3. 插件内部，`this` 指向是当前的局部对象；
4. 可以通过 `this.each` 来遍历所有元素；
5. 所有的方法或插件，必须用分号结尾，避免出现问题；
6. 插件应该返回的是 `jQuery` 对象，以保证可链式连缀；
7. 避免插件内部使用`$`，如果要使用，请传递 `jQuery` 进去。
	
按照以上的要点，我们开发一个局部或全局的导航菜单的插件。只要导航的`<li>`标签内
部嵌入要下拉的`<ul>`，并且 `class` 为 `nav`，即可完成下拉菜单。
	
	//HTML 部分
	<ul class="list">
		<li>导航列表
			<ul class="nav">
			<li>导航列表 1</li>
			<li>导航列表 1</li>
			<li>导航列表 1</li>
			<li>导航列表 1</li>
			<li>导航列表 1</li>
			<li>导航列表 1</li>
			</ul>
		</li>
		<li>导航列表
			<ul class="nav">
			<li>导航列表 2</li>
			<li>导航列表 2</li>
			<li>导航列表 2</li>
			<li>导航列表 2</li>
			<li>导航列表 2</li>
			<li>导航列表 2</li>
			</ul>
		</li>
	</ul>
	
	//jquery.nav.js 部分
	;(function ($) {
		$.fn.extend({
			'nav' : function (color) {
			$(this).find('.nav').css({
				listStyle : 'none',
				margin : 0,
				padding : 0,
				display : 'none',
				color : color
			});
			$(this).find('.nav').parent().hover(function () {
				$(this).find('.nav').slideDown('normal');
			}, function () {
				$(this).find('.nav').stop().slideUp('normal');
			});
				return this;
			}
		});
	})(jQuery);
	
####五．使用 validate.js 插件
	
官网下载：[http://bassistance.de/jquery-plugins/jquery-plugin-validation](http://bassistance.de/jquery-plugins/jquery-plugin-validation)
最重要的文件是 `validate.js`，还有两个可选的辅助文件：`additional-methods.js`（控件 `class`
方式）和 `message_zh.js`（提示汉化）文件（实际使用，请使用 `min` 压缩版） 。

第一步：引入 `validate.js`
	
	<script type="text/javascript" src="js/jquery.validate.js"></script>

第二步：在 JS 文件中执行

	$('#reg').validate();	
	
####六．默认验证规则

`Validate.js` 的默认验证规则的写法有两种形式：1.控件属性方式；2.`JS` 键值对传参方式。
	
|规则名　　　　　|说明
|:-------------|:-------------
|`required:true` |必须输入字段
|`email:true` |必须输入正确格式的电子邮件
|`url:true` |必须输入正确格式的网址
|`date:true` |必须输入正确格式的日期（`IE6` 验证出错）
|`dateISO:true` |必须输入正确格式的日期(ISO) （只验证格式， 不验证有效）
|`number:true` |必须输入合法的数字(负数，小数)
|`digits:true` |必须输入正整数
|`creditcard:true` |必须输入合法的信用卡号，例如：5105105105105100
|`equalTo:"#field"` |输入值必须和#field 相同
|`minlength:5` |输入长度最小是 5 的字符串(汉字算一个字符)
|`maxlength:10` |输入长度最多是 10 的字符串(汉字算一个字符)
|`rangelength:[5,10]` |输入长度介于 5 和 10 之间的字符串")(汉字算一个字符)
|`range:[5,10]` |输入值必须介于 5 和 10 之间
|`min:5` |输入值不能小于 5
|`max:10` |输入值不能大于 10
|`remote:"check.php"` |使用 `ajax` 方法调用 `check.php` 验证输入值

	//使用控件方式验证“必填和不得小于两位”
	<input type="text" class="required" minlength="2" name="user" id="user" />

*注意：默认规则里设置布尔值的，直接写到 `class` 里即可实现。如果是数字或数组区间，
直接使用属性=值的方式即可。而对于错误提示是因为，可以引入中文汉化文件，或直接替
换掉即可。*	
	
	//使用 JS 对象键值对传参方式设置
	$('#reg').validate({
		rules : {
			user : { //只有一个规则的话，
				required : true, //直接 user : 'required',
				minlength : 2,
			},
		},
		messages : {
			user : {
				required : '帐号不得为空！',
				minlength : '帐号不得小于 2 位！',
			},
		}
	});
	
*注意：由于第一种形式不能设置指定的错误提示信息。我们推荐使用第二种形式，第二
种形式也避免的 `HTML` 污染。*
	
	//所有规则演示
	$('#reg').validate({
		rules : {
			email : {
				email : true,
			},
			url : {
				url : true,
			},
			date : {
				date : true,
			},
			dateIOS : {
				dateIOS : true,
			},
			number : {
				number : true,
			} 
			digits : {
				digits : true,
			},
			creditcard : {
				creditcard : true,
			},
			min : {
				min : 5,
			},
			range : {
				range : [5, 10],
			},
			rangelength : {
				rangelength : [5,10],
			},
			notpass : {
				equalTo : '#pass', //这里的 To 是大写的 T
			}
		},
	});
	
####七．`validate()`的方法和选项
	
除了默认的验证规则外，`validate.js` 还提供了大量的其他属性和方法供开发者使用。比
如，调试属性，错误提示位置一系列比较有用的选项。	
	
	//jQuery.format 格式化错误提示
	$('#reg').validate({
		rules : {
			user : {
				required : true,
				minlength : 5,
				rangelength : [5,10]
			},
		},
		messages : {
			user : {
				required : '帐号不得为空！',
				minlength : jQuery.format('帐号不得小于{0}位！'),
				rangelength : jQuery.format('帐号限制在{0}-{1}位！'),
			},
		},
	});
	
	//开启调试模式禁止提交
	$('#reg').validate({
		debug : true,
	});
	
	//设置调试模式为默认，可以禁止多个表单提交
	$.validator.setDefaults({
		debug : true,
	});
	
	//使用其他方式代替默认提交
	submitHandler : function (form) {
		//可以执行 ajax 提交，并且无须 debug:true 阻止提交了
	},
	
	//忽略某个字段验证
	ignore : '#pass',
	
	//群组错误提示
	groups : {
		myerror : 'user pass',
	},
	
	//显示群组的错误提示
	focusInvalid : false,
	errorPlacement : function (error, element) {
		$.each(error, function (index, value) {
			$('.myerror').html($('.myerror').html() + $(value).html());
		})
	},
	
	//群组错误提示，分开
	groups : {
		error_user : 'user',
		error_pass : 'pass'
	},
	
	//将群组的错误指定存放位置
	errorPlacement : function (error, element) {
		error.appendTo('.myerror');
	},
	
	//设置错误提示的 class 名
	errorClass : 'error_list',
	
	//设置错误提示的标签
	errorElement : 'p',
	
	//统一包裹错误提示
	errorLabelContainer : 'ol.error',
	
	wrapper : 'li',
	
	//设置成功后加载的 class
	success : 'success',
	
	//使用方法加载 class 并添加文本
	success : function (label) {
		label.addClass('success').text('ok');
	},
	
	//高亮显示有错误的元素，变色式
	highlight: function(element, errorClass) {
		$(element).fadeOut(function() {
			$(element).fadeIn()
		})
	},
	
	//高亮显示有错误的元素，变色式
	highlight: function(element, errorClass) {
		$(element).css('border', '1px solid red');
	},
	
	//成功的元素移出错误高亮
	unhighlight : function (element, errorClass) {
		$(element).css('border', '1px solid #ccc');
	},
	
	//表单提交时获取信息
	invalidHandler : function (event, validator) {
		var errors = validator.numberOfInvalids();
		if (errors) {
			$('.myerror').html('您有' + errors + '个表单元素填写非法！');
		}
	},
	
	//获取错误提示句柄，不用提交及时获取值
	showErrors : function (errorMap, errorList) {
		var errors = this.numberOfInvalids();
		if (errors) {
			$('.myerror').html('您有' + errors + '个表单元素填写非法！');
		} else {
			$('.myerror').hide();
		}
		this.defaultShowErrors(); //执行默认错误
	},
	
	//获取错误提示句柄，errorList
	showErrors : function (errorMap, errorList) {
		alert(errorList[0].message); //得到错误信息
		alert(errorList[0].element); //当前错误的表单元素
	},
	
####八．`validate.js` 其他功能	
	
使用 `remote:url`，可以对表单进行 `ajax` 验证，默认会提交当前验证的值到远程地址。如
果需要提交其他的值，可以使用 `data` 选项。	

	//使用 ajax 验证
	rules : {
		user : {
			required : true,
			minlength : 2,
			remote : 'user.php',
		},
	},
	//user.php 内容
	<?php
		if ($_GET['user'] == 'bnbbs') {
			echo 'false';
		} else {
			echo 'true';
		}
	?>

*注意：远程地址只能输出'true'或'false'，不能输出其他值。*

	//同时传递多个值到远程端
	pass : {
		required : true,
		minlength : 6,
		remote : {
			url : 'user.php',
			type : 'POST',
			dataType : 'json',
			data : {
				user : function () {
					return $('#user').val();
				},
			},
		},
	},
	//user.php 内容
	<?php
		if ($_POST['user'] != 'bnbbs' || $_POST['pass'] != '123456') {
			echo 'false';
		} else {
			echo 'true';
		}
	?>
	
`validate.js` 提供了一些事件触发的默认值，这些值呢，大部分建议是不用更改的。	
	
	//取消提交验证
	onsubmit : false, //默认是 true
	
*注意： 设置为 `false` 会导致直接传统提交， 不会实现验证功能， 一般是用于 `keyup/click/blur`
验证提交。*
	
	//设置鼠标离开不触发验证
	onfocusout : false, //默认为 true
	//设置键盘按下弹起不触发验证
	onkeyup : false, //默认为 true
	
*注意：只要设置了，在测试的浏览器不管是 `false` 还是 `true` 都不触发了。*	
	
	//设置点击 checkbox 和 radio 点击不触发验证
	onclick : false, //默认为 true
	
	//设置错误提示后，无法获取焦点
	focusInvalid : false, //默认为 true
	
	//提示错误时，隐藏错误提示，不能和 focusInvalid 一起用，冲突
	focusCleanup : true, //默认为 false
	
如果表单元素设置了 `title` 值，且 `messages` 为默认，就会读取 `title` 值的错误信息，我们
可以通过 `ignoreTitle : true`，设置为 `true`，屏蔽这一个功能。
	
	ignoreTitle : true, //默认为 false
	
	//判断表单所验证的元素是否全部有效
	alert($('#reg').valid()); //全部有效返回 true
	
`Validate.js` 提供了可以单独验证每个表单元素的 `rules` 方法，不但提供了 `add` 增加验证，
还提供了 `remove` 删除验证的功能。

	//给 user 增加一个表单验证
	$('#user').rules('add', {
		required : true,
		minlength : 2,
		messages : {
		required : '帐号不得为空！',
		minlength : jQuery.format('帐号不得小于{0}位！'),
		}
	});
	
	//删除 user 的所有验证规则
	$('#user').rules('remove');
	
	//删除 user 的指定验证规则
	$('#user').rules('remove', 'minlength min max');
	
	//添加自定义验证
	$.validator.addMethod('code', function (value, element) {
		var tel = /^[0-9]{6}$/;
			return this.optional(element) || (tel.test(value));
		}, '请正确填写您的邮政编码');
		
	//调用自定义验证
	rules : {
		code : {
			required : true,
			code : true,
		}
	}
		