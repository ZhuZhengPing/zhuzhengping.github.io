---
layout : post
title : "常用的正则表达式验证"
category : javascript
duoshuo: true
date : 2014-10-18
excerpt: 正则表达式，常用的正则，JavaScript 语法检查校验，JavaScript 验证
---

####1.检查输入手机号码
	function checkMobile(s){
		var regu =/^[1][3|5|8][0-9]{9}$/;
		var re = new RegExp(regu);
		if (re.test(s)) {
			return true;
		}else{
			return false;
		}
	}

####2.只能输入数字，一般用于textbox的onkeypress

	function JustNumberText(){
		if (event.keyCode < 48 || event.keyCode > 57)
			event.returnValue = false;
	}
	
####3.检查输入的身份证号是否正确

	function checkCard(str) {
		//15位数身份证正则表达式
		var arg1 = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$/;
		//18位数身份证正则表达式
		var arg2 = /^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[A-Z])$/;
		if (str.match(arg1) == null && str.match(arg2) == null) {
			return false;
		}
		else {
			return true;
		}
	}
	
####4.检查输入的字符是否具有特殊字符

	function checkQuote(str) {
		var items = new Array("~", "`", "!", "@", "#", "$", "%", "^", "&", "*", "{", "}", "[", "]", "(", ")");
		items.push(":", ";", "'", "|", "\\", "<", ">", "?", "/", "<<", ">>", "||", "//");
		items.push("admin", "administrators", "administrator", "管理员", "系统管理员");
		items.push("select", "delete", "update", "insert", "create", "drop", "alter", "trancate");
		str = str.toLowerCase();
		for (var i = 0; i < items.length; i++) {
			if (str.indexOf(items[i]) >= 0) {
				return true;
			}
		}
		return false;
	}
	
####5.判断输入的字符是否为中文

	function IsChinese(str){       
		if(str.length!=0){    
			reg=/^[\u0391-\uFFE5]+$/;    
			if(reg.test(str)){    
				return true;  
			}
			return false;		
		}
	}  

####6.判断输入的EMAIL格式是否正确

	function IsEmail(str){     
		if(str.length!=0){    
			var reg=/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;    
			if(reg.test(str)){    
			 return true;
			}
			return false;
		}    
	}	
	
####7.用户名可以由字母、数字、下划线和中文组成，以中文或字母开头，长度为6-16位

	function checkusr(textstr){
		var reg=/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9_\u4E00-\u9FA5]{5,15}$/;
		if(reg.test(textstr))
			return true;
		else 
			return false;
	}





