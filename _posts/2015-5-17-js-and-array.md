---
layout : post
title : "JS对象和数组"
category : javascript
duoshuo: true
date : 2015-5-13

---

####数组操作

	var arr = ['green','red','yellow'];
	arr.push('black');  //从尾部追加
	arr.pop();		    //从尾部取出 	
	arr.shift(); 		//从头部取出元素
	arr.unshift('white'); //从头部插入
	arr.splice(0,1,'orange'); //任意位置删除插入操作
	
####冒泡排序
	
	var arr = [9,8,1,5,4,7,3,10,2,6];
	for(var i=1,len=arr.length; i<len;i++){
		for(var j=i+1;j<len;j++){
			if(arr[i]>arr[j]){
				var temp = arr[i];
				arr[i] = arr[j];
				arr[j] = temp;
			}
		}
	}

####插入排序

	var arr = [9,8,1,5,4,7,3,10,2,6];
	var arrSort = [];
	arrSort[0] = arr[0];
	for(var i=1,len=arr.length,flag=0;i<len;i++){
		for(var j=0,flag=0,sortLen = arrSort.length;j<sortLen;j++){
			if(arr[i] < arrSort[j]){
				arrSort.splice(j,0,arr[i]);
				flag=1;
				break;
			}
		}
		if(flag == 0){
			arrSort.push(arr[i]);
		}
	}
	
####二分法排序

	var arr = [9,8,1,5,4,7,3,10,2,6];
	var nArr = [];
	nArr[0]=arr[0];
	for(var i=0,len=arr.length,left=0,right=0,point=0;i<len;i++){
		for(var j =0,left=0,nLen=nArr.length,right=nLen;j<nLen;j++){
			point = Math.floor((left+right)/2);
			if(nArr[point]<arr[i]){
				left=point+1;
			}else{
				right=point;
			}
			if(left==right){
				nArr.splice(left,0,arr[i]);
				break;
			}
		}
	}
	
####js构造函数 使用new来调用 ，首字母大写
	function work(){
		return 'koukou';
	}
	
	function Box(username,age){
		this.username=name;    //实例属性
		this.age=age;
		this.run=function(){	// 实例方法
			return this.username+this.age+"运行中...";
		};
		this.work=work;
	};
	var box1 = new Box('Lee',100);    // 实例化后地址为1
	var box2 = new Box('Jack',200);   // 实例化后地址为2
	var box3 = new Desk('kkk',300);
	
	alert(box1 instanceof Box); // true
	alert(box2 instanceof Box); // true
	alert(box3 instanceof Box); // false
	alert(box1.run() == box1.run()); // true
	alert(box1.run()( == box2.run()); // false 引用类型
	alert(box1.work == box2.work); // true
	alert(box1.name); // Lee
	
####js 对象工厂
	function createObj(username,age){
		var box = new Object);
		box.username='Lee';
		box.age = 100;
		box.run=function(){
			return this.username+this.age+'运行中';
		}
		return box;
	};
	var box1 = createObj('koukou',1);
	var box2 = createObj('zhuzhengping',2);
	var o = new Object();
	Box.call(o,'Lee',100);  //对象冒充
	alert(o.run());

####prototype 共享属性和方法
	
	function Box(){}   // 构造函数不放东西
	Box.prototype.name = 'Lee';  // 原型属性
	Box.prototype.age = 100;     // 原型属性
	Box.prototype.run = function(){ //原型方法
		return this.name + this.age + '运行中...';
	};
	
####如果是实例方法，不同的实例化，他们的方法地址是不一样的

####如果是原型方法，那么他们的地址是共享的，大家都一样

	var box1 = new Box();
	var box2 = new Box();
	alert(box1.prototype);  // 这是一个属性，访问不到
	alert(box1.run == box2 .run);  //true
	alert(box1.constructor);
	alert(box1.hasOwnProperty('name')) //判断实例中是否存在
	alert('name' in box1);  // 不管实例属性和原型属性，有就返回true
	
####判断只有原型中有的属性
	
	function isiProperty(object,property){
		retirm !object.hasOwnProperty(property)&&(property in object)
	}
	
####原型自变量创建方法
	
	function BOX(){
	}
	// 使用字面的方式创建原型对象，这里的{}就是对象
	BOX.property={
		name:'Lee',
		age:1000,
		run:function(){
			return this.name+this.age+"允许中。。。";
		};
	}; 	
	
####数组操作
	
	var box = [21,2,3,14,1,2];
	alert(box.sort());
	// 查看sort是否是Array原型的方法
	alert(Array.prototype.sort); // true
	alert(String.prototype.substring); //true
	//扩展
	String.prototype.addString=function(){
		return this+",被添加了！";
	}
	
####原型缺点
	
	function Box(){}
	Box.prototype={
		constructor:Box,
		name:'Lee',
		age:100,
		family:['哥哥','姐姐','妹妹'],
		run:function(){
			return this.name + this.age + '运行中';
		}
	};
	var box1 = new Box();
	alert(box1.family);
	box1.family.push('弟弟');
	alert(box1.family);
	var box2 = new Box();
	alert(box2.family);  //共享了box1添加后的引用类型的原型
	
####组合构造函数+原型模式

	function Box(name,age,family){
		this.name=name;
		this.age=age;
		this.family=['哥哥','姐姐','妹妹'];
	}
	Box.prototype.run=function(){  // 保持共享的用原型
		return this.name+this.age+this.family;
	};
	var box1 = new Box('Lee',100);
	alert(box1.run());
	var box2 = new Box('Jack',200);
	alert(box2.run());  //引用类型没有使用原型，没有共享
	
####动态原型模式，可以将原型封装在够着函数里面

	function Box(name,age,family){
		this.name=name;
		this.age=age;
		this.family=['哥哥','姐姐','妹妹'];
		// 这里多次调用，多次绑定，只需要第一次初始化
		if(typeof this.run != 'function'){
			Box.prototype.run=function(){
				return this.name+this.age+this.family;
			}
		} 		
	}
	
####寄生构造函数

	function Box(name,age){
		var obj = new Object();
		obj.name=name;
		obj.age=age;
		obj.run=function(){
			return this.name+this.age+'运行中...';
		}
		return obj;
	}
	var box1 = new Box('koukou',22);
	var box1 = new Box('kk',33);
	
	
	
	
	
	
	
	
	
	
