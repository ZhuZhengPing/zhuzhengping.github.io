---
layout: post
title:  "select和radio联动"
date:   2016-12-08 16:32:18 +0800
categories: jquery
tags: jquery
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在开发应用中，经常会需要下拉框级联的功能，例如省市镇多级联动，根据相关需求编写一个插件是很有必要的








### 下拉框联动

实现这个功能不能完全用 javascript 实现，因为省市数据数据需要从数据库中取出，我们用一般处理程序提供数据

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1fajg00040pj30ew06fab1.jpg" />

实现代码如下

```javascript
; (function ($, window, document, undefined) {
    var SelectElement = function (element, options) {
        this.element = element,
        this.data = options.data,
        this.defaults = {
            ajaxUrl: "/Ajax/KHGL/RequestCodeBaseInfo.ashx?method=GetListByCatNo",
            id: element.attr("id") || "Select",       // 生成元素的ID
            level: 0,                               // 级联等级，如果 level=0 则是单个文本框，否则为多个文本框
            key: "10042",                            // 对应数据库表的 ID
            className: element.attr("class") || "",   // 元素样式
            emptyText: "请选择",                     // 下拉框第一项
            width: 120,                             //  下拉框宽度
            height: 21,                             //  下拉框高度
            paddingLeft: 5,                         //  下拉框padding-left
            text: "CodeName",                       //  显示的 text 值
            value: "CodeNO",                        //  显示的 value 值
            parent: "PCodeNO"                       //  父节点
        },
        this.options = $.extend({}, this.defaults, options);
    };

    // 加载数据数据
    SelectElement.prototype.init = function () {
        var that = this;
        if (!that.data) {
            $.getJSON(that.options.ajaxUrl + "&catNo=" + that.options.key , function (d) {
                that.data = d;
                var html = ["<option value=''>" + this.options.emptyText + "</option>"]
                for (var i = 0, count = this.data.length; i < count; i++) {
                    if (this.data[i][this.options.parent] == "") {
                        html.push("<option value='" + this.data[i][this.options.value] + "'>" + this.data[i][this.options.text] + "</option>");
                    }
                }
                this.element.html(html.join(""));
                that.element.bind("change", function () {
                    that.element = $(this);
                    that.findByParentId(this.value);
                });
            });
        } else {
            var html = ["<option value=''>" + this.options.emptyText + "</option>"]
            for (var i = 0, count = this.data.length; i < count; i++) {
                if (this.data[i][this.options.parent] == "") {
                    html.push("<option value='" + this.data[i][this.options.value] + "'>" + this.data[i][this.options.text] + "</option>");
                }
            }
            this.element.html(html.join(""));
            that.element.bind("change", function () {
                that.element = $(this);
                that.findByParentId(this.value);
            });
        }
    }

    // 生成元素
    SelectElement.prototype.addElements = function () {
        // 生成元素
        if (this.options.level > 0) {
            var html = {}, that = this;
            for (var i = 0, target, j = this.options.level - 1, m; i < this.options.level; i++, j--) {
                // 如果是最后一个，不需要绑定事件
                if (i == this.options.level - 1) {
                    html[j] = $("<select id=" + this.options.id + i + " class='" + this.options.className + "' style='width:" + this.options.width + "px;height:" + this.options.height + "px;margin-left:" + this.options.paddingLeft + "px;' ><option value=''>" + this.options.emptyText + "</option></select>");
                } else {
                    target = $("<select id=" + this.options.id + i + " class='" + this.options.className + "' style='width:" + this.options.width + "px;height:" + this.options.height + "px;margin-left:" + this.options.paddingLeft + "px;'><option value=''>" + this.options.emptyText + "</option></select>");
                    target.bind("change", function () {
                        that.element = $(this);
                        that.findByParentId(this.value);
                    });
                    html[j] = target;
                }
            }
            for (var k in html) {
                this.element.after(html[k]);
            }
        }
    }

    // 清空联动
    SelectElement.prototype.clear = function () {
        var that = this;
        $('select[id^=' + that.options.id + ']').each(function (i) {
            var index = that.element.attr("id").substring(that.options.id.length);
            if (!index) {
                index = -1;
            }
            if (i > index) {
                $("#" + that.options.id + i).empty().append("<option value=''>" + that.options.emptyText + "</option>");
            }
        });
    }

    // 根据 父节点 找到子节点
    SelectElement.prototype.findByParentId = function (id) {
        this.clear();
        if (id) {
            var html = ["<option value=''>" + this.options.emptyText + "</option>"]
            for (var i = 0, count = this.data.length; i < count; i++) {
                if (this.data[i][this.options.parent] == id) {
                    html.push("<option value='" + this.data[i][this.options.value] + "'>" + this.data[i][this.options.text] + "</option>");
                }
            }
            this.element.next().html(html.join(""));
        } 
    }

    $.fn.SelectPlugin = function (options) {
        var that = this;
        var _select = new SelectElement(this, options);
        _select.addElements();
        _select.init();
        return _select;
    }
})(jQuery, window, document);
```

