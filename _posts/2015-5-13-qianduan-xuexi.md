---
layout : post
title : "css截取字符串"
category : css3
duoshuo: true
date : 2015-5-13
excerpt: css截取字符串，截取字符串，JavaScript截取字符串
---

####css截取字符串

	.custom_name{
	   display: block;
	   width: 100%; /*设置内容宽度*/
	   overflow: hidden;/*隐藏溢出的文本*/
	   white-space: nowrap;/*让文本不换行*/
	   -o-text-overflow: ellipsis;/*Opera下实现ellipsis效果*/
	   text-overflow: ellipsis;/*Safari，IE下实现ellipsis效果*/
				font-size: 1.1rem;
	}
	@-moz-document url-prefix(){	/*@-moz-document url-perfix(){}是firefox的一个独有属性，只有firefox浏览器能识别，也可以说是一种hack*/
	   .custom_name {
		 max-width: 100%;/* 在FF下改变内容宽度，用来放置:after增加的内容(...)*/
	   }
	 }
	 @-moz-document url-prefix(){	
	   /*利用:after增加(...)省略符*/
	   .custom_name:after {
		  float: left;/*设置浮动*/
		  width: 100%;/*省略符宽度*/
		  padding-left: 5px;/*省略符内距，用来拉开内容之间的距离*/
		  color: #000;
	   }
	 }

---
	 
####css截图
	
	<img src='imgs/player_run.png' style='position:absolute; clip:rect(0,72px,72px,0px)' />
	
####图片放大

	<!doctype html>
	<html lan='en'>
		<head>
			<meta charset='utf-8'>
			<title>图片放大</title>
			<script type='text/javascript'>
				var img1,img2,dd;
				window.onload=function(){
					img1=document.getElementById('img1');
					img2=document.getElementById('img2');
					dd=document.getElementById('dd');
					img1.addEventListener("mouseover",function(){
						dd.style.display='block';
						var mouseX = event.clientX;
						var mouseY = event.clientY;
						dd.style.left = mouseX - 50 +"px";
						dd.style.top = mouseY - 50 + "px";
						var rtop = mouseY -10 - 30;
						var rleft = mouseX -10 -50;
						var rwidth = rleft+100;
						var rheight=rtop+60;
						img2.style.clip="rect("+rtop+"px "+rwidth+" px"+rheight+"px "+rleft+"px";
						img2.style.zoom=2;
						img2.style.left=(510-2*mouseX)/2+60+"px";
						img2.style.top=10-mouseY+40+"px";
					},true);
					img2.addEventListener("mouseout",function(){
						dd.style.display='none';
					},true);
				}
			</script>
		</head>
		<body>
			<img src='img/img1.jpg' style='position:absolute' />
			<img src='img/img1.jpg' style='left:510px; position:absolute'/>
			<div id='dd' style='position:absolute;left:20px;top:20px;'></div>
		</body>
	</html>




