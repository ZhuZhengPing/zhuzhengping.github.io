---
layout: post
title:  "canvas报表"
date:   2016-06-16 16:32:18 +0800
categories: javascript
tags: canvas javascript
author: Zhengping Zhu
---

* content
{:toc}

## 概念

用`canvas`画图做报表，速度比.net生成的报表速度要快，我这里画了4种格式的报表





### 前端html准备工作

```html
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="format-detection" content="telephone=no" />
    <meta name="viewport" content="width=device-width,minimum-scale=1.0,maximum-scale=1.0,user-scalable=no,initial-scale=1.0" />
    <title>售楼管理</title>
    <script src="js/zepto.js"></script>
    <script src="js/report.js"></script>
    <style type="text/css">
        *{margin:0;padding:0;}
    </style>
</head>
<body>
    <div style="text-align:center;display:block;">
        <canvas id="test1" width="300" height="200"></canvas>
    </div>
    <div style="text-align:center;display:block;">
        <canvas id="test2" width="300" height="200"></canvas>
    </div>
    <div style="text-align:center;display:block;">
        <canvas id="test3" width="300" height="200"></canvas>
    </div>
    <div style="text-align:center;display:block;margin-bottom:50px;">
        <canvas id="test4" width="300" height="200"></canvas>
    </div>
    <script>
        $("#test1").circle({ data: { '电影': 20, '美食': 30, '活动': 10, '理发': 70, '美容': 10, '吃的': 90 } });
        $("#test2").pillar({ data: { '电影': 20, '美食': 30, '活动': 10, '理发': 70, '美容': 10, '吃的': 90 } });
        $("#test3").pillar_reverse({ data: { '电影': 20, '美食': 30, '活动': 10, '理发': 70, '美容': 10, '吃的': 90 } });
        $("#test4").line({ data: { '电影': 20, '美食': 30, '活动': 10, '理发': 70, '美容': 10, '吃的': 90 }});
    </script>
</body>
</html>
```

### 公共方法

```js
// 获得对象信息
// max:最大值
// total:对象value总和
// count:对象的个数
var getTotal = function (obj) {
    var temp = {max:0,total:0,count:0};
    for (var item in obj) {
        if (temp.max < obj[item]) {
            temp.max = obj[item];
        }
        temp.total += obj[item];
        temp.count++;
    }
    // 保留整数
    temp.max = temp.max + 50 - temp.max % 50;
    return temp;
}
```

### 圆饼型报表

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4x8o0v4z5j308u05eq31.jpg" style="width:70%" />