调用方法

```c#
$("#element").SelectPlugin({
	key: "10042",	// 获取父节点的 id
	level: 2        // 生成两个下拉框
});
```

### 单选按钮联动

单选按钮联动的功能和下拉框类似，先看看需要的效果

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1fajg183zxpj30jy08g74o.jpg" />

实现代码如下

```javascript
; (function ($, window, document, undefined) {
    var SelectElement = function (element, options) {
        this.element = element,
        this.level = 0,                   // 级联等级
        this.data=options.data,
        this.defaults = {
            ajaxUrl: "/Ajax/KHGL/RequestCodeBaseInfo.ashx?method=GetListByCatNo",
            id: element.attr("id") || "Radio",       // 生成元素的ID
            key: "10083",                            // 对应数据库表的 ID
            className: element.attr("class") || "",   // 元素样式
            text: "CodeName",                       //  显示的 text 值
            value: "CodeNO",                        //  显示的 value 值
            parent: "PCodeNO",                       //  父节点
            controlDivId: "radioPlusContainer",        // div容器
            controlRadioId: "radioPlusChild"
        },
        this.options = $.extend({}, this.defaults, options);
    };

    // 加载数据全部数据，缓存下来
    SelectElement.prototype.init = function () {
        var that = this;
        if (!that.data) {
            // 查看缓存
            if (localStorage.getItem("radioCacheList")) {
                that.data = eval('(' + localStorage.getItem("radioCacheList") + ')');
                that.findByParentId("");
            } else {
                $.getJSON(that.options.ajaxUrl + "&catNo=" + that.options.key, function (d) {
                    that.data = d;
                    localStorage.setItem("radioCacheList", JSON.stringify(d));
                    that.findByParentId("");
                });
            }
        }
    }

    // 清空联动
    SelectElement.prototype.clear = function () {
        var that = this;
        $('div[id^=' + that.options.controlDivId + ']').each(function (i) {
            if (i >= that.level) {
                $("#" + that.options.controlDivId + i).remove();
            }
        });
    }

    SelectElement.prototype.findByParentId = function (id) {
        var html = ['<div id="' + this.options.controlDivId + this.level + '" class="control"> '];
        for (var i = 0, count = this.data.length; i < count; i++) {
            if (this.data[i][this.options.parent] == id) {
                html.push('<input type="radio" level="'+this.level+'" name="' + this.options.controlDivId + this.level + '" value="' + this.data[i][this.options.value] + '" id="' + this.options.controlRadioId + i + '">');
                html.push('<label for="' + this.options.controlRadioId + i + '">' + this.data[i][this.options.text] + '</label>');
            }
        }
        html.push('</div>');
        var that = this;
        if (html.length > 2) {
            this.element.append(html.join(""));
            // 绑定事件
            $("#" + that.options.controlDivId + that.level).find("input").bind("change", function () {
                that.level = +$(this).attr("level") +1;
                that.clear();
                that.findByParentId(this.value);
            });
        }
    }

    // 获得选中的值
    SelectElement.prototype.getSelectedValue = function () {
        var html = [];
        $('div[id^=' + this.options.controlDivId + ']').find(":checked").each(function () {
            html.push(this.value);
        });
        return html;
    }

    // 设置选中的值
    SelectElement.prototype.setValues = function (chooseValue) {
        $('div[id^=' + this.options.controlDivId + ']').find("input[value=" + chooseValue + "]").attr("checked","checked").change();
    }

    // 重置，显示第一级
    SelectElement.prototype.reset = function () {
        this.level = 0;
        this.clear();
        this.findByParentId("");
    }

    $.fn.RadioPlugin = function (options) {
        this.empty();
        var _select = new SelectElement(this, options);
        _select.init();
        return _select;
    }
})(jQuery, window, document);

```

调用方法

```c#
$("#element").RadioPlugin({
	key: "10083"
});
```



