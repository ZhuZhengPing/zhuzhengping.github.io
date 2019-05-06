---
layout: post
title:  "数组"
date:   2017-01-06 16:32:18 +0800
categories: javascript
tags: javascript
author: 扣扣
---

* content
{:toc}

## 概念 

数组是一组可储存很多值的javascript数据类型

```js
var scores = [60,50,'koukou',58,53,52,50,54];
```










### 数组索引

索引从0开始，以此类推

### 如何访问数组

```js
// scores:数组
// 2:索引位置
// flavorOfTheDay:声明变量接受scores[2]的值
var flavorOfTheDay = scores[2];
```

### 修改数组

```js
// 原来是 58，修改后是 朱本利
scores[3]='朱本利';
```

### 数组的长度

```js
var numFlavors = scores.length;
```

数组包含8个元素，因此scores.length=8，最大索引是7

### 迭代数组（while）

```js
var scores=[60,50,35,56];
var output;
var i=0;

// 循环迭代数组在控制台显示数组元素

while(i<scores.length){
	conput="Bubble solution #"+i+"score:"+scores[i];
	console.log(output);
	i=i+1;
}
```

### 迭代数组（for）

```js

//var i =0这是第一部分：初始化循环变量，i<scores.length这是第二部分：条件测试；i++(i=i+1)这是第三部分：将计数器加1.
//console.log 这是在控制台显示
for(var i =0; i<scores.length;i++){
	output="Bubble solution #"+i+"score:"+scores[i];
	console.log(output);
}
```

### i=i+1;i=i-1

>* i=i+1可以快捷的办法i++
>* b i=i-1可以快捷的办法i--

### 最大值，最小值，平均值

```js

var scores=[60,50,3,35,24,56];
// 平均值
var highScore=0;
//最大值
var zuidazhi=0;
//最小值
var zuixiaozhi=9999;

var output;
 
for ( var i=0;i<scores.length;i++){
 	highScore=highScore+scores[i];
	// 求最大值  
	if(scores[i]>zuidazhi){
		zuidazhi=scores[i];
    }
	else if (scores[i]<zuixiaozhi){
		zuixiaozhi=scores[i];
    }
}

console.log("平均值:" +highScore/scores.length);
console.log("最大值"+zuidazhi);
console.log("最小值"+zuixiaozhi);

```