```js
/*
 * 朱正平 2016-03-29
 * html 圆形，条形，线型报表
 * canvas格式： <canvas id="test" width="500" height="300"></canvas> 
 */

// $("#test1").circle({ data: { '电影': 20, '美食': 30, '活动': 10, '理发': 70, '美容': 10, '吃的': 90 } });
// 画圆型报表
// 圆形报表是由多个扇形组成的
// 所以我们其实是要画扇形
// config:  {data:{'来访':20,'意向':10},callback:fn}
// data : 需要展示的数据
// callback : 回调方法，用于扩展
$.fn.circle = function (config) {

    // 缓存当前对象
    var canvas = $(this)[0];

    // 画笔
    var ctx = canvas.getContext('2d');

    // 设置扇形区域中央提示字体的样式
    ctx.font = "small-caps normal 12px Arial";

    // 文字居中
    ctx.textAlign = "center";

    // 区域的颜色
    var color = ['#ED1B23', '#F26421', '#F78E1E', '#F9F200', '#8CC53E', '#3BB549', '#00A550', '#00A89C', '#00ADEF', '#0071BB', '#0053A5', '#530000'];

    // 颜色索引，默认从0开始
    var index = 0;
    
    // 圆半径
    var radius = canvas.height / 2 - 25;

    // 圆心的坐标点
    var center = { x: canvas.width / 2, y: canvas.height / 2 };

    // 最小单位
    var unit = 2 * Math.PI / getTotal(config.data).total;

    // 扇形弧度
    var radian = {x:0,y:0};

    // 扇形文字描述
    var textPoint = 0;

    // 判断是否有数据
    var empty = true;

    // 循环传递过来的数据，画出图形
    for (var item in config.data) {

        // 计算结束的弧度
        // 结束的弧度 = 开始的弧度 - config.data里面传递过来的数值所占的弧度
        radian.y = radian.x - config.data[item] * unit;

        // 文字所在的弧度，等于扇形所在弧度的一半
        textPoint = radian.x - config.data[item] * unit / 2;

        // 给定所画扇形的颜色
        ctx.fillStyle = color[index];

        // 设置扇形边框的颜色，如果不设置这个颜色，可能会出现白边
        ctx.strokeStyle = color[index++];

        // 开始画图
        ctx.beginPath();

        // 坐标点移动到圆心
        ctx.moveTo(center.x, center.y);

        // 画出扇形
        ctx.arc(center.x, center.y, radius, radian.x, radian.y, true);

        // 填充扇形颜色
        ctx.fill();

        // 给扇形边框设置颜色，防止白边
        ctx.stroke();

        // 画扇形上面的提示字体，这里需要用到高中学的数学知识
        // 开始画图
        ctx.beginPath();

        // 设置字体的颜色为黑色
        ctx.fillStyle = "black";

        // 计算字体所在的坐标点
        // 根据圆心角和半径求 提示字体所在的坐标点
        // 提示字体所在的坐标点的 X = 圆心X坐标 + cos(圆心角) * 半径
        // 提示字体所在的坐标点的 Y = 圆心Y坐标 + sin(圆心角) * 半径
        // 因为字体需要在圆内，我这里显示的是在圆心 2/3 的位置 所以半径需要再 乘以 2/3
        ctx.fillText(config.data[item], center.x + Math.cos(textPoint) * radius * 2 / 3, center.y + Math.sin(textPoint) * radius * 2 / 3);
        
        // 提示字体在圆的外面，所以得大于半径，考虑到手机的屏幕比较小， 所以半径再乘以 1.15 差不多
        ctx.fillText(item, center.x + Math.cos(textPoint) * radius * 1.15, center.y + Math.sin(textPoint) * radius * 1.15);

        // 下一个扇形的开始弧度等于当前扇形的结束弧度
        radian.x = radian.y;

        // 不是空数据
        empty = false;

        // 回调函数
        if (config.callback instanceof Function) {
            config.callback(item, config.data[item]);
        }
    }

    // 没有数据，画出空心圆
    if (empty) {
        ctx.beginPath();
        ctx.fillText("暂无数据", center.x, center.y);
        ctx.arc(center.x, center.y, radius, 0, Math.PI * 2, true);
        ctx.stroke();
    }
}
```

### 柱形报表

<img src="http://ww2.sinaimg.cn/mw690/006dag38gw1f4ybigolzrj308r05uaa2.jpg" style="width:70%" />

