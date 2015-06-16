---
layout : post
title : "面向对象与原型"
category : html
duoshuo: true
date : 2015-6-16

---

####一．创建对象
	
`ECMAScript`有两种开发模式：1.函数式(过程化)，2.面向对象(OOP)。面向对象的语言有一个标志，那就是类的概念，而通过类可以创建任意多个具有相同属性和方法的对象。但是，`ECMAScript`没有类的概念，因此它的对象也与基于类的语言中的对象有所不同。

创建一个对象，然后给这个对象新建属性和方法。

	var box = new Object();					//创建一个Object对象
	box.name = 'Lee';						//创建一个name属性并赋值
	box.age = 100;							//创建一个age属性并赋值
	box.run = function () {					//创建一个run()方法并返回值
		return this.name + this.age + '运行中...';
	};
	alert(box.run());						//输出属性和方法的值

上面创建了一个对象，并且创建属性和方法，在`run()`方法里的`this`，就是代表`box`对象本身。这种是`JavaScript`创建对象最基本的方法，但有个缺点，想创建一个类似的对象，就会产生大量的代码。	
	
	var box2 = box;						//得到box的引用
	box2.name = 'Jack';						//直接改变了name属性
	alert(box2.run());						//用box.run()发现name也改变了

	var box2 = new Object();
	box2.name = 'Jack';
	box2.age = 200;
	box2.run = function () {
		return this.name + this.age + '运行中...';
	};
	alert(box2.run());						//这样才避免和box混淆，从而保持独立

为了解决多个类似对象声明的问题，我们可以使用一种叫做工厂模式的方法，这种方法就是为了解决实例化对象产生大量重复的问题。	
	
	function createObject(name, age) {		//集中实例化的函数
		var obj = new Object();
		obj.name = name;
		obj.age = age;
		obj.run = function () {
			return this.name + this.age + '运行中...';
		};
		return obj;
	}

	var box1 = createObject('Lee', 100);		//第一个实例
	var box2 = createObject('Jack', 200);		//第二个实例
	alert(box1.run());
	alert(box2.run());						//保持独立

工厂模式解决了重复实例化的问题，但还有一个问题，那就是识别问题，因为根本无法搞清楚他们到底是哪个对象的实例。	
	
	alert(typeof box1);						//Object
	alert(box1 instanceof Object);				//true

`ECMAScript`中可以采用构造函数(构造方法)可用来创建特定的对象。类型于`Object`对象。	
	
	function Box(name, age) {				//构造函数模式
		this.name = name;
		this.age = age;
		this.run = function () {
			return this.name + this.age + '运行中...';
		};
	}

	var box1 = new Box('Lee', 100);			//new Box()即可
	var box2 = new Box('Jack', 200);
	alert(box1.run());
	alert(box1 instanceof Box);				//很清晰的识别他从属于Box

使用构造函数的方法，即解决了重复实例化的问题，又解决了对象识别的问题，但问题是，这里并没有`new Object()`，为什么可以实例化`Box()`，这个是哪里来的呢？
使用了构造函数的方法，和使用工厂模式的方法他们不同之处如下：

1. 构造函数方法没有显示的创建对象`(new Object())`；
2. 直接将属性和方法赋值给`this`对象；
3. 没有`renturn`语句。

构造函数的方法有一些规范：
1.函数名和实例化构造名相同且大写，(PS：非强制，但这么写有助于区分构造函数和普通函数)；
2.通过构造函数创建对象，必须使用`new`运算符。

既然通过构造函数可以创建对象，那么这个对象是哪里来的，`new Object()`在什么地方执行了？执行的过程如下：
1.当使用了构造函数，并且`new` 构造函数()，那么就后台执行了`new Object()`；
2.将构造函数的作用域给新对象，(即`new Object()`创建出的对象)，而函数体内的`this`就代表`new Object()`出来的对象。
3.执行构造函数内的代码；
4.返回新对象(后台直接返回)。

关于`this`的使用，`this`其实就是代表当前作用域对象的引用。如果在全局范围`this`就代表`window`对象，如果在构造函数体内，就代表当前的构造函数所声明的对象。
	
	var box = 2;
	alert(this.box);							//全局，代表window

