---
layout : post
title : "ajax学习2"
category : jquery
duoshuo: true
date : 2015-5-18

---

####ajax
	
	<form action="user.php">
		用户名：<input type="text" name="user" />
		邮件：<input type="text" name="email" />
		<input type="radio" name="sex" value="男" />男
		<input type="radio" name="sex" value="女" />女
		<input type="button" value="提交" />
	</form>
	$('form input[type=button]').click(function(){
		// 第一种方式
		$.ajax({
			type:"POST",
			url:"user.php",
			data:{
				url:$('form input[name=user]').val(),
				url:$('form input[name=user]').val()
			},
			success:function(){
			
			}
		});
		// 第二种
		$.ajax({
			type:"POST",
			url:'user.php',
			//字符串形式的键值对，并且对URL编码
			data:$('form').serialize(),  
			success:function(response,status,xhr){
				$("#box").html(response)
			}
		});
		// 第三种 初始化重复的属性，写了以后不需要设置参数
		$.ajaxSetup({
			type:'post',
			url:'user.php',
			data:$('form').serialize();
		});
		// 设置了$.ajaxSetup ajax不需要设置重复的参数
		$.ajax({
			success:function(response,status,xhr){
			}
		});
		// 第四种
		$.ajax({
			type:'post',
			url:'user.php',
			data:$.param({
				user:$('form input[name=user]').val(),
				email:$('form input[name=email]').val()
			}),
		});
	})

#### decodeURIComponent 解码
	
	// checkbox serialize
	// decodeURIComponent 解码
	$('form input[name=sex]').click(function(){
		$("#box").html(decodeURIComponent($(this).serialize()));
		// 打印 {name:"sex",value:"男"}
		console.log($(this).serializeArray());
		var json = $(this).serializeArray();
		$(#box).html(json[0].value);
	});
	
#### ajax 加载图片显示
	
	 <span class="loading">正在加载中</span>
	 $(document).ajaxStart(function(){
		$(".loading").show();
	 }).ajaxStop(function(){
		$(this).hide();
	 });
	 // 超时
	 $.ajax({
		timeout:3000,
		// 不触发全局事件 不触发正在加载中
		global:false,
		// 错误处理
		error:function(xhr,errorText,errorStatus){
		
		}
	 });
	 // 自定义error
	 $.post('test.php').error(function(xhr,status,errortext){
	 }).success(function(){
		alert('请求成功后')
	})
	 .complete(function(){
		alert('请求成功后');
	 });
	 //全局错误
	 $(document).ajaxError(function(event,xhr,setting,errorText){
		alert(event.type);
		alert(event.tag);
		for(var i in event){
			document.white((i+'<br />'));
		}
		alert(setting);
		for(var i in setting){
			document.white(i+'<br />');
		}
		alert(errorText);
		// 成功后（全局）
		.ajaxSuccess();
		// 完成后，不管成功与否
		.ajaxComplete();
		// 发送请求之前
		.ajaxSend()();
	 }).ajaxSuccess(function(){alert('发送之前')})
	 .ajaxComplete(function(){alert('请求完成')})
	 .ajaxSend(function(){alert('请求发送前')});
	
####ajax json

	$.ajax({
		type:'post',
		url:'test.json', // 如果是json文件，默认为json
		datatype:'json',
		success:function(response,status,error){
			alert(response);
		}
	});
	
	
	
	
	
	
	
	