```js
// 圆柱型报表
$.fn.pillar = function (config) {

    // 缓存当前对象
    var canvas = $(this)[0];

    // 画笔
    var ctx = canvas.getContext('2d');

    // 文字样式
    ctx.font = "small-caps normal 12px Arial";

    // 圆柱颜色
    var color = ['#43A521', '#A6B528', '#CAD856', '#E4DB7A', '#ECDE48', '#ECBF48', '#EC9548', '#D97330', '#D95430', '#A80000', '#740000', '#530000'];

    // 颜色索引，默认从0开始
    var index = 0;

    // top    : 图形距离上面的距离
    // right  : 图形距离右边的距离
    // bottom : 图形距离下边的距离
    // left   : 图形距离左边的距离
    var margin = {
        top: 35,
        right: 35,
        bottom: 35,
        left:35
    };

    // 重新设置传递过来的数据信息
    // data.max:    最大值
    // data.count:  传递的数据个数
    // data.total:  传递过来的数据值汇总
    var data = getTotal(config.data);

    // X抽最小单位
    // Y抽最小单位
    var unit = {
        x: (canvas.width - margin.left - margin.right) / data.count,
        y: (canvas.height - margin.left - margin.right) / data.max
    };

    // 坐标轴定点坐标
    // X: 向右移动 三分之一个单位
    // Y：一直不变
    var coord = {
        x: margin.left,
        y: canvas.height - margin.bottom
    }

    // 单个圆柱数据的定点
    // 这里先定义第一个圆柱的坐标
    var point = {
        x: unit.x / 3 + margin.left,
        y: coord.y
    };

    // 开始画图
    ctx.beginPath();

    // 设置画笔颜色
    ctx.strokeStyle = "black";

    // 画X坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(canvas.width - margin.right, coord.y);

    // 画Y坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(coord.x, margin.top);

    // 画出Y轴上面的数字
    // X : 都是坐标原点(coord) 左边一点
    // Y : 坐标原点(coord) - 刻度
    for (var i = 0; i < 5; i++) {
        ctx.fillText(i * data.max / 5, coord.x / 3, coord.y - i * (canvas.height - margin.left - margin.right) / 5);
    }

    // 遍历传递过来的数据，开始画具体的内容
    for (var item in config.data) {

        // 设置圆柱的颜色
        ctx.fillStyle = color[index++];

        // 画圆柱
        // 定点为设置的point点
        // 宽度为X坐标单位的三分之一个单位
        // 高度为 参数的数值 * Y轴最小单位
        ctx.fillRect(point.x, canvas.height - margin.top - config.data[item] * unit.y, unit.x / 3, config.data[item] * unit.y);

        // 画出对应的文字说明
        ctx.fillStyle = 'black';

        // 文字应该在对应圆柱的下面
        ctx.fillText(item, point.x-6, point.y + 20);

        // 设置下一个圆柱的坐标
        point.x += unit.x;

    }

    // 图形生成到画布 
    ctx.stroke();
}
```

### 反向柱形报表

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4ybhsanrdj308j05udft.jpg" style="width:70%" />

```js
// 圆柱形报表-反向的
// 数据太多的时候使用
$.fn.pillar_reverse = function (config) {
    // 缓存当前对象
    var canvas = $(this)[0];

    // 画笔
    var ctx = canvas.getContext('2d');

    // 文字样式
    ctx.font = "small-caps normal 12px Arial";

    // 圆柱颜色
    var color = ['#43A521', '#A6B528', '#CAD856', '#E4DB7A', '#ECDE48', '#ECBF48', '#EC9548', '#D97330', '#D95430', '#A80000', '#740000', '#530000'];

    // 颜色索引，默认从0开始
    var index = 0;

    // top    : 图形距离上面的距离
    // right  : 图形距离右边的距离
    // bottom : 图形距离下边的距离
    // left   : 图形距离左边的距离
    var margin = {
        top: 35,
        right: 35,
        bottom: 35,
        left: 35
    };

    // 重新设置传递过来的数据信息
    // data.max:    最大值
    // data.count:  传递的数据个数
    // data.total:  传递过来的数据值汇总
    // data.data:   传递过来的原始数据
    var data = getTotal(config.data);

    // X抽最小单位
    // Y抽最小单位
    var unit = {
        x: (canvas.width - margin.left - margin.right) / data.max,
        y: (canvas.height - margin.left - margin.right) / data.count
    };

    // 坐标轴定点坐标
    // X: 向右移动 三分之一个单位
    // Y：一直不变
    var coord = {
        x: margin.left,
        y: margin.top
    }

    // 单个圆柱数据的定点
    // 这里先定义第一个圆柱的坐标
    var point = {
        x: coord.y,
        y: unit.y / 3 + margin.top
    };

    // 开始画图
    ctx.beginPath();

    // 设置画笔颜色
    ctx.strokeStyle = "black";

    // 画X坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(canvas.width - margin.right, coord.y);

    // 画Y坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(coord.x, canvas.height - margin.top);

    // 画出X轴上面的数字
    // X : 都是坐标原点(coord) 左边一点
    // Y : 坐标原点(coord) - 刻度
    for (var i = 0; i < 5; i++) {
        ctx.fillText(i * data.max / 5, margin.left+ i * (canvas.width - margin.left - margin.right) / 5, coord.y -10);
    }

    // 遍历传递过来的数据，开始画具体的内容
    for (var item in config.data) {

        // 设置圆柱的颜色
        ctx.fillStyle = color[index++];

        // 画圆柱
        // 定点为设置的point点
        // 宽度为X坐标单位的三分之一个单位
        // 高度为 参数的数值 * Y轴最小单位
        ctx.fillRect(point.x, point.y,config.data[item] * unit.x, unit.y / 3);

        // 画出对应的文字说明
        ctx.fillStyle = 'black';

        // 文字应该在对应圆柱的左边
        ctx.fillText(item, 0, point.y + 8);

        // 设置下一个圆柱的坐标
        point.y += unit.y;

    }

    // 图形生成到画布 
    ctx.stroke();
}
```

