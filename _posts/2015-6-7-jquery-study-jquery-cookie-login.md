---
layout : post
title : "ajax login"
category : jquery
duoshuo: true
date : 2015-6-7

---

####jquery 动画

	$(function(){
		$('.show').click(function(){
			// display:inline; 内链
			$("#box").show(1000);
		})
		$('.hide').click(function(){
			$("#box").hide(1000);
		})
		$('.show').click(function(){
			// 200毫秒
			$("#box").show('fast');
		})
		$('.hide').click(function(){
			// 600毫秒
			$("#box").hide('slow');
		})
		$('.hide').click(function(){
			// 默认400毫秒
			$("#box").hide('normal');
		})
	})
	
####列队动画
	
	$('.show').click(function(){
		$(("#box")).show('slow',function(){
			$('.test').eq(1).show('slow',function(){
				$('.test').eq(2).show('slow',function(){
					// 嵌套显示
					$('.test').eq(3).show('slow');
				})
			})
		})
	})
	// 简单显示
	$('.show').click(function(){
		$('.test').first().show('fast',function testFunction(){
			$(this).next().show('fast',testFunction)
		})
	})
	
####toggle显示

	<input type='button' class='toggle' value='切换' />
	$('.toggle').toggle('slow');
	
####滑动
	
	<input type='button' class='up' value='上' />
	<input type='button' class='down' value='下' />
	<input type='button' class='toggle' value='切换' />
	$('.up').slideUp('slow');
	$('.down').slideDown('slow');
	// 全自动
	$('.toggle').click(function(){
		$("#box").slideToggle('slow');
	})
	
####淡入淡出

	<input type='button' class='in' value='上' />
	<input type='button' class='out' value='下' />
	<input type='button' class='toggle' value='切换' />
	$('.out').click(function(){
		$("#box").fadeOut('slow');
	})
	$('.in').click(function(){
		$("#box").fadeIn('slow');
	})
	// 自动切换
	$('.toggle').click(function(){
		$("#box").fadeToggle('slow');
	})
	

















