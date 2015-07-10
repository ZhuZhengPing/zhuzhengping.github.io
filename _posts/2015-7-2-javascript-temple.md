---
layout : post
title : "javascript 封装类"
category : javascript
duoshuo: true
date : 2015-7-2

---

####一．basejs

	//前台调用
	var $ = function (args) {
		return new Base(args);
	}

	//基础库
	function Base(args) {
		//创建一个数组，来保存获取的节点和节点数组
		this.elements = [];
		
		if (typeof args == 'string') {
			//css模拟
			if (args.indexOf(' ') != -1) {
				var elements = args.split(' ');			//把节点拆开分别保存到数组里
				var childElements = [];					//存放临时节点对象的数组，解决被覆盖的问题
				var node = [];								//用来存放父节点用的
				for (var i = 0; i < elements.length; i ++) {
					if (node.length == 0) node.push(document);		//如果默认没有父节点，就把document放入
					switch (elements[i].charAt(0)) {
						case '#' :
							childElements = [];				//清理掉临时节点，以便父节点失效，子节点有效
							childElements.push(this.getId(elements[i].substring(1)));
							node = childElements;		//保存父节点，因为childElements要清理，所以需要创建node数组
							break;
						case '.' : 
							childElements = [];
							for (var j = 0; j < node.length; j ++) {
								var temps = this.getClass(elements[i].substring(1), node[j]);
								for (var k = 0; k < temps.length; k ++) {
									childElements.push(temps[k]);
								}
							}
							node = childElements;
							break;
						default : 
							childElements = [];
							for (var j = 0; j < node.length; j ++) {
								var temps = this.getTagName(elements[i], node[j]);
								for (var k = 0; k < temps.length; k ++) {
									childElements.push(temps[k]);
								}
							}
							node = childElements;
					}
				}
				this.elements = childElements;
			} else {
				//find模拟
				switch (args.charAt(0)) {
					case '#' :
						this.elements.push(this.getId(args.substring(1)));
						break;
					case '.' : 
						this.elements = this.getClass(args.substring(1));
						break;
					default : 
						this.elements = this.getTagName(args);
				}
			}
		} else if (typeof args == 'object') {
			if (args != undefined) {    //_this是一个对象，undefined也是一个对象，区别与typeof返回的带单引号的'undefined'
				this.elements[0] = args;
			}
		} else if (typeof args == 'function') {
			this.ready(args);
		}
	}

	//addDomLoaded
	Base.prototype.ready = function (fn) {
		addDomLoaded(fn);
	};

	//获取ID节点
	Base.prototype.getId = function (id) {
		return document.getElementById(id)
	};

	//获取元素节点数组
	Base.prototype.getTagName = function (tag, parentNode) {
		var node = null;
		var temps = [];
		if (parentNode != undefined) {
			node = parentNode;
		} else {
			node = document;
		}
		var tags = node.getElementsByTagName(tag);
		for (var i = 0; i < tags.length; i ++) {
			temps.push(tags[i]);
		}
		return temps;
	};

	//获取CLASS节点数组
	Base.prototype.getClass = function (className, parentNode) {
		var node = null;
		var temps = [];
		if (parentNode != undefined) {
			node = parentNode;
		} else {
			node = document;
		}
		var all = node.getElementsByTagName('*');
		for (var i = 0; i < all.length; i ++) {
			if ((new RegExp('(\\s|^)' +className +'(\\s|$)')).test(all[i].className)) {
				temps.push(all[i]);
			}
		}
		return temps;
	}

	//设置CSS选择器子节点
	Base.prototype.find = function (str) {
		var childElements = [];
		for (var i = 0; i < this.elements.length; i ++) {
			switch (str.charAt(0)) {
				case '#' :
					childElements.push(this.getId(str.substring(1)));
					break;
				case '.' : 
					var temps = this.getClass(str.substring(1), this.elements[i]);
					for (var j = 0; j < temps.length; j ++) {
						childElements.push(temps[j]);
					}
					break;
				default : 
					var temps = this.getTagName(str, this.elements[i]);
					for (var j = 0; j < temps.length; j ++) {
						childElements.push(temps[j]);
					}
			}
		}
		this.elements = childElements;
		return this;
	}

	//获取某一个节点，并返回这个节点对象
	Base.prototype.ge = function (num) {	
		return this.elements[num];
	};

	//获取首个节点，并返回这个节点对象
	Base.prototype.first = function () {
		return this.elements[0];
	};

	//获取末个节点，并返回这个节点对象
	Base.prototype.last = function () {
		return this.elements[this.elements.length - 1];
	};

	//获取某组节点的数量
	Base.prototype.length = function () {
		return this.elements.length;
	};

	//获取某一个节点的属性
	Base.prototype.attr = function (attr, value) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (arguments.length == 1) {
				return this.elements[i].getAttribute(attr);
			} else if (arguments.length == 2) {
				this.elements[i].setAttribute(attr, value);
			}
		}
		return this;
	};

	//获取某一个节点在整个节点组中是第几个索引
	Base.prototype.index = function () {
		var children = this.elements[0].parentNode.children;
		for (var i = 0; i < children.length; i ++) {
			if (this.elements[0] == children[i]) return i;
		}
	};

	//设置某一个节点的透明度
	Base.prototype.opacity = function (num) {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].style.opacity = num / 100;
			this.elements[i].style.filter = 'alpha(opacity=' + num + ')';
		}
		return this;
	};

	//获取某一个节点，并且Base对象
	Base.prototype.eq = function (num) {
		var element = this.elements[num];
		this.elements = [];
		this.elements[0] = element;
		return this;
	};

	//获取当前节点的下一个元素节点
	Base.prototype.next = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i] = this.elements[i].nextSibling;
			if (this.elements[i] == null) throw new Error('找不到下一个同级元素节点！');
			if (this.elements[i].nodeType == 3) this.next();
		}
		return this;
	};

	//获取当前节点的上一个元素节点
	Base.prototype.prev = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i] = this.elements[i].previousSibling;
			if (this.elements[i] == null) throw new Error('找不到上一个同级元素节点！');
			if (this.elements[i].nodeType == 3) this.prev();
		}
		return this;
	};

	//设置CSS
	Base.prototype.css = function (attr, value) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (arguments.length == 1) {
				return getStyle(this.elements[i], attr);
			}
			this.elements[i].style[attr] = value;
		}
		return this;
	}

	//添加Class
	Base.prototype.addClass = function (className) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (!hasClass(this.elements[i], className)) {
				this.elements[i].className += ' ' + className;
			}
		}
		return this;
	}

	//移除Class
	Base.prototype.removeClass = function (className) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (hasClass(this.elements[i], className)) {
				this.elements[i].className = this.elements[i].className.replace(new RegExp('(\\s|^)' +className +'(\\s|$)'), ' ');
			}
		}
		return this;
	}

	//添加link或style的CSS规则
	Base.prototype.addRule = function (num, selectorText, cssText, position) {
		var sheet = document.styleSheets[num];
		insertRule(sheet, selectorText, cssText, position);
		return this;
	}

	//移除link或style的CSS规则
	Base.prototype.removeRule = function (num, index) {
		var sheet = document.styleSheets[num];
		deleteRule(sheet, index);
		return this;
	}

	//设置表单字段元素
	Base.prototype.form = function (name) {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i] = this.elements[i][name];
		}
		return this;
	};

	//设置表单字段内容获取
	Base.prototype.value = function (str) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (arguments.length == 0) {
				return this.elements[i].value;
			}
			this.elements[i].value = str;
		}
		return this;
	}

	//设置innerHTML
	Base.prototype.html = function (str) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (arguments.length == 0) {
				return this.elements[i].innerHTML;
			}
			this.elements[i].innerHTML = str;
		}
		return this;
	}

	//设置innerText
	Base.prototype.text = function (str) {
		for (var i = 0; i < this.elements.length; i ++) {
			if (arguments.length == 0) {
				return getInnerText(this.elements[i]);
			}
			setInnerText(this.elements[i], text);
		}
		return this;
	}

	//设置事件发生器
	Base.prototype.bind = function (event, fn) {
		for (var i = 0; i < this.elements.length; i ++) {
			addEvent(this.elements[i], event, fn);
		}
		return this;
	};

	//设置鼠标移入移出方法
	Base.prototype.hover = function (over, out) {
		for (var i = 0; i < this.elements.length; i ++) {
			addEvent(this.elements[i], 'mouseover', over);
			addEvent(this.elements[i], 'mouseout', out);
		}
		return this;
	};

	//设置点击切换方法
	Base.prototype.toggle = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			(function (element, args) {
				var count = 0;
				addEvent(element, 'click', function () {
					args[count++ % args.length].call(this);
				});
			})(this.elements[i], arguments);
		}
		return this;
	};

	//设置显示
	Base.prototype.show = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].style.display = 'block';
		}
		return this;
	};

	//设置隐藏
	Base.prototype.hide = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].style.display = 'none';
		}
		return this;
	};

	//设置物体居中
	Base.prototype.center = function (width, height) {
		var top = (getInner().height - height) / 2 + getScroll().top;
		var left = (getInner().width - width) / 2 + getScroll().left;
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].style.top = top + 'px';
			this.elements[i].style.left = left + 'px';
		}
		return this;
	};

	//锁屏功能
	Base.prototype.lock = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			fixedScroll.top = getScroll().top;
			fixedScroll.left = getScroll().left;
			this.elements[i].style.width = getInner().width + getScroll().left + 'px';
			this.elements[i].style.height = getInner().height + getScroll().top + 'px';
			this.elements[i].style.display = 'block';
			parseFloat(sys.firefox) < 4 ? document.body.style.overflow = 'hidden' : document.documentElement.style.overflow = 'hidden';
			addEvent(this.elements[i], 'mousedown', predef);
			addEvent(this.elements[i], 'mouseup', predef);
			addEvent(this.elements[i], 'selectstart', predef);
			addEvent(window, 'scroll', fixedScroll);
		}
		return this;
	};

	Base.prototype.unlock = function () {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].style.display = 'none';
			parseFloat(sys.firefox) < 4 ? document.body.style.overflow = 'auto' : document.documentElement.style.overflow = 'auto';
			removeEvent(this.elements[i], 'mousedown', predef);
			removeEvent(this.elements[i], 'mouseup', predef);
			removeEvent(this.elements[i], 'selectstart', predef);
			removeEvent(window, 'scroll', fixedScroll);
		}
		return this;
	};

	//触发点击事件
	Base.prototype.click = function (fn) {
		for (var i = 0; i < this.elements.length; i ++) {
			this.elements[i].onclick = fn;
		}
		return this;
	};

	//触发浏览器窗口事件
	Base.prototype.resize = function (fn) {
		for (var i = 0; i < this.elements.length; i ++) {
			var element = this.elements[i];
			addEvent(window, 'resize', function () {
				fn();
				if (element.offsetLeft > getInner().width + getScroll().left - element.offsetWidth) {
					element.style.left = getInner().width + getScroll().left - element.offsetWidth + 'px';
					if (element.offsetLeft <= 0 + getScroll().left) {
						element.style.left = 0 + getScroll().left + 'px';
					}
				}
				if(element.offsetTop > getInner().height + getScroll().top - element.offsetHeight) {
					element.style.top = getInner().height + getScroll().top - element.offsetHeight + 'px';
					if (element.offsetTop <= 0 + getScroll().top) {
						element.style.top = 0 + getScroll().top + 'px';
					}
				}
			});
		}
		return this;
	};

	//设置动画
	Base.prototype.animate = function (obj) {
		for (var i = 0; i < this.elements.length; i ++) {
			var element = this.elements[i];
			var attr = obj['attr'] == 'x' ? 'left' : obj['attr'] == 'y' ? 'top' : 
						   obj['attr'] == 'w' ? 'width' : obj['attr'] == 'h' ? 'height' : 
						   obj['attr'] == 'o' ? 'opacity' : obj['attr'] != undefined ? obj['attr'] : 'left';

			
			var start = obj['start'] != undefined ? obj['start'] : 
							attr == 'opacity' ? parseFloat(getStyle(element, attr)) * 100 : 
													   parseInt(getStyle(element, attr));
			
			var t = obj['t'] != undefined ? obj['t'] : 10;												//可选，默认10毫秒执行一次
			var step = obj['step'] != undefined ? obj['step'] : 20;								//可选，每次运行10像素
			
			var alter = obj['alter'];
			var target = obj['target'];
			var mul = obj['mul'];
			
			var speed = obj['speed'] != undefined ? obj['speed'] : 6;							//可选，默认缓冲速度为6
			var type = obj['type'] == 0 ? 'constant' : obj['type'] == 1 ? 'buffer' : 'buffer';		//可选，0表示匀速，1表示缓冲，默认缓冲
			
			
			if (alter != undefined && target == undefined) {
				target = alter + start;
			} else if (alter == undefined && target == undefined && mul == undefined) {
				throw new Error('alter增量或target目标量必须传一个！');
			}
			
			
			
			if (start > target) step = -step;
			
			if (attr == 'opacity') {
				element.style.opacity = parseInt(start) / 100;
				element.style.filter = 'alpha(opacity=' + parseInt(start) +')';
			} else {
				//element.style[attr] = start + 'px';
			}
			
			
			if (mul == undefined) {
				mul = {};
				mul[attr] = target;
			} 
			

			clearInterval(element.timer);
			element.timer = setInterval(function () {
			
				/*
					问题1：多个动画执行了多个列队动画，我们要求不管多少个动画只执行一个列队动画
					问题2：多个动画数值差别太大，导致动画无法执行到目标值，原因是定时器提前清理掉了
					
					解决1：不管多少个动画，只提供一次列队动画的机会
					解决2：多个动画按最后一个分动画执行完毕后再清理即可
				*/
				
				//创建一个布尔值，这个值可以了解多个动画是否全部执行完毕
				var flag = true; //表示都执行完毕了
				
				
				for (var i in mul) {
					attr = i == 'x' ? 'left' : i == 'y' ? 'top' : i == 'w' ? 'width' : i == 'h' ? 'height' : i == 'o' ? 'opacity' : i != undefined ? i : 'left';
					target = mul[i];
						

					if (type == 'buffer') {
						step = attr == 'opacity' ? (target - parseFloat(getStyle(element, attr)) * 100) / speed :
															 (target - parseInt(getStyle(element, attr))) / speed;
						step = step > 0 ? Math.ceil(step) : Math.floor(step);
					}
					
					
					
					if (attr == 'opacity') {
						if (step == 0) {
							setOpacity();
						} else if (step > 0 && Math.abs(parseFloat(getStyle(element, attr)) * 100 - target) <= step) {
							setOpacity();
						} else if (step < 0 && (parseFloat(getStyle(element, attr)) * 100 - target) <= Math.abs(step)) {
							setOpacity();
						} else {
							var temp = parseFloat(getStyle(element, attr)) * 100;
							element.style.opacity = parseInt(temp + step) / 100;
							element.style.filter = 'alpha(opacity=' + parseInt(temp + step) + ')';
						}
						
						if (parseInt(target) != parseInt(parseFloat(getStyle(element, attr)) * 100)) flag = false;

					} else {
						if (step == 0) {
							setTarget();
						} else if (step > 0 && Math.abs(parseInt(getStyle(element, attr)) - target) <= step) {
							setTarget();
						} else if (step < 0 && (parseInt(getStyle(element, attr)) - target) <= Math.abs(step)) {
							setTarget();
						} else {
							element.style[attr] = parseInt(getStyle(element, attr)) + step + 'px';
						}
						
						if (parseInt(target) != parseInt(getStyle(element, attr))) flag = false;
					}
					
					//document.getElementById('test').innerHTML += i + '--' + parseInt(target) + '--' + parseInt(getStyle(element, attr)) + '--' + flag + '<br />';
					
				}
				
				if (flag) {
					clearInterval(element.timer);
					if (obj.fn != undefined) obj.fn();
				}
					
			}, t);
			
			function setTarget() {
				element.style[attr] = target + 'px';
			}
			
			function setOpacity() {
				element.style.opacity = parseInt(target) / 100;
				element.style.filter = 'alpha(opacity=' + parseInt(target) + ')';
			}
		}
		return this;
	};

	//插件入口
	Base.prototype.extend = function (name, fn) {
		Base.prototype[name] = fn;
	};

