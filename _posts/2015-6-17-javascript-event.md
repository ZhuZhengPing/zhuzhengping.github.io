---
layout : post
title : "事件"
category : javascript
duoshuo: true
date : 2015-6-21

---

####一．事件介绍

事件一般是用于浏览器和用户操作进行交互。最早是`IE`和`Netscape Navigator`中出现，作为分担服务器端运算负载的一种手段。直到几乎所有的浏览器都支持事件处理。而`DOM2`级规范开始尝试以一种复合逻辑的方式标准化`DOM`事件。`IE9、Firefox、Opera、Safari`和`Chrome`全都已经实现了`“DOM2级事件”`模块的核心部分。`IE8`之前浏览器仍然使用其专有事件模型。
	
`JavaScript`有三种事件模型：内联模型、脚本模型和`DOM2`模型。	
	
####二．内联模型	
	
这种模型是最传统接单的一种处理事件的方法。在内联模型中，事件处理函数是`HTML`标签的一个属性，用于处理指定事件。虽然内联在早期使用较多，但它是和`HTML混写的，并没有与`HTML`分离。	
	
	
	//在HTML中把事件处理函数作为属性执行JS代码
	<input type="button" value="按钮" onclick="alert('Lee');"  />		//注意单双引号

	//在HTML中把事件处理函数作为属性执行JS函数
	<input type="button" value="按钮" onclick="box();"  />			//执行JS的函数

PS：函数不得放到`window.onload`里面，这样就看不见了。	
	
####三．脚本模型
	
由于内联模型违反了`HTML`与`JavaScript`代码层次分离的原则。为了解决这个问题，我们可以在`JavaScript`中处理事件。这种处理方式就是脚本模型。	
	
	var input = document.getElementsByTagName('input')[0];		//得到input对象
	input.onclick = function () {								//匿名函数执行
		alert('Lee');
	};

PS：通过匿名函数，可以直接触发对应的代码。也可以通过指定的函数名赋值的方式来执行函数(赋值的函数名不要跟着括号)。	
	
	input.onclick = box;						//把函数名赋值给事件处理函数
	
####四．事件处理函数	
	
	`JavaScript`可以处理的事件类型为：鼠标事件、键盘事件、HTML事件。
	
|事件处理函数|影响的元素|何时发生	
|:------|:------|:------
|`onabort`	|图像	|当图像加载被中断时
|`onblur`	|窗口、框架、所有表单对象	|当焦点从对象上移开时
|`onchange`	|输入框，选择框和文本区域	|当改变一个元素的值且失去焦点时
|`onclick`	|链接、按钮、表单对象、图像映射区域	|当用户单击对象时
|`ondblclick`	|链接、按钮、表单对象	|当用户双击对象时
|`ondragdrop`	|窗口	|当用户将一个对象拖放到浏览器窗口时
|`onError`	|脚本	|当脚本中发生语法错误时
|`onfocus`	|窗口、框架、所有表单对象	|当单击鼠标或者将鼠标移动聚焦到窗口或框架时
|`onkeydown`	|文档、图像、链接、表单	|当按键被按下时
|`onkeypress`	|文档、图像、链接、表单	|当按键被按下然后松开时
|`onkeyup`	|文档、图像、链接、表单	|当按键被松开时
|`onload`	|主题、框架集、图像	|文档或图像加载后
|`onunload`	|主体、框架集	|文档或框架集卸载后
|`onmouseout`	|链接	|当图标移除链接时
|`onmouseover`	|链接	|当鼠标移到链接时
|`onmove`	|窗口	|当浏览器窗口移动时
|`onreset`	|表单复位按钮	|单击表单的reset按钮
|`onresize`	|窗口	|当选择一个表单对象时
|`onselect`	|表单元素	|当选择一个表单对象时
|`onsubmit`	|表单	|当发送表格到服务器时

PS：所有的事件处理函数都会都有两个部分组成，`on` + 事件名称，例如`click`事件的事件处理函数就是：`onclick`。在这里，我们主要谈论脚本模型的方式来构建事件，违反分离原则的内联模式，我们忽略掉。	
	
对于每一个事件，它都有自己的触发范围和方式，如果超出了触发范围和方式，事件处理将失效。	
	
鼠标事件，页面所有元素都可触发 

`click`：当用户单击鼠标按钮或按下回车键时触发。	 
	
	input.onclick = function () {
			alert('Lee');
	};

`dblclick`：当用户双击主鼠标按钮时触发。

		input.ondblclick = function () {
			alert('Lee');
		};

`mousedown`：当用户按下了鼠标还未弹起时触发。

		input.onmousedown = function () {
			alert('Lee');
		};

`mouseup`：当用户释放鼠标按钮时触发。

		input.onmouseup = function () {
			alert('Lee');
		};

`mouseover`：当鼠标移到某个元素上方时触发。

		input.onmouseover = function () {
			alert('Lee');
		};

`mouseout`：当鼠标移出某个元素上方时触发。

		input.onmouseout = function () {
			alert('Lee');
		};

`mousemove`：当鼠标指针在元素上移动时触发。

		input.onmousemove = function () {
			alert('Lee');
		};
	
键盘事件	
	
`keydown`：当用户按下键盘上任意键触发，如果按住不放，会重复触发。	
	
	onkeydown = function () {
			alert('Lee');
		};

`keypress`：当用户按下键盘上的字符键触发，如果按住不放，会重复触发。
	
	onkeypress = function () {
		alert('Lee');
	};

`keyup`：当用户释放键盘上的键触发。

	onkeyup = function () {
		alert('Lee');
	};
	
`HTML`事件 	
	
`load`：当页面完全加载后在`window`上面触发，或当框架集加载完毕后在框架集上触发。	
	
	window.onload = function () {
		alert('Lee');
	};

`unload`：当页面完全卸载后在`window`上面触发，或当框架集卸载后在框架集上触发。	
	
	window.onunload = function () {
		alert('Lee');
	};

`select`：当用户选择文本框(`input`或`textarea`)中的一个或多个字符触发。	
	
	input.onselect = function () {
			alert('Lee');
	};
	
`change`：当文本框(`input`或`textarea`)内容改变且失去焦点后触发。	
	
	input.onchange = function () {
		alert('Lee');
	};
	
`focus`：当页面或者元素获得焦点时在`window`及相关元素上面触发。

	input.onfocus = function () {
		alert('Lee');
	};

`blur`：当页面或元素失去焦点时在window及相关元素上触发。

	input.onblur = function () {
		alert('Lee');
	};

`submit`：当用户点击提交按钮在`<form>`元素上触发。

	form.onsubmit = function () {
		alert('Lee');
	};

`reset`：当用户点击重置按钮在<form>元素上触发。	
	
	form.onreset= function () {
		alert('Lee');
	};
	
`resize`：当窗口或框架的大小变化时在`window`或框架上触发。	
	
	window.onresize = function () {
		alert('Lee');
	};
	
`scroll`：当用户滚动带滚动条的元素时触发。	
	
	window.onscroll = function () {
		alert('Lee');
	};
	
####五．事件对象	

事件处理函数的一个标准特性是，以某些方式访问的事件对象包含有关于当前事件的上下文信息。

事件处理三部分组成：对象.事件处理函数=函数。例如：单击文档任意处。

	document.onclick = function () {
		alert('Lee');
	};

PS：以上程序的名词解释：`click`表示一个事件类型，单击。`onclick`表示一个事件处理函数或绑定对象的属性(或者叫事件监听器、侦听器)。`document`表示一个绑定的对象，用于触发某个元素区域。`function()`匿名函数是被执行的函数，用于触发后执行。	
	
除了用匿名函数的方法作为被执行的函数，也可以设置成独立的函数。	

	document.onclick = box;						//直接赋值函数名即可，无须括号
	function box() {
		alert('Lee');
	}

`this`关键字和上下文	

在面向对象那章我们了解到：在一个对象里，由于作用域的关系，`this`代表着离它最近对象。

	var input = document.getElementsByTagName('input')[0];
	input.onclick = function () {
		alert(this.value);					//HTMLInputElement，this表示input对象
	};

从上面的拆分，我们并没有发现本章的重点：事件对象。那么事件对象是什么？它在哪里呢？当触发某个事件时，会产生一个事件对象，这个对象包含着所有与事件有关的信息。包括导致事件的元素、事件的类型、以及其它与特定事件相关的信息。

事件对象，我们一般称作为`event`对象，这个对象是浏览器通过函数把这个对象作为参数传递过来的。那么首先，我们就必须验证一下，在执行函数中没有传递参数，是否可以得到隐藏的参数。

	function box() {							//普通空参函数
		alert(arguments.length);					//0，没有得到任何传递的参数
	}

	input.onclick = function () {					//事件绑定的执行函数
		alert(arguments.length);					//1，得到一个隐藏参数
	};

通过上面两组函数中，我们发现，通过事件绑定的执行函数是可以得到一个隐藏参数的。说明，浏览器会自动分配一个参数，这个参数其实就是`event`对象。

	input.onclick = function () {
		alert(arguments[0]);					//MouseEvent，鼠标事件对象
	};

上面这种做法比较累，那么比较简单的做法是，直接通过接收参数来得到即可。

	input.onclick = function (evt) {				//接受event对象，名称不一定非要event
		alert(evt);								//MouseEvent，鼠标事件对象
	};

直接接收`event`对象，是`W3C`的做法，`IE`不支持，`IE`自己定义了一个`event`对象，直接在`window.event`获取即可。

	input.onclick = function (evt) {
		var e = evt || window.event;				//实现跨浏览器兼容获取event对象
		alert(e);
	};

####六．鼠标事件

鼠标事件是`Web`上面最常用的一类事件，毕竟鼠标还是最主要的定位设备。那么通过事件对象可以获取到鼠标按钮信息和屏幕坐标获取等。

只有在主鼠标按钮被单击时(常规一般是鼠标左键)才会触发`click`事件，因此检测按钮的信息并不是必要的。但对于`mousedown`和`mouseup`事件来说，则在其`event`对象存在一个`button`属性，表示按下或释放按钮。

非`IE(W3C)`中的`button`属性

|值 |说明
|:------|:------
|0	|表示主鼠标按钮(常规一般是鼠标左键)
|1	|表示中间的鼠标按钮(鼠标滚轮按钮)
|2	|表示次鼠标按钮(常规一般是鼠标右键)

`IE`中的`button`属性

|值	|说明
|:------|:------
|0	|表示没有按下按钮
|1	|表示主鼠标按钮(常规一般是鼠标左键)
|2	|表示次鼠标按钮(常规一般是鼠标右键)
|3	|表示同时按下了主、次鼠标按钮
|4	|表示按下了中间的鼠标按钮
|5	|表示同时按下了主鼠标按钮和中间的鼠标按钮
|6	|表示同时按下了次鼠标按钮和中间的鼠标按钮
|7	|表示同时按下了三个鼠标按钮

PS：在绝大部分情况下，我们最多只使用主次中三个单击键，IE给出的其他组合键一般无法使用上。所以，我们只需要做上这三种兼容即可。

	function getButton(evt) {					//跨浏览器左中右键单击相应
		var e = evt || window.event;
		if (evt) {								//Chrome浏览器支持W3C和IE
			return e.button;					//要注意判断顺序
		} else if (window.event) {
			switch(e.button) {
				case 1 :
					return 0;
				case 4 : 
					return 1;
				case 2 : 
					return 2;
			}
		}
	}

	document.onmouseup = function (evt) {		//调用
		if (getButton(evt) == 0) {
			alert('按下了左键！');
		} else if (getButton(evt) == 1) {
			alert('按下了中键！');
		} else if (getButton(evt) == 2) {
			alert('按下了右键！' );
		}
	};

可视区及屏幕坐标

事件对象提供了两组来获取浏览器坐标的属性，一组是页面可视区左边，另一组是屏幕坐标。

|属性	|说明
|:------|:------
|`clientX`	|可视区`X`坐标，距离左边框的位置
|`clientY`	|可视区`Y`坐标，距离上边框的位置
|`screenX`	|屏幕区`X`坐标，距离左屏幕的位置
|`screenY`	|屏幕区`Y`坐标，距离上屏幕的位置

	document.onclick = function (evt) {			
		var e = evt || window.event;
		alert(e.clientX + ',' + e.clientY);
		alert(e.screenX + ',' + e.screenY);
	};

有时，我们需要通过键盘上的某些键来配合鼠标来触发一些特殊的事件。这些键为：`Shfit`、`Ctrl`、`Alt`和`Meat`(`Windows`中就是`Windows`键，苹果机中是`Cmd`键)，它们经常被用来修改鼠标事件和行为，所以叫修改键。	

|属性	|说明
|:------|:------
|`shiftKey`	|判断是否按下了`Shfit`键
|`ctrlKey`	|判断是否按下了`ctrlKey`键
|`altKey`	|判断是否按下了`alt`键
|`metaKey`	|判断是否按下了`windows`键，`IE`不支持

---

	function getKey(evt) {						
		var e = evt || window.event;
		var keys = [];
		
		if (e.shiftKey) keys.push('shift');			//给数组添加元素
		if (e.ctrlKey) keys.push('ctrl');
		if (e.altKey) keys.push('alt');
		
		return keys;
	}

	document.onclick = function (evt) {
		alert(getKey(evt));
	};

####七．键盘事件

用户在使用键盘时会触发键盘事件。“`DOM2`级事件”最初规定了键盘事件，结果又删除了相应的内容。最终还是使用最初的键盘事件，不过`IE9`已经率先支持“`DOM3`级键盘事件。

在发生`keydown`和`keyup`事件时，`event`对象的`keyCode`属性中会包含一个代码，与键盘上一个特定的键对应。对数字字母字符集，`keyCode`属性的值与`ASCII`码中对应小写字母或数字的编码相同。字母中大小写不影响。

	document.onkeydown = function (evt) {
		alert(evt.keyCode);						//按任意键，得到相应的keyCode
	};

不同的浏览器在`keydown`和`keyup`事件中，会有一些特殊的情况：

在`Firefox`和`Opera`中，分号键时`keyCode`值为59，也就是`ASCII`中分号的编码；而`IE`和`Safari`返回186，即键盘中按键的键码。

PS：其他一些特殊情况由于浏览器版本太老和市场份额太低，这里不做补充。

`Firefox`、`Chrome`和`Safari`的`event`对象都支持一个charCode属性，这个属性只有在发生keypress事件时才包含值，而且这个值是按下的那个键所代表字符的`ASCII`编码。此时的`keyCode`通常等于0或者也可能等于所按键的编码。`IE`和`Opera`则是在`keyCode`中保存字符的`ASCII`编码。

	function getCharCode(evt) {
		var e = evt || window.event;
		if (typeof e.charCode == 'number') {
			return e.charCode;
		} else {
			return e.keyCode;
		}
	}

PS：可以使用`String.fromCharCode()`将`ASCII`编码转换成实际的字符。

`keyCode`和`charCode`区别如下：比如当按下“a键（重视是小写的字母）时，
在`Firefox`中会获得

>keydown： keyCode is 65  charCode is 0
>keyup： 	  keyCode is 65 charCode is 0
>keypress： keyCode is 0  charCode is 97

在IE中会获得

>keydown： keyCode is 65  charCode is undefined
>keyup：   keyCode is 65  charCode is undefined
>keypress： keyCode is 97  charCode is undefined

而当按下`shift`键时，在`Firefox`中会获得

>keydown：keyCode is 16  charCode is 0
>keyup： keyCode is 16   charCode is 0

在`IE`中会获得

>keydown：keyCode is 16  charCode is undefined
>keyup： keyCode is 16  charCode is undefined

`keypress`：不会获得任何的`charCode`值，因为按`shift`并没输入任何的字符，并且也不会触发`keypress`事务

PS：在`keydown`事务里面，事务包含了`keyCode` – 用户按下的按键的物理编码。

在`keypress`里，`keyCode`包含了字符编码，即默示字符的`ASCII`码。如许的情势实用于所有的浏览器 – 除了火狐，它在`keypress`事务中的`keyCode`返回值为0。

####八．W3C与IE	
	
在标准的`DOM`事件中，`event`对象包含与创建它的特定事件有关的属性和方法。触发的事件类型不一样，可用的属性和方法也不一样。	

`W3C`中`event对象的属性和方法
	
