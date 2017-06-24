---
layout: post
title:  "拼图游戏"
date:   2017-03-22 16:32:18 +0800
categories: javascript
tags: game
author: Zhengping Zhu
---

* content
{:toc}

## 概念

这篇文章介绍一种简单的方式在网络上开发游戏，本文使用了 html,css 和 javascript 的2d 游戏开发，在这里介绍如何创建一个拼图游戏。

[你可以在线玩这个游戏](http://www.anuraggandhi.com/imagepuzzle/puzzle.html)









#### 规则

游戏规则非常简单。你只需要拖放图像部件并交换它们，当达到正确的位置时释放它们。在拖放图像部件时会记录步骤数。你可能会试着以最少的步骤来完成这个游戏。

游戏界面如下图所示：

<img src="https://www.codeproject.com/KB/HTML/810978/lotus.jpg" style="display:block;" />

<img src="https://www.codeproject.com/KB/HTML/810978/taj.jpg" style="display:block;" />

#### 切割图片

对于图像看起来像nxn不同的部分，其中n是每一面部件数量，ul包含nxn li个元素，每个li的显示属性设置为内嵌块，以使其显示为网格。每个li的背景图像被设置为仅显示图像的1 /（n×n）部分，并且相应地设置背景图像的位置，每个li添加data-value标识该片段的索引。

```js
setImage: function (images, gridSize) {
	console.log(gridSize);
	gridSize = gridSize || 4; // If gridSize is null or not passed, default it as 4.
	console.log(gridSize);
	var percentage = 100 / (gridSize - 1);
	var image = images[Math.floor(Math.random() * images.length)];
	$('#imgTitle').html(image.title);
	$('#actualImage').attr('src', image.src);
	$('#sortable').empty();
	for (var i = 0; i < gridSize * gridSize; i++) {
		var xpos = (percentage * (i % gridSize)) + '%';
		var ypos = (percentage * Math.floor(i / gridSize)) + '%';
		var li = $('<li class="item" data-value="' + (i) + '"></li>').css({
			'background-image': 'url(' + image.src + ')',
			'background-size': (gridSize * 100) + '%',
			'background-position': xpos + ' ' + ypos,
			'width': 400 / gridSize,
			'height': 400 / gridSize
		});
		$('#sortable').append(li);
	}
	$('#sortable').randomize();
}
```

在这里，您可以看到使用简单的背景图像和背景位置样式实现了分割图片的效果。当图片设置完成以后，按正确的顺序，随机方法用于随机化片段。在游戏中，用户必须重新排列片段以形成完整的图像.

gridSize表示每个被分割的图像部分。我已将拼图的级别分为3部分：容易，中等和困难。容易3x3格，中4x4和困难的5x5。

#### 分割部分

分割图片后，随机方法用于随机化碎片。为此，创建一个小型通用随机化函数来随机化任何jquery元素集合。

```js
$.fn.randomize = function (selector) {
    var $elems = selector ? $(this).find(selector) : $(this).children(),
        $parents = $elems.parent();

    $parents.each(function () {
        $(this).children(selector).sort(function () {
            return Math.round(Math.random()) - 0.5;
        }).remove().appendTo(this);
    });
    return this;
}; 
```

在这里，我们只是简单地循环给定选择器的每个子元素，并根据随机数改变其位置.

#### 拖放碎片

为了使每一块碎片拖动，使用 jquery draggable。请确保您的页面中包含jquery-ui.js以实现可拖放/可拖放功能

```js
enableSwapping: function (elem) {
	$(elem).draggable({
		snap: '#droppable',
		snapMode: 'outer',
		revert: "invalid",
		helper: "clone"
	});
	$(elem).droppable({
		drop: function (event, ui) {
			var $dragElem = $(ui.draggable).clone().replaceAll(this);
			$(this).replaceAll(ui.draggable);

			currentList = $('#sortable > li').map(function (i, el) { 
				return $(el).attr('data-value'); });
			if (isSorted(currentList))
				$('#actualImageBox').empty().html($('#gameOver').html());

			imagePuzzle.enableSwapping(this);
			imagePuzzle.enableSwapping($dragElem);
		}
	});
}    
```

#### 定时器

```js
tick: function () {
	var now = new Date().getTime();
	var elapsedTime = parseInt((now - imagePuzzle.startTime) / 1000, 10);
	$('#timerPanel').text(elapsedTime);
	timerFunction = setTimeout(imagePuzzle.tick, 1000);
} 
```

[源码下载](https://www.codeproject.com/KB/HTML/810978/ImagePuzzle.zip)







