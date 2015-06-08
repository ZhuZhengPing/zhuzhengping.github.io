---
layout : post
title : "ajax jsonp"
category : jquery
duoshuo: true
date : 2015-5-18

---

####php jsonp文件

	<?php
		//这个文件是远程端：http://www.li.cc/jsonp2.php
		$_arr = array('a'=>1,'b'=>2,'c'=>3);
		$_result = json_encode($_arr);
		$_callback = $_GET['callback'];
		echo $_callback.$_result;
	?>

####ajax jsonp,获取远程数据

	// 跨域获取jsonp.php文件
	$.ajax({
		type:'post',
		url:'http://www.li.cc/jsonp.php?callback=?',
		dataType:'json',
		success:function(response,status,xhr){
			alert(response.a);
		}
	});

####ajax取值 jsonp,获取远程数据
	
	$.getJSON('http://www.li.cc/jsonp2.php?callback=?',function(response)){
		alert(response.a);
	}
	
####ajax 无callback
	
	// 跨域获取jsonp.php文件
	$.ajax({
		type:'post',
		url:'http://www.li.cc/jsonp.php',
		dataType:'jsonp',
		success:function(response,status,xhr){
			alert(response.a);
		}
	});
	
#### jqXHR
	
	var jqXHR = $.ajax({
		type:'post',
		url:'user.php',
		data:$('form).serialize()
	});
	//success 可能被取消，用done
	jqXHR.success(function(response)){
		
	};
	// 按照循序执行
	jqXHR.done(function(){
		alert(1);
	}).done(function(){
		alert(2);
	});
	var jqXHR = $.ajax('t1.php');
	var jqXHR2 = $.ajax('t2.php');
	$.when(jqXHR,jqXHR2).done(function(r1,r2){
		alert(r1[0]); // t1.php success,[object,object]
		alert(r2[0]); // t2.php success,[object,object]
	});
	
	
	



