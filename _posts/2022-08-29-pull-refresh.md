---
layout: post
title:  "下拉刷新"
date:   2022-08-29 16:32:18 +0800
categories: javascript
tags: refresh
author: Zhengping Zhu
---

* content
{:toc}

## 学习要点

>* 移动端下拉刷新





















### javascript代码

```javascript
(function(app) {
    'use strict';

    app.akdPullRefresh = function() {
        var loading = false,
            touched = false;
        var dom, refreshBlock;
        var panStart, panMove;
        var doRefresh, readyRefresh, overRefresh;
        var oy = 0,
            ot = 0;
        var topHeight = 0;
        this.init = function(scrollView, height) {
            topHeight = height;
            initBlock();
            initEvent(scrollView);
            return {
                ready: function(callback) {
                    readyRefresh = callback;
                }
            }
        }

        function initBlock() {
            dom = document.createElement('DIV');
            dom.className = 'pull-refresh-block';
            dom.style.top = topHeight + 'px';
            dom.innerHTML = '<i class="pull-refresh-loading loading"></i>';
            refreshBlock = dom.querySelector('.pull-refresh-loading');
            document.body.appendChild(dom);
        }

        function initEvent(scrollView) {
            document.addEventListener('touchmove', function(e) {
                if (panStart || !scrollView.scrollTop) {
                    startTouch(e, scrollView);
                }
            }, false);

            document.addEventListener('touchend', function(e) {
                endTouch(e);
            }, false);
        }

        function startTouch(e, scrollView) {
            if (loading) return;
            if(oy > 10) scrollView.scrollTop = 0;
            touched = true;
            panStart = panStart || e.touches[0];
            panMove = e.touches[0];
            oy = (panMove.clientY - panStart.clientY) / 2;
            ot = oy * 3;
            refreshBlock.style.transform = 'rotate(' + ot + 'deg)';
            oy = Math.min(oy, 70);
            refreshBlock.style.top = oy - 50 + 'px';
        }

        function endTouch(e) {
            if (loading) return;
            loading = true;
            touched = false;
            panStart = undefined;
            if (oy === 70) {
                refreshBlock.classList.add('rotate');
                readyRefresh && readyRefresh(overRefresh);
            } else {
                doOver();
            }
        }

        function overRefresh(state) {
            refreshBlock.classList.remove('rotate');
            refreshBlock.classList.remove('loading');
            switch (state) {
                case akdPullRefresh.STATES.SUCCESS:
                    refreshBlock.classList.add('ok');
                    setTimeout(function() {
                        doOver();
                    }, 1000);
                    break;
                case akdPullRefresh.STATES.FAIL:
                    refreshBlock.classList.add('error');
                    setTimeout(function() {
                        doOver();
                    }, 1000);
                    break;
            }
        }

        function doOver() {
            oy -= 2;
            ot -= 5;
            if (oy > 0) {
                refreshBlock.style.top = oy - 50 + 'px';
                refreshBlock.style.transform = 'rotate(' + ot + 'deg)';
                requestAnimationFrame(doOver);
            } else {
                refreshBlock.classList.remove('ok');
                refreshBlock.classList.remove('error');
                refreshBlock.classList.add('loading');
                loading = false;
                oy = 0;
                ot = 0;
            }
        }
    }

    app.akdPullRefresh.STATES = {
        SUCCESS: 1,
        FAIL: 2
    }
})(window)
```

### css代码
```css
.pull-refresh-block {
    position: fixed;
    z-index: 999;
    pointer-events: none;
    overflow: hidden;
    left: 0;
    bottom: 0;
    width: 100%;
    text-align: center;
    box-sizing: border-box;
}

.pull-refresh-loading {
    box-sizing: inherit;
    position: absolute;
    display: inline-block;
    width: 42px;
    height: 42px;
    background-color: #6C9EE2;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    left: 50%;
    top: -50px;
    margin-left: -21px;
}

.pull-refresh-loading.loading:after {
    box-sizing: inherit;
    position: absolute;
    content: '';
    width: 32px;
    height: 32px;
    left: 5px;
    top: 5px;
    border: solid 5px white;
    border-radius: 50%;
    -webkit-border-radius: 50%;
    border-right-color: transparent;
}

.pull-refresh-loading.rotate {
    animation: rotate 1s infinite linear;
    -webkit-animation: rotate .8s infinite linear;
}

.pull-refresh-loading.ok {
    background-color: lightseagreen;
    transform: rotate(0) !important;
    -webkit-transform: rotate(0) !important;
}

.pull-refresh-loading.ok:after {
    position: absolute;
    content: '';
    left: 36%;
    top: 20%;
    display: inline-block;
    color: white;
    width: 8px;
    height: 16px;
    border-color: white;
    border-style: solid;
    border-width: 0 4px 4px 0;
    transform: rotate(40deg);
    text-align: center;
}


.pull-refresh-loading.error {
    background-color: orangered;
    transform: rotate(0) !important;
    -webkit-transform: rotate(0) !important;
}

.pull-refresh-loading.error:after {
    position: absolute;
    border: none;
    content: '';
    background-size: cover;
    display: inline-block;
    color: white;
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
    top: 19px;
    left: 11px;
    width: 20px;
    height: 1px;
    border-top: 4px solid #fff;
}

.pull-refresh-loading.error:before {
    -moz-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    -webkit-transform: rotate(45deg);
    transform: rotate(45deg);
    content: "";
    position: absolute;
    top: 19px;
    left: 11px;
    width: 20px;
    height: 1px;
    border-top: 4px solid #fff;
}

@keyframes rotate{
    from{transform: rotate(0);}
    to{transform: rotate(360deg);}
}

@-webkit-keyframes rotate{
    from{-webkit-transform: rotate(0);}
    to{-webkit-transform: rotate(360deg);}
}
```


### 调用方式

```javascript
<script type="text/javascript">
	new akdPullRefresh().init(document.body, 50).ready(function (overRefresh) {
		testFunction(function (flag) {
			overRefresh(flag ? akdPullRefresh.STATES.SUCCESS : akdPullRefresh.STATES.FAIL);
		});
	});

	function  testFunction(callback) {
		setTimeout(function () {
			callback(1);
		},1000);
	}
</script>
```