#### ajax插件

	//封装ajax
	function ajax(obj) {
		var xhr = (function () {
			if (typeof XMLHttpRequest != 'undefined') {
				return new XMLHttpRequest();
			} else if (typeof ActiveXObject != 'undefined') {
				var version = [
											'MSXML2.XMLHttp.6.0',
											'MSXML2.XMLHttp.3.0',
											'MSXML2.XMLHttp'
				];
				for (var i = 0; version.length; i ++) {
					try {
						return new ActiveXObject(version[i]);
					} catch (e) {
						//跳过
					}	
				}
			} else {
				throw new Error('您的系统或浏览器不支持XHR对象！');
			}
		})();
		obj.url = obj.url + '?rand=' + Math.random();
		obj.data = (function (data) {
			var arr = [];
			for (var i in data) {
				arr.push(encodeURIComponent(i) + '=' + encodeURIComponent(data[i]));
			}
			return arr.join('&');
		})(obj.data);
		if (obj.method === 'get') obj.url += obj.url.indexOf('?') == -1 ? '?' + obj.data : '&' + obj.data;
		if (obj.async === true) {
			xhr.onreadystatechange = function () {
				if (xhr.readyState == 4) {
					callback();
				}
			};
		}
		xhr.open(obj.method, obj.url, obj.async);
		if (obj.method === 'post') {
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send(obj.data);	
		} else {
			xhr.send(null);
		}
		if (obj.async === false) {
			callback();
		}
		function callback() {
			if (xhr.status == 200) {
				obj.success(xhr.responseText);			//回调传递参数
			} else {
				alert('获取数据错误！错误代号：' + xhr.status + '，错误信息：' + xhr.statusText);
			}	
		}
	}

