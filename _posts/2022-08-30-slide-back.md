---
layout: post
title:  "左拉返回"
date:   2022-08-30 16:32:18 +0800
categories: javascript
tags: javascript
author: Zhengping Zhu
---

* content
{:toc}

# 学习要点

左拉后退

注意，这个控件如果设置到body上，一定要把body的高度设置为100%，要不然会触发不了





















# javascript代码

```javascript
;
(function(app) {
    'use strict';

    var cancelStatus, backBtn;
    app.registerSlideBack = function (dom, cb) {
        new function (dom, callback) {
            var pan1, pan2, cancel, flag;
            dom.addEventListener('touchstart', touchStart, false);
            dom.addEventListener('touchmove', touchMove, false);
            dom.addEventListener('touchend', touchEnd, false);
            dom.addEventListener('touchcancel', touchEnd, false);
            backBtn = document.createElement('DIV');

            var i = document.createElement('I');
            backBtn.id = 'back-view';
            i.className = 'icon icon-back';
            backBtn.appendChild(i);
            dom.appendChild(backBtn);

            function touchStart(e) {
                pan1 = e.touches[0];
            }

            function touchMove(e) {
                if (cancel || !pan1 || cancelStatus) {
                    return false;
                }
                pan2 = e.touches[0];
                if (window.innerWidth - pan2.pageX < 10) {
                    touchEnd(e);
                    return false;
                }
                if (!flag && (pan1.pageY - pan2.pageY > 15 || pan2.pageY - pan1.pageY > 15)) {
                    cancel = true;
                    return false;
                }
                if (!flag && pan2.pageX - pan1.pageX > 15) {
                    flag = true;
                }
                if (pan1.pageX > pan2.pageX) {
                    pan1 = pan2;
                }
                if (flag) {
                    var x = pan2.pageX - pan1.pageX;
                    x = x < 0 ? 0 : Math.min(x, 100);
                    backBtn.style.top = 'calc(-21% + ' + pan1.clientY + 'px)';
                    backBtn.style.width = x + 'px';
                    backBtn.style.left = -x / 2 + 'px';
                }
            }

            function touchEnd(e) {
                cancel = false;
                if (!flag) {
                    return false;
                }
                flag = false;
                if (pan2.pageX - pan1.pageX > 100) {
                    callback();
                }
                backBtn.style.transition = 'all .3s ease';
                backBtn.style.webkitTransition = 'all .3s ease';
                backBtn.style.width = '0';
                backBtn.style.left = '0';
                setTimeout(function () {
                    backBtn.style.transition = 'none';
                    backBtn.style.webkitTransition = 'none';
                }, 300);
            }
        }(dom, cb);
    }

})(window);

```

# css代码
```css
body #back-view {
	position: fixed;
	z-index: 9999;
	height: 42%;
	background-color: rgba(239, 77, 26, 0.86);
    color: white;
	font-size: 32px;
	display: flex;
	display: -webkit-flex;
	align-items: center;
	-webkit-align-items: center;
	justify-content: flex-end;
	-webkit-justify-content: flex-end;
	border-radius: 0 100% 100% 0;
	width: 0;
	left: 0;
	top: 0;
}

body #back-view i {
	position: absolute;
    text-align: center;
	width: 50px;
	height: 50px;
}
```


# 调用方式

```javascript
registerSlideBack(document.body, function () {
	location.href = history.go(-1);
})
```