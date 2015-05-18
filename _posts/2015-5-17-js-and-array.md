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
	
	
	
	
	
	
	
	
