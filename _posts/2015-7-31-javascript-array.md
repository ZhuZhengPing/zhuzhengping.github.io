---
layout : post
title : "javascript 数组"
category : javascript
duoshuo: true
date : 2015-7-31

---

#### 数组实例

	var box = ['李炎恢', 28, '计算机编程'];			//字面量声明
	alert(box.shift());							//移除数组开头元素，并返回移除的元素
	alert(box.unshift('盐城','江苏'));				//数组开头添加两个元素
	alert(box.reverse());						//逆向排序方法，返回排序后的数组
	alert(box.sort());							//从小到大排序，返回排序后的数组	
	
	var box2 = box.concat('计算机编程');			//创建新数组，并添加新元素
	var box2 = box.slice(1);						//box.slice(1,3)，2-4之间的元素
	var box2 = box.splice(0,2);					//截取前两个元素
	var box2 = box.splice(1,0,'计算机编程','江苏');	//没有截取，但插入了两条
	var box2 = box.splice(1,1,100);				//截取了第2条，替换成100
	
	
	
	














	
	
	
	