|属性/方法	|类型	|读/写	|说明
|:------|:------|:------|:------
|`bubbles`	|`Boolean`	|只读	|表明事件是否冒泡
|`cancelable`	|`Boolean`	|只读	|表明是否可以取消事件的默认行为
|`currentTarget`	|`Element`	|只读	|其事件处理程序当前正在处理事件的那个元素
|`detail`	|`Integer`	|只读	|与事件相关的细节信息
|`eventPhase`	|`Integer`	|只读	|调用事件处理程序的阶段：1表示捕获阶段，2表示“处理目标”，3表示冒泡阶段
|`preventDefault()`	|Function	|只读	|取消事件的默认行为。如果`cancelabel`是`true`，则可以使用这个方法
|`stopPropagation()`	|Function	|只读	|取消事件的进一步捕获或冒泡。如果`bubbles`为`true`，则可以使用这个方法
|`target`	|`Element`	只读	事件的目标
|`type`	|`String`	只读	被触发的事件的类型
|`view`	|`AbstractView`	只读	与事件关联的抽象视图。等同于发生事件的`window`对象

`IE`中`event`对象的属性

|属性	|类型	|读/写	|说明
|:------|:------|:------|:------
|`cancelBubble`	|`Boolean`	|读/写	|默认值为`false`，但将其设置为`true`就可以取消事件冒泡
|`returnValue`	|`Boolean`	|读/写	|默认值为`true`，但将其设置为`false`就可以取消事件的默认行为
|`srcElement`	|`Element`	|只读	|事件的目标
|`type`	|`String`	|只读	|被触发的事件类型
	
