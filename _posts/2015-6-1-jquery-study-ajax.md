---
layout : post
title : "jquery学习"
category : jquery
duoshuo: true
date : 2015-5-18

---

####ajax
	
	 <input type='button' text='异步加载' />
	 <div id='box'></div>
	 $('input').click(function(){
		// 只显示了class为url的数据
		$('#box').load('test.html .url');
	 });
	$('input').click(function(){
		$('box').load('test.php?url=ycku');
	});
	 
	 
	
	
	



