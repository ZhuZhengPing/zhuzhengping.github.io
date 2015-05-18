---
layout : post
title : "html学习笔记"
category : html
duoshuo: true
date : 2015-5-17

---

####数组操作

	var arr = ['green','red','yellow'];
	
	arr.push('black');
	
	arr.pop();			
	
	arr.shift(); 
	
	arr.unshift('white');
	
	arr.splice(0,1,'orange');
	
####Object对象

	var obj = {};
	obj.id=1;
	obj["name"] = "koukou";
	for(var key in obj){
		/**
		id=1,name=koukou
		*/ 
		alert(key+"="+obj[key]);
	}
	

	