### 线型报表

<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f4ybhsir6xj308q06cjrg.jpg" style="width:70%" />

```js
// 线型曲线图
$.fn.line = function (config) {

    // 缓存当前对象
    var canvas = $(this)[0];

    // 画笔
    var ctx = canvas.getContext('2d');

    // 设置字体的样式
    ctx.font = "small-caps normal 12px Arial";

    // 圆柱颜色
    var color = ['#43A521', '#A6B528', '#CAD856', '#E4DB7A', '#ECDE48', '#ECBF48', '#EC9548', '#D97330', '#D95430', '#A80000', '#740000', '#530000'];

    // 颜色索引，默认从0开始
    var index = 0;

    // top    : 线型距离上面的距离
    // right  : 线型距离右边的距离
    // bottom : 线型距离下边的距离
    // left   : 线型距离左边的距离
    var margin = {
        top: 35,
        right: 35,
        bottom: 35,
        left: 35
    };

    // 坐标轴定点坐标
    // X: 向右移动 三分之一个单位
    // Y：一直不变
    var coord = {
        x: margin.left,
        y: canvas.height - margin.bottom
    }
    

    // 单个点数据的定点
    var point = {
        x: coord.x,
        y: coord.y
    };
    // 重新设置传递过来的数据信息
    // data.max:    最大值
    // data.count:  传递的数据个数
    // data.total:  传递过来的数据值汇总
    var data = getTotal(config.data);

    // X抽最小单位
    // Y抽最小单位
    var unit = {
        x: (canvas.width - margin.left - margin.right) / data.count,
        y: (canvas.height - margin.left - margin.right) / data.max
    };

    // 开始画图
    ctx.beginPath();

    // 设置画笔颜色
    ctx.strokeStyle = "black";

    // 画X坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(canvas.width - margin.right, coord.y);

    // 画Y坐标轴
    ctx.moveTo(coord.x, coord.y);
    ctx.lineTo(coord.x, margin.top);

    // 画出Y轴上面的数字
    // X : 都是坐标原点(coord) 左边一点
    // Y : 坐标原点(coord) - 刻度
    for (var i = 0; i < 5; i++) {
        ctx.fillText(i * data.max / 5, coord.x / 3, coord.y - i * (canvas.height - margin.left - margin.right) / 5);
        ctx.stroke();

        // 画X轴参考线
        ctx.beginPath();
        ctx.strokeStyle = "#E0E0E0";
        ctx.moveTo(coord.x, coord.y - (i+1) * (canvas.height - margin.left - margin.right) / 5);
        ctx.lineTo(canvas.width - margin.right, coord.y - (i + 1) * (canvas.height - margin.left - margin.right) / 5);
        ctx.stroke();
    }

    // 遍历传递过来的数据，开始画具体的内容
    for (var item in config.data) {
        ctx.beginPath();
        ctx.strokeStyle = color[index];
        // 画线
        // 定点为设置的point点
        ctx.moveTo(point.x, point.y);

        // 重新计算顶点的高度
        point.x += unit.x;
        point.y = coord.y - config.data[item] * unit.y;

        // 画数据曲线
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        
        // 画Y轴参考线
        ctx.beginPath();
        ctx.strokeStyle = "#E0E0E0";
        ctx.moveTo(point.x, coord.y);
        ctx.lineTo(point.x, margin.top);
        ctx.stroke();

        ctx.beginPath();
        // 画出对应的文字说明
        ctx.fillStyle = 'black';

        // 文字应该在对应圆柱的下面
        ctx.fillText(item, point.x - unit.x/2 -8 , coord.y + 20);
        // 图形生成到画布 
        ctx.stroke();
    }
}
```





