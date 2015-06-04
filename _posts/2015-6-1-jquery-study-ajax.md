---
layout : post
title : "jquery学习"
category : jquery
duoshuo: true
date : 2015-5-18

---

####ajax load,一般作为静态文件处理
	
	 <input type='button' text='异步加载' />
	 <div id='box'></div>
	 $('input').click(function(){
		// 只显示了class为url的数据
		$('#box').load('test.html .url');
	 });
	 //get
	$('input').click(function(){
		$('box').load('test.php?url=ycku');
	});
	// post
	$('input').load('test.php',{user:'loulou'});
	// post
	$('input').load('test.php',{user:'loulou'},function(response,status,xhr){
		alert(response);
		if(status == 'success')
			alert(status);
		// 对象
		alert(xhr);
		// responseText就是response
		xhr.responseText;  
		// 200 400 500 
		xhr.status;
		// OK
		xhr.statusText;
	});

####$.get和$.post

	<input type='button' text='异步加载' />
	 <div id='box'></div>
	 $('input').click(function(){
		//url传参
		$.get('test.php?url=ycku',function(response,status,xhr){
			$('#box').html(response);
		});
		// 通过第二个参数，字符串形式的传参
		$.get('test.php','url=ycku',function(response,status,xhr){
			$('#box').html(response);
		});
		// 通过对象传参
		$.get('test.php',{url:'ycku'},function(response,status,xhr){
			$('#box').html(response);
		});
		
		//url传参 无效，不能使用？传参
		$.post('test.php?url=ycku',function(response,status,xhr){
			$('#box').html(response);
		});
		
		//url使用字符串形式的传参
		$.post('test.php','url=ycku',function(response,status,xhr){
			$('#box').html(response);
		});
		
		// url使用对象的形式传参
		$.post('test.php',{url:'ycku.com'},function(response,status,xhr){
			$('#box').html(response);
		});
	 });
	
	
	
####jquery 冒泡行为

	$("input").click(function(){
		alert('input');
	});
	$("div").click(function(){
		alert('div');
	});
	$(document).click(function(){
		alert('document');
	});
	// 点击 input  弹出input
	// 点击 div 弹出 div input
	// 点击 document 弹出 document div input
	$("input").click(function(e){
		e.preventDefault();
		alert('input');
	});
	$("div").click(function(e){
		e.preventDefault();
		alert('div');
	});
	$(document).click(function(e){
		e.preventDefault();
		alert('document');
	});
	// 阻止冒泡
	
####阻止默认行为

	<a href="www.baidu.com">点击</a>
	$("a").click(function(){
		// 阻止默认行为，不跳转
		e.preventDefault();
		// 阻止冒泡
		e.stopPropagation();
		alert('ycku.com');
		// 直接阻止默认行为
		return false;
	});
	<form action='www.baidu.com'>
		<input type='submit' />
	</form>
	$('input').click(function(e){
		// 阻止默认行为
		e.preventDefault();
	});
	$('form').submit(function(e){
		e.preventDefault();
	});

####jquery 事件模拟操作

	$('input').click(function(){
		alert('我将要模拟操作')
	});
	// 模拟用户点击操作
	$("input").trigger('click');
	
	// 网页打开调用一次
	// trigger 只有一条的时候可以省略中括号，多个不能省略
	$('input').click(function(e,data1,data2,data3,data4){
		alert(data1+"|"+data2+"|"+data3+"|"+data4);
	}).trigger('click',['123','abc',['a','b','c'],{user:'lee'}]);
	
	
	$('input').bind('click',{user:'lee'},function(e,data1,data2,data3,data4){
		alert(data1+"|"+data2+"|"+data3+"|"+data4+"|"+e.data.user);
	}).trigger('click',['123','abc',['a','b','c'],{user:'lee'}]);
	
####jquery自定义事件
	
	// 加载时执行
	$('input').bind('myEvent',function(){
		alert('自定义事件');
	}).trigger('myEvent');
	
	// trigger简写
	$('input').bind('myEvent',function(){
		alert('自定义事件');
	}).click();
	
	// triggerHandler('click');
	$('input').bind('myEvent',function(){
		alert('自定义事件');
	}).triggerHandler('click');
	
	
	
	
	
	
	
	



