---
layout : post
title : "javascript继承"
category : javascript
duoshuo: true
date : 2015-5-18

---

####继承，通过原型链实现

	function Box(){		// 被继承的函数
		this.name='Lee';
	}
	function Desk(){ // 子类
		this.age = 100;
	}
	function Table(){	// 孙子
		this.level='AAAA';
	}
	// 通过原型链继承，超类型实例化后的对象实例，赋值给子类型
	// new Box()会把Box的属性继承过来
	// Desk的原型，得到的Box
	Desk.prototype=new Box();
	var desk = new Desk();
	alert(desk.name);
	// 继承Desk
	Table.prototype=new Desk();
	var table = new Desk();
	alert(table.name);
	
####继承关系
	
	function Box(){		// 被继承的函数
		this.name='Lee';
	}
	Box.prototype.name='Jack';
	function Desk(){
		this.age=100;
	}
	Desk.prototype=new Box();
	var desk = new Desk();
	alert(desk.name);   // Lee 就近原则，实例里有，就返回，没有找原型
	alert(desk instanceof Object); //true
	alert(desk instanceof Desk); // true
	alert(box instanceof Desk); // false
	
####对象冒充

	function Box(name,age){		// 被继承的函数
		this.name=name;
		this.age=age;
		this.family=['gege','jiejie','meimei']; // 引用类型放在构造中共享
	}
	Box.prototype.family='家庭';
	function Desk(name,age){
		// 只能继承构造函数中的信息
		Box.call(this,name,age); 
	}
	var desk = new Desk('koukou',11);
	alert(desk.name);
	alert(desk.family);
	
####构造函数里的方法，放在构造里，每次实例化，都会分配一个内存地址，所以最好放到原型里面
	
	function Box(name,age){		// 被继承的函数
		this.name=name;
		this.age=age;
		this.family=['gege','jiejie','meimei']; // 引用类型放在构造中共享
	}
	Box.prototype.run = function(){
		return this.name+this.age+this.family;
	};
	function Desk(name,age){
		// 只能继承构造函数中的信息
		Box.call(this,name,age); 
	}
	// 继承原型里的方法
	Desk.prototype.run = new Box();
	var desk=new Desk(100);
	alert(desk.run());
	
####临时中转函数
	function obj(o){ // o表示将要传递进入的一个对象
		function F(){} //F构造是一个临时新建的对象，用于存储传递过来的对象
		F.prototype=o; //将o对象实例赋值给F构造的原型对象
		return new F(); // 最后返回的到传递过来的对象实例
	}
	// F.prototype=o 其实就相当余Desk.prototype=Box
	//这里字面量的声明方式，相当于var box = new Box();
	var box = {
		name:'Lee',
		age:100,
		family:['哥哥','jiejie','meimei']
	};
	// box1就等于new F()
	var box1 = obj(box);
	alert(box1.name);
	box1.family.push('didi');
	alert(box1.family);
	
	var box2 = obj((box);
	alert(box2.family); // 引用类型的属性共享了box

####寄生式继承 = 原型式 + 工厂式

	// 临时中转函数
	function obj(o){ // o表示将要传递进入的一个对象
		function F(){} //F构造是一个临时新建的对象，用于存储传递过来的对象
		F.prototype=o; //将o对象实例赋值给F构造的原型对象
		return new F(); // 最后返回的到传递过来的对象实例
	}
	// 寄生函数
	function create(o){
		var f = obj(o);
		// 扩展
		f.run = function(){
			f.run=function(){
				return this.name+'方法。。。';
			};
		}
		return f;
	}
	var box = {
		name:'Lee',
		age:100,
		family:['哥哥','jiejie','meimei']
	};
	alert(box1.run());

####寄生组合继承
	
	