#### 拖拽插件

	$().extend('drag', function () {
		var tags = arguments;
		for (var i = 0; i < this.elements.length; i ++) {
			addEvent(this.elements[i], 'mousedown', function (e) {
				if (trim(this.innerHTML).length == 0) e.preventDefault();
				var _this = this;
				var diffX = e.clientX - _this.offsetLeft;
				var diffY = e.clientY - _this.offsetTop;
				
				//自定义拖拽区域
				var flag = false;
				
				for (var i = 0; i < tags.length; i ++) {
					if (e.target == tags[i]) {
						flag = true;					//只要有一个是true，就立刻返回
						break;
					}
				}
				
				if (flag) {
					addEvent(document, 'mousemove', move);
					addEvent(document, 'mouseup', up);
				} else {
					removeEvent(document, 'mousemove', move);
					removeEvent(document, 'mouseup', up);
				}
				
				function move(e) {
					var left = e.clientX - diffX;
					var top = e.clientY - diffY;
					
					if (left < 0) {
						left = 0;
					} else if (left <= getScroll().left) {
						left = getScroll().left;
					} else if (left > getInner().width + getScroll().left - _this.offsetWidth) {
						left = getInner().width + getScroll().left - _this.offsetWidth;
					}
					
					if (top < 0) {
						top = 0;
					} else if (top <= getScroll().top) {
						top = getScroll().top;
					} else if (top > getInner().height + getScroll().top - _this.offsetHeight) {
						top = getInner().height + getScroll().top - _this.offsetHeight;
					}
					
					_this.style.left = left + 'px';
					_this.style.top = top + 'px';
					
					if (typeof _this.setCapture != 'undefined') {
						_this.setCapture();
					} 
				}
				
				function up() {
					removeEvent(document, 'mousemove', move);
					removeEvent(document, 'mouseup', up);
					if (typeof _this.releaseCapture != 'undefined') {
						_this.releaseCapture();
					}
				}
			});
		}
		return this;
	});

