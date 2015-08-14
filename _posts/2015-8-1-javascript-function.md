---
layout : post
title : "javascript 函数"
category : javascript
duoshuo: true
date : 2015-8-1

---

#### call与apply

	function box(num1, num2) {
		return num1 + num2;					//原函数
	}

	function sayBox(num1, num2) {
		return box.apply(this, [num1, num2]);		//this表示作用域，这里是window
	}										//[]表示box所需要的参数

	function sayBox2(num1, num2) {
		return box.apply(this, arguments);			//arguments对象表示box所需要的参数
	}

	alert(sayBox(10,10));						//20
	alert(sayBox2(10,10));						//20

`call()`方法于`apply()`方法相同，他们的区别仅仅在于接收参数的方式不同。对于`call()`方法而言，第一个参数是作用域，没有变化，变化只是其余的参数都是直接传递给函数的。

	function box(num1, num2) {
		return num1 + num2;
	}

	function callBox(num1, num2) {
		return box.call(this, num1, num2);			//和apply区别在于后面的传参
	}

	alert(callBox(10,10));

事实上，传递参数并不是`apply()`和`call()`方法真正的用武之地；它们经常使用的地方是能够扩展函数赖以运行的作用域。

	var color = '红色的';					//或者window.color = '红色的';也行

	var box = {
		color : '蓝色的'
	};

	function sayColor() {
		alert(this.color);
	}

	sayColor();							//作用域在window

	sayColor.call(this);						//作用域在window
	sayColor.call(window);					//作用域在window
	sayColor.call(box);						//作用域在box，对象冒充
	
这时我们应该采用`instanceof`运算符来查看。当使用`instanceof`检查基本类型的值时，它会返回`false`。

	var box = [1,2,3];
	alert(box instanceof Array);					//是否是数组
	var box2 = {};
	alert(box2 instanceof Object);					//是否是对象
	var box3 = /g/;
	alert(box3 instanceof RegExp);				//是否是正则表达式
	var box4 = new String('Lee');
	alert(box4 instanceof String);					//是否是字符串对象

javascript执行环境及作用域
	
	var box = 'blue';						//声明一个全局变量
	function setBox() {
		alert(box);							//全局变量可以在函数里访问
	}
	setBox();								//执行函数

全局的变量和函数，都是window对象的属性和方法。

	var box = 'blue';
	function setBox() {
		alert(window.box);						//全局变量即window的属性
	}
	window.setBox();							//全局函数即window的方法

函数体内还包含着函数，只有这个函数才可以访问内一层的函数。

	var box = 'blue';
	function setBox() {
		function setColor() {
			var b = 'orange';
			alert(box);
			alert(b);
		}
		setColor();							//setColor()的执行环境在setBox()内
	}
	setBox();

没有块级作用域

	if (true) {									//if语句代码块没有局部作用域
		var box = 'Lee';
	}
	alert(box);

`for`循环语句也是如此

	for (var i = 0; i < 10; i ++) {					//没有局部作用域
		var box = 'Lee';
	}
	alert(i);
	alert(box);
















	
	