在这里，我们只看所有浏览器都兼容的属性或方法。首先第一个我们了解一下`W3C`中的`target`和`IE`中的`srcElement`，都表示事件的目标。	

	function getTarget(evt) {
		var e = evt || window.event;
		return e.target || e.srcElement;				//兼容得到事件目标DOM对象
	}

	document.onclick = function (evt) {
		var target = getTarget(evt);
		alert(target);
	};

事件流是描述的从页面接受事件的顺序，当几个都具有事件的元素层叠在一起的时候，那么你点击其中一个元素，并不是只有当前被点击的元素会触发事件，而层叠在你点击范围的所有元素都会触发事件。事件流包括两种模式：冒泡和捕获。	

事件冒泡，是从里往外逐个触发。事件捕获，是从外往里逐个触发。那么现代的浏览器默认情况下都是冒泡模型，而捕获模式则是早期的`Netscape`默认情况。而现在的浏览器要使用`DOM2`级模型的事件绑定机制才能手动定义事件流模式。
	
	document.onclick = function () {
		alert('我是document');
	};
	document.documentElement.onclick = function () {
		alert('我是html');
	};
	document.body.onclick = function () {
		alert('我是body');
	};
	document.getElementById('box').onclick = function () {
		alert('我是div');
	};
	document.getElementsByTagName('input')[0].onclick = function () {
		alert('我是input');
	};
	