####表单序列化插件

	$().extend('serialize', function () {
		for (var i = 0; i < this.elements.length; i ++) {
			var form = this.elements[i];
			var parts = {};
			for (var i = 0; i < form.elements.length; i ++) {
				var filed = form.elements[i];
				switch (filed.type) {
					case undefined : 
					case 'submit' : 
					case 'reset' : 
					case 'file' : 
					case 'button' : 
						break;
					case 'radio' : 
					case 'checkbox' : 
						if (!filed.selected) break;
					case 'select-one' : 
					case 'select-multiple' :
						for (var j = 0; j < filed.options.length; j ++) {
							var option = filed.options[j];
							if (option.selected) {
								var optValue = '';
								if (option.hasAttribute) {
									optValue = (option.hasAttribute('value') ? option.value : option.text);
								} else {
									optValue = (option.attributes('value').specified ? option.value : option.text);
								}
								parts[filed.name] = optValue; 
							}
						}
						break;
					default :
						parts[filed.name] = filed.value;
				}
			}
			return parts;
		}
		return this;
	});

####工具插件

	//浏览器检测
	(function () {
		window.sys = {};
		var ua = navigator.userAgent.toLowerCase();	
		var s;		
		(s = ua.match(/msie ([\d.]+)/)) ? sys.ie = s[1] :
		(s = ua.match(/firefox\/([\d.]+)/)) ? sys.firefox = s[1] :
		(s = ua.match(/chrome\/([\d.]+)/)) ? sys.chrome = s[1] : 
		(s = ua.match(/opera\/.*version\/([\d.]+)/)) ? sys.opera = s[1] : 
		(s = ua.match(/version\/([\d.]+).*safari/)) ? sys.safari = s[1] : 0;
		
		if (/webkit/.test(ua)) sys.webkit = ua.match(/webkit\/([\d.]+)/)[1];
	})();

	//DOM加载
	function addDomLoaded(fn) {
		var isReady = false;
		var timer = null;
		function doReady() {
			if (timer) clearInterval(timer);
			if (isReady) return;
			isReady = true;
			fn();
		}
		
		if ((sys.opera && sys.opera < 9) || (sys.firefox && sys.firefox < 3) || (sys.webkit && sys.webkit < 525)) {
			//无论采用哪种，基本上用不着了
			/*timer = setInterval(function () {
				if (/loaded|complete/.test(document.readyState)) { 	//loaded是部分加载，有可能只是DOM加载完毕，complete是完全加载，类似于onload
					doReady();
				}
			}, 1);*/

			timer = setInterval(function () {
				if (document && document.getElementById && document.getElementsByTagName && document.body) {
					doReady();
				}
			}, 1);
		} else if (document.addEventListener) {//W3C
			addEvent(document, 'DOMContentLoaded', function () {
				fn();
				removeEvent(document, 'DOMContentLoaded', arguments.callee);
			});
		} else if (sys.ie && sys.ie < 9){
			var timer = null;
			timer = setInterval(function () {
				try {
					document.documentElement.doScroll('left');
					doReady();
				} catch (e) {};
			}, 1);
		}
	}

	//跨浏览器添加事件绑定
	function addEvent(obj, type, fn) {
		if (typeof obj.addEventListener != 'undefined') {
			obj.addEventListener(type, fn, false);
		} else {
			//创建一个存放事件的哈希表(散列表)
			if (!obj.events) obj.events = {};
			//第一次执行时执行
			if (!obj.events[type]) {	
				//创建一个存放事件处理函数的数组
				obj.events[type] = [];
				//把第一次的事件处理函数先储存到第一个位置上
				if (obj['on' + type]) obj.events[type][0] = fn;
			} else {
				//同一个注册函数进行屏蔽，不添加到计数器中
				if (addEvent.equal(obj.events[type], fn)) return false;
			}
			//从第二次开始我们用事件计数器来存储
			obj.events[type][addEvent.ID++] = fn;
			//执行事件处理函数
			obj['on' + type] = addEvent.exec;
		}
	}

	//为每个事件分配一个计数器
	addEvent.ID = 1;

	//执行事件处理函数
	addEvent.exec = function (event) {
		var e = event || addEvent.fixEvent(window.event);
		var es = this.events[e.type];
		for (var i in es) {
			es[i].call(this, e);
		}
	};

	//同一个注册函数进行屏蔽
	addEvent.equal = function (es, fn) {
		for (var i in es) {
			if (es[i] == fn) return true;
		}
		return false;
	}

	//把IE常用的Event对象配对到W3C中去
	addEvent.fixEvent = function (event) {
		event.preventDefault = addEvent.fixEvent.preventDefault;
		event.stopPropagation = addEvent.fixEvent.stopPropagation;
		event.target = event.srcElement;
		return event;
	};

	//IE阻止默认行为
	addEvent.fixEvent.preventDefault = function () {
		this.returnValue = false;
	};

	//IE取消冒泡
	addEvent.fixEvent.stopPropagation = function () {
		this.cancelBubble = true;
	};


	//跨浏览器删除事件
	function removeEvent(obj, type, fn) {
		if (typeof obj.removeEventListener != 'undefined') {
			obj.removeEventListener(type, fn, false);
		} else {
			if (obj.events) {
				for (var i in obj.events[type]) {
					if (obj.events[type][i] == fn) {
						delete obj.events[type][i];
					}
				}
			}
		}
	}


	//跨浏览器获取视口大小
	function getInner() {
		if (typeof window.innerWidth != 'undefined') {
			return {
				width : window.innerWidth,
				height : window.innerHeight
			}
		} else {
			return {
				width : document.documentElement.clientWidth,
				height : document.documentElement.clientHeight
			}
		}
	}

	//跨浏览器获取滚动条位置
	function getScroll() {
		return {
			top : document.documentElement.scrollTop || document.body.scrollTop,
			left : document.documentElement.scrollLeft || document.body.scrollLeft
		}
	}


	//跨浏览器获取Style
	function getStyle(element, attr) {
		var value;
		if (typeof window.getComputedStyle != 'undefined') {//W3C
			value = window.getComputedStyle(element, null)[attr];
		} else if (typeof element.currentStyle != 'undeinfed') {//IE
			value = element.currentStyle[attr];
		}
		return value;
	}


	//判断class是否存在
	function hasClass(element, className) {
		return element.className.match(new RegExp('(\\s|^)' +className +'(\\s|$)'));
	}


	//跨浏览器添加link规则
	function insertRule(sheet, selectorText, cssText, position) {
		if (typeof sheet.insertRule != 'undefined') {//W3C
			sheet.insertRule(selectorText + '{' + cssText + '}', position);
		} else if (typeof sheet.addRule != 'undefined') {//IE
			sheet.addRule(selectorText, cssText, position);
		}
	}

	//跨浏览器移出link规则
	function deleteRule(sheet, index) {
		if (typeof sheet.deleteRule != 'undefined') {//W3C
			sheet.deleteRule(index);
		} else if (typeof sheet.removeRule != 'undefined') {//IE
			sheet.removeRule(index);
		}
	}

	//跨浏览器获取innerText
	function getInnerText(element) {
		return (typeof element.textContent == 'string') ? element.textContent : element.innerText;
	}

	//跨浏览器设置innerText
	function setInnerText(elememt, text) {
		if (typeof element.textContent == 'string') {
			element.textContent = text;
		} else {
			element.innerText = text;
		}
	}

	//获取某一个元素到最外层顶点的位置
	function offsetTop(element) {
		var top = element.offsetTop;
		var parent = element.offsetParent;
		while (parent != null) {
			top += parent.offsetTop;
			parent = parent.offsetParent;
		}
		return top;
	}

	//删除左后空格
	function trim(str) {
		return str.replace(/(^\s*)|(\s*$)/g, '');
	}

	//某一个值是否存在某一个数组中
	function inArray(array, value) {
		for (var i in array) {
			if (array[i] === value) return true;
		}
		return false;
	}

	//获取某一个节点的上一个节点的索引
	function prevIndex(current, parent) {
		var length = parent.children.length;
		if (current == 0) return length - 1;
		return parseInt(current) - 1;
	}

	//获取某一个节点的下一个节点的索引
	function nextIndex(current, parent) {
		var length = parent.children.length;
		if (current == length - 1) return 0;
		return parseInt(current) + 1;
	}

	//滚动条固定
	function fixedScroll() {
		window.scrollTo(fixedScroll.left, fixedScroll.top);
	}

	//阻止默认行为
	function predef(e) {
		e.preventDefault();
	}

	//创建cookie
	function setCookie(name, value, expires, path, domain, secure) {
		var cookieText = encodeURIComponent(name) + '=' + encodeURIComponent(value);
		if (expires instanceof Date) {
			cookieText += '; expires=' + expires;
		}
		if (path) {
			cookieText += '; expires=' + expires;
		}
		if (domain) {
			cookieText += '; domain=' + domain;
		}
		if (secure) {
			cookieText += '; secure';
		}
		document.cookie = cookieText;
	}

	//获取cookie
	function getCookie(name) {
		var cookieName = encodeURIComponent(name) + '=';
		var cookieStart = document.cookie.indexOf(cookieName);
		var cookieValue = null;
		if (cookieStart > -1) {
			var cookieEnd = document.cookie.indexOf(';', cookieStart);
			if (cookieEnd == -1) {
				cookieEnd = document.cookie.length;
			}
			cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
		}
		return cookieValue;
	}

	//删除cookie
	function unsetCookie(name) {
		document.cookie = name + "= ; expires=" + new Date(0);
	}

