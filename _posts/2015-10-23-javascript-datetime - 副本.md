---
layout : post
title : "javascript 日期计算"
category : mvc
duoshuo: true
date : 2015-10-23

---

####日期格式化

	Date.prototype.toString = function(){
		return this.getFullYear() + "-" + ((this.getMonth() + 1) < 10 ? "0" : "")+(this.getMonth()+1) +"-"+(this.getDate() < 10 ? "0" : "")+this.getDate();
	}
	
####常用的日期（昨天，本周，上周，本月，上月，本年）

	function selectDate(type) {
		var time = new Date(), beginDate, endDate;
		switch (type) {
			case "tsday": // 昨天
				$("#choose li[title=tsday]").addClass("active");
				time.setDate(time.getDate() - 1);
				beginDate = time.toString();
				endDate = time.toString();
				break;
			case "tsweek": // 本周
				$("#choose li[title=tsweek]").addClass("active");
				time.setDate(time.getDate() - time.getDay() + 1);
				beginDate = time.toString();
				time.setDate(time.getDate() + 6);
				endDate = time.toString();
				break;
			case "lsweek": // 上周
				$("#choose li[title=lsweek]").addClass("active");
				time.setDate(time.getDate() - 7 - time.getDay() + 1);
				beginDate = time.toString();
				time.setDate(time.getDate() + 6);
				endDate = time.toString();
				break;
			case "tsmonth": // 本月
				$("#choose li[title=tsmonth]").addClass("active");
				time.setDate(1);
				beginDate = time.toString();
				time.setMonth(time.getMonth() + 1);
				time.setDate(0);
				endDate = time.toString();
				break;
			case "lsmonth":  // 上月
				$("#choose li[title=lsmonth]").addClass("active");
				time.setMonth(time.getMonth()-1);
				time.setDate(1);
				beginDate = time.toString();
				time.setMonth(time.getMonth() + 1);
				time.setDate(0);
				endDate = time.toString();
				break;
			case "tsyear": // 本年
				$("#choose li[title=lsyear]").addClass("active");
				time.setMonth(0);
				time.setDate(1);
				beginDate = time.toString();
				time.setMonth(12);
				time.setDate(0);
				endDate = time.toString();
				break;
			case "lsyear": // 上年
				$("#choose li[title=lsyear]").addClass("active");
				time.setYear(time.getYear()-1);
				time.setMonth(0);
				time.setDate(1);
				beginDate = time.toString();
				time.setMonth(12);
				time.setDate(0);
				endDate = time.toString();
				break;
		}
	}

####获得某个日期距离今天的天数

	function getDayDistance(d) {
		var today = new Date();
		var timeold = (today.getTime() - d.getTime());
		var msPerDay = 24 * 60 * 60 * 1000;
		return Math.floor(timeold / msPerDay);
	}
	
#### 格式化日期

	function formatDate(d, fmt) { //author: meizz   
		if (!d) {
			return '';
		}
		d = new Date(d);
		var o = {
			"M+": d.getMonth() + 1,
			"d+": d.getDate(),
			"h+": d.getHours(),
			"m+": d.getMinutes(),
			"s+": d.getSeconds(),
			"q+": Math.floor((d.getMonth() + 3) / 3),
			"S": d.getMilliseconds()
		};
		if (/(y+)/.test(fmt))
			fmt = fmt.replace(RegExp.$1, (d.getFullYear() + "").substr(4 - RegExp.$1.length));
		for (var k in o)
			if (new RegExp("(" + k + ")").test(fmt))
				fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}
	
####获得某个日期距离今天的天数

	function getDayDistance(d) {
		var today = new Date();
		var timeold = (today.getTime() - d.getTime());
		var msPerDay = 24 * 60 * 60 * 1000;
		return Math.floor(timeold / msPerDay);
	}

####隐藏微信右上角按钮

	if (typeof WeixinJSBridge == "undefined") {
		if (document.addEventListener) {
			document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
		} else if (document.attachEvent) {
			document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
			document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
		}
	} else {
		onBridgeReady();
	}
		
	function onBridgeReady() {
		WeixinJSBridge.call('hideOptionMenu');
	}
	
	