在阻止冒泡的过程中，`W3C`和`IE`采用的不同的方法，那么我们必须做一下兼容。	
	
	function stopPro(evt) {
		var e = evt || window.event;
		window.event ? e.cancelBubble = true : e.stopPropagation(); 
	}
	
####九．传统事件绑定的问题	
	
传统事件绑定有内联模型和脚本模型，内联模型我们不做讨论，基本很少去用。先来看一下脚本模型，脚本模型将一个函数赋值给一个事件处理函数。

	var box = document.getElementById('box');		//获取元素
	box.onclick = function () {					//元素点击触发事件
		alert('Lee');
	};

问题一：一个事件处理函数触发两次事件

	window.onload = function () {				//第一组程序项目或第一个JS文件
		alert('Lee');
	};

	window.onload = function () {				//第二组程序项目或第二个JS文件
		alert('Mr.Lee');
	};

当两组程序或两个`JS`文件同时执行的时候，后面一个会把前面一个完全覆盖掉。导致前面的`window.onload`完全失效了。

解决覆盖问题，我们可以这样去解决

	window.onload = function () {				//第一个要执行的事件，会被覆盖
		alert('Lee');
	};

	if (typeof window.onload == 'function') {		//判断之前是否有window.onload
		var saved = null;						//创建一个保存器
		saved = window.onload;					//把之前的window.onload保存起来
	}

	window.onload = function () {				//最终一个要执行事件
		if (saved) saved();						//执行之前一个事件
		alert('Mr.Lee');							//执行本事件的代码
	};

