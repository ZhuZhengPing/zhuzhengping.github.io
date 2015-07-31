---
layout : post
title : "javascript 运算符"
category : javascript
duoshuo: true
date : 2015-7-31

---

#### 运算符特殊示例

对象不设置valueOf 或toString ,计算出的结果为NaN

	var box = {
		toString:function(){
			return 1;
		};
	}
	
	// 1
	box ++;    

+号表示取正，-号表示取负, true 变成1 , false 或者 null 或者 '' 变成0
	
	// 100
	var box=100; +box;

	// -100
	var box=100; -box;

	// NaN 和NaN运算的都会变成NaN
	var box='ab'; -box;
	
和其他运算符一样，当关系运算符操作非数值时要遵循一下规则：

1.两个操作数都是数值，则数值比较；
2.两个操作数都是字符串，则比较两个字符串对应的字符编码值；
3.两个操作数有一个是数值，则将另一个转换为数值，再进行数值比较；
4.两个操作数有一个是对象，则先调用`valueOf()`方法或`toString()`方法，再用结果比较；

	var box = 3 > 2;					//true
	var box = 3 > 22;					//false
	var box = '3' > 22;					//false
	var box = '3' > '22';					//true
	var box = 'a' > 'b';					//false  a=97,b=98
	var box = 'a' > 'B';					//true	B=66
	var box = 1 > 对象;				//false，如果有toString()或valueOf()则返回1 > 返回数的值

== 比较的是值，===比较的是值和类型

	var box = '2' === 2	// false
	var box = '2' == 2	// true
	
	
	
	














	
	
	
	