构造函数和普通函数的唯一区别，就是他们调用的方式不同。只不过，构造函数也是函数，必须用`new`运算符来调用，否则就是普通函数。	
	
	var box = new Box('Lee', 100);			//构造模式调用
	alert(box.run());

	Box('Lee', 20);							//普通模式调用，无效

	var o = new Object();					
	Box.call(o, 'Jack', 200)					//对象冒充调用
	alert(o.run());			

探讨构造函数内部的方法(或函数)的问题，首先看下两个实例化后的属性或方法是否相等。	
	
	ar box1 = new Box('Lee', 100);			//传递一致
	var box2 = new Box('Lee', 100);			//同上

	alert(box1.name == box2.name);			//true，属性的值相等
	alert(box1.run == box2.run);				//false，方法其实也是一种引用地址
	alert(box1.run() == box2.run());			//true，方法的值相等，因为传参一致

可以把构造函数里的方法(或函数)用`new Function()`方法来代替，得到一样的效果，更加证明，他们最终判断的是引用地址，唯一性。	
	
	function Box(name, age) {				//new Function()唯一性
		this.name = name;
		this.age = age;
		this.run = new Function("return this.name + this.age + '运行中...'");
	}

我们可以通过构造函数外面绑定同一个函数的方法来保证引用地址的一致性，但这种做法没什么必要，只是加深学习了解：

	function Box(name, age) {
		this.name = name;
		this.age = age;
		this.run = run;
	}

	function run() {						//通过外面调用，保证引用地址一致
		return this.name + this.age + '运行中...';
	}

虽然使用了全局的函数`run()`来解决了保证引用地址一致的问题，但这种方式又带来了一个新的问题，全局中的`this`在对象调用的时候是`Box`本身，而当作普通函数调用的时候，`this`又代表`window`。

####三．原型

我们创建的每个函数都有一个`prototype`(原型)属性，这个属性是一个对象，它的用途是包含可以由特定类型的所有实例共享的属性和方法。逻辑上可以这么理解：`prototype`通过调用构造函数而创建的那个对象的原型对象。使用原型的好处可以让所有对象实例共享它所包含的属性和方法。也就是说，不必在构造函数中定义对象信息，而是可以直接将这些信息添加到原型中。

	function Box() {}							//声明一个构造函数
	Box.prototype.name = 'Lee';					//在原型里添加属性
	Box.prototype.age = 100;					
	Box.prototype.run = function () {				//在原型里添加方法
		return this.name + this.age + '运行中...';
	};

比较一下原型内的方法地址是否一致：

	var box1 = new Box();
	var box2 = new Box();
	alert(box1.run == box2.run);					//true，方法的引用地址保持一致

在原型模式声明中，多了两个属性，这两个属性都是创建对象时自动生成的。`__proto__`属性是实例指向原型对象的一个指针，它的作用就是指向构造函数的原型属性`constructor`。通过这两个属性，就可以访问到原型里的属性和方法了。

PS：IE浏览器在脚本访问`__proto__`会不能识别，火狐和谷歌浏览器及其他某些浏览器均能识别。虽然可以输出，但无法获取内部信息。	
	
	alert(box1.__proto__);						//[object Object]
	
判断一个对象是否指向了该构造函数的原型对象，可以使用`isPrototypeOf()`方法来测试。	
	
	alert(Box.prototype.isPrototypeOf(box));		//只要实例化对象，即都会指向
	
原型模式的执行流程：

1. 先查找构造函数实例里的属性或方法，如果有，立刻返回；
2. 如果构造函数实例里没有，则去它的原型对象里找，如果有，就返回；
	
虽然我们可以通过对象实例访问保存在原型中的值，但却不能访问通过对象实例重写原型中的值。	
	
	var box1 = new Box();
	alert(box1.name);							//Lee，原型里的值
	box1.name = 'Jack';
	alert(box.1name);							//Jack，就近原则，

	var box2 = new Box();						
	alert(box2.name);							//Lee，原型里的值，没有被box1修改

如果想要box1也能在后面继续访问到原型里的值，可以把构造函数里的属性删除即可，具体如下：	
	
	
	
	
	
	
	
	
	
	
	
	
	