问题二：事件切换器

	box.onclick = toBlue;						//第一次执行boBlue()
	function toRed() {
		this.className = 'red';
		this.onclick = toBlue;					//第三次执行toBlue()，然后来回切换
	}

	function toBlue() {
		this.className = 'blue';
		this.onclick = toRed;					//第二次执行toRed()
	}

这个切换器在扩展的时候，会出现一些问题：

如果增加一个执行函数，那么会被覆盖

	box.onclick = toAlert;						//被增加的函数
	box.onclick = toBlue;						//toAlert被覆盖了

如果解决覆盖问题，就必须包含同时执行，但又出新问题

	box.onclick = function () {					//包含进去，但可读性降低
		toAlert();								//第一次不会被覆盖，但第二次又被覆盖
		toBlue.call(this);						//还必须把this传递到切换器里
	};

综上的三个问题：覆盖问题、可读性问题、`this`传递问题。我们来创建一个自定义的事件处理函数，来解决以上三个问题。
	
	function addEvent(obj, type, fn) {				//取代传统事件处理函数
		var saved = null;						//保存每次触发的事件处理函数
		if (typeof obj['on' + type] == 'function') {	//判断是不是事件
			saved = obj['on' + type];				//如果有，保存起来
		}
		obj['on' + type] = function () {			//然后执行	
		if (saved) saved();					//执行上一个	
				fn.call(this);						//执行函数，把this传递过去
		};
	}

	addEvent(window, 'load', function () {			//执行到了
		alert('Lee');
	});
	addEvent(window, 'load', function () {			//执行到了
		alert('Mr.Lee');
	});