####json插件

	/*
    json2.js
    2012-10-08

    Public Domain.

    NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

    See http://www.JSON.org/js.html


    This code should be minified before deployment.
    See http://javascript.crockford.com/jsmin.html

    USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
    NOT CONTROL.


    This file creates a global JSON object containing two methods: stringify
    and parse.

        JSON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    return this.getUTCFullYear()   + '-' +
                         f(this.getUTCMonth() + 1) + '-' +
                         f(this.getUTCDate())      + 'T' +
                         f(this.getUTCHours())     + ':' +
                         f(this.getUTCMinutes())   + ':' +
                         f(this.getUTCSeconds())   + 'Z';
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a =
	/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
						if (a) {
							return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
								+a[5], +a[6]));
						}
					}
					return value;
				});

				myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
					var d;
					if (typeof value === 'string' &&
							value.slice(0, 5) === 'Date(' &&
							value.slice(-1) === ')') {
						d = new Date(value.slice(5, -1));
						if (d) {
							return d;
						}
					}
					return value;
				});


		This is a reference implementation. You are free to copy, modify, or
		redistribute.
	*/

	/*jslint evil: true, regexp: true */

	/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
		call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
		getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
		lastIndex, length, parse, prototype, push, replace, slice, stringify,
		test, toJSON, toString, valueOf
	*/


	// Create a JSON object only if one does not already exist. We create the
	// methods in a closure to avoid creating global variables.

	if (typeof JSON !== 'object') {
		JSON = {};
	}

	(function () {
		'use strict';

		function f(n) {
			// Format integers to have at least two digits.
			return n < 10 ? '0' + n : n;
		}

		if (typeof Date.prototype.toJSON !== 'function') {

			Date.prototype.toJSON = function (key) {

				return isFinite(this.valueOf())
					? this.getUTCFullYear()     + '-' +
						f(this.getUTCMonth() + 1) + '-' +
						f(this.getUTCDate())      + 'T' +
						f(this.getUTCHours())     + ':' +
						f(this.getUTCMinutes())   + ':' +
						f(this.getUTCSeconds())   + 'Z'
					: null;
			};

			String.prototype.toJSON      =
				Number.prototype.toJSON  =
				Boolean.prototype.toJSON = function (key) {
					return this.valueOf();
				};
		}

		var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
			gap,
			indent,
			meta = {    // table of character substitutions
				'\b': '\\b',
				'\t': '\\t',
				'\n': '\\n',
				'\f': '\\f',
				'\r': '\\r',
				'"' : '\\"',
				'\\': '\\\\'
			},
			rep;


		function quote(string) {

	// If the string contains no control characters, no quote characters, and no
	// backslash characters, then we can safely slap some quotes around it.
	// Otherwise we must also replace the offending characters with safe escape
	// sequences.

			escapable.lastIndex = 0;
			return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
				var c = meta[a];
				return typeof c === 'string'
					? c
					: '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
			}) + '"' : '"' + string + '"';
		}


		function str(key, holder) {

	// Produce a string from holder[key].

			var i,          // The loop counter.
				k,          // The member key.
				v,          // The member value.
				length,
				mind = gap,
				partial,
				value = holder[key];

	// If the value has a toJSON method, call it to obtain a replacement value.

			if (value && typeof value === 'object' &&
					typeof value.toJSON === 'function') {
				value = value.toJSON(key);
			}

	// If we were called with a replacer function, then call the replacer to
	// obtain a replacement value.

			if (typeof rep === 'function') {
				value = rep.call(holder, key, value);
			}

	// What happens next depends on the value's type.

			switch (typeof value) {
			case 'string':
				return quote(value);

			case 'number':

	// JSON numbers must be finite. Encode non-finite numbers as null.

				return isFinite(value) ? String(value) : 'null';

			case 'boolean':
			case 'null':

	// If the value is a boolean or null, convert it to a string. Note:
	// typeof null does not produce 'null'. The case is included here in
	// the remote chance that this gets fixed someday.

				return String(value);

	// If the type is 'object', we might be dealing with an object or an array or
	// null.

			case 'object':

	// Due to a specification blunder in ECMAScript, typeof null is 'object',
	// so watch out for that case.

				if (!value) {
					return 'null';
				}

	// Make an array to hold the partial results of stringifying this object value.

				gap += indent;
				partial = [];

	// Is the value an array?

				if (Object.prototype.toString.apply(value) === '[object Array]') {

	// The value is an array. Stringify every element. Use null as a placeholder
	// for non-JSON values.

					length = value.length;
					for (i = 0; i < length; i += 1) {
						partial[i] = str(i, value) || 'null';
					}

	// Join all of the elements together, separated with commas, and wrap them in
	// brackets.

					v = partial.length === 0
						? '[]'
						: gap
						? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
						: '[' + partial.join(',') + ']';
					gap = mind;
					return v;
				}

	// If the replacer is an array, use it to select the members to be stringified.

				if (rep && typeof rep === 'object') {
					length = rep.length;
					for (i = 0; i < length; i += 1) {
						if (typeof rep[i] === 'string') {
							k = rep[i];
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				} else {

	// Otherwise, iterate through all of the keys in the object.

					for (k in value) {
						if (Object.prototype.hasOwnProperty.call(value, k)) {
							v = str(k, value);
							if (v) {
								partial.push(quote(k) + (gap ? ': ' : ':') + v);
							}
						}
					}
				}

	// Join all of the member texts together, separated with commas,
	// and wrap them in braces.

				v = partial.length === 0
					? '{}'
					: gap
					? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
					: '{' + partial.join(',') + '}';
				gap = mind;
				return v;
			}
		}

	// If the JSON object does not yet have a stringify method, give it one.

		if (typeof JSON.stringify !== 'function') {
			JSON.stringify = function (value, replacer, space) {

	// The stringify method takes a value and an optional replacer, and an optional
	// space parameter, and returns a JSON text. The replacer can be a function
	// that can replace values, or an array of strings that will select the keys.
	// A default replacer method can be provided. Use of the space parameter can
	// produce text that is more easily readable.

				var i;
				gap = '';
				indent = '';

	// If the space parameter is a number, make an indent string containing that
	// many spaces.

				if (typeof space === 'number') {
					for (i = 0; i < space; i += 1) {
						indent += ' ';
					}

	// If the space parameter is a string, it will be used as the indent string.

				} else if (typeof space === 'string') {
					indent = space;
				}

	// If there is a replacer, it must be a function or an array.
	// Otherwise, throw an error.

				rep = replacer;
				if (replacer && typeof replacer !== 'function' &&
						(typeof replacer !== 'object' ||
						typeof replacer.length !== 'number')) {
					throw new Error('JSON.stringify');
				}

	// Make a fake root object containing our value under the key of ''.
	// Return the result of stringifying the value.

				return str('', {'': value});
			};
		}


	// If the JSON object does not yet have a parse method, give it one.

		if (typeof JSON.parse !== 'function') {
			JSON.parse = function (text, reviver) {

	// The parse method takes a text and an optional reviver function, and returns
	// a JavaScript value if the text is a valid JSON text.

				var j;

				function walk(holder, key) {

	// The walk method is used to recursively walk the resulting structure so
	// that modifications can be made.

					var k, v, value = holder[key];
					if (value && typeof value === 'object') {
						for (k in value) {
							if (Object.prototype.hasOwnProperty.call(value, k)) {
								v = walk(value, k);
								if (v !== undefined) {
									value[k] = v;
								} else {
									delete value[k];
								}
							}
						}
					}
					return reviver.call(holder, key, value);
				}


	// Parsing happens in four stages. In the first stage, we replace certain
	// Unicode characters with escape sequences. JavaScript handles many characters
	// incorrectly, either silently deleting them, or treating them as line endings.

				text = String(text);
				cx.lastIndex = 0;
				if (cx.test(text)) {
					text = text.replace(cx, function (a) {
						return '\\u' +
							('0000' + a.charCodeAt(0).toString(16)).slice(-4);
					});
				}

	// In the second stage, we run the text against regular expressions that look
	// for non-JSON patterns. We are especially concerned with '()' and 'new'
	// because they can cause invocation, and '=' because it can cause mutation.
	// But just to be safe, we want to reject all unexpected forms.

	// We split the second stage into 4 regexp operations in order to work around
	// crippling inefficiencies in IE's and Safari's regexp engines. First we
	// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
	// replace all simple value tokens with ']' characters. Third, we delete all
	// open brackets that follow a colon or comma or that begin the text. Finally,
	// we look to see that the remaining characters are only whitespace or ']' or
	// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

				if (/^[\],:{}\s]*$/
						.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
							.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
							.replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

	// In the third stage we use the eval function to compile the text into a
	// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
	// in JavaScript: it can begin a block or an object literal. We wrap the text
	// in parens to eliminate the ambiguity.

					j = eval('(' + text + ')');

	// In the optional fourth stage, we recursively walk the new structure, passing
	// each name/value pair to a reviver function for possible transformation.

					return typeof reviver === 'function'
						? walk({'': j}, '')
						: j;
				}

	// If the text is not JSON parseable, then a SyntaxError is thrown.

				throw new SyntaxError('JSON.parse');
			};
		}
	}());

















	
	
	
	