PS：以上编写的自定义事件处理函数，还有一个问题没有处理，就是两个相同函数名的函数误注册了两次或多次，那么应该把多余的屏蔽掉。那，我们就需要把事件处理函数进行遍历，如果有同样名称的函数名就不添加即可。(这里就不做了)	
	
	addEvent(window, 'load', init);				//注册第一次
	addEvent(window, 'load', init);				//注册第二次，应该忽略
	function init() {
		alert('Lee');
	}

用自定义事件函数注册到切换器上查看效果：	
	
	addEvent(window, 'load', function () {
		var box = document.getElementById('box');
		addEvent(box, 'click', toBlue);
	});

	function toRed() {
		this.className = 'red';
		addEvent(this, 'click', toBlue);
	}

	function toBlue() {
		this.className = 'blue';
		addEvent(this, 'click', toRed);
	}
	
PS：当你单击很多很多次切换后，浏览器直接卡死，或者弹出一个错误：`too much recursion`(太多的递归)。主要的原因是，每次切换事件的时候，都保存下来，没有把无用的移除，导致越积越多，最后卡死。	
	
	function removeEvent(obj, type) {
		if (obj['on'] + type) obj['on' + type] = null; 		//删除事件处理函数
	}

以上的删除事件处理函数只不过是一刀切的删除了，这样虽然解决了卡死和太多递归的问题。但其他的事件处理函数也一并被删除了，导致最后得不到自己想要的结果。如果想要只删除指定的函数中的事件处理函数，那就需要遍历，查找。(这里就不做了)	
	
	
	




	
	
	
	