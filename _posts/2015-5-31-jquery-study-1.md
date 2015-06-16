---
layout : post
title : "jquery选择器"
category : jquery
duoshuo: true
date : 2015-5-18

---

`jQuery` 最核心的组成部分就是：选择器引擎。它继承了 `CSS` 的语法，可以对 `DOM` 元
素的标签名、属性名、状态等进行快速准确的选择，并且不必担心浏览器的兼容性。`jQuery`
选择器实现了 `CSS1~CSS3` 的大部分规则之外，还实现了一些自定义的选择器，用于各种
特殊状态的选择。备注：课程必须有`(X)html+CSS` 基础。

####一．简单选择器

在使用 `jQuery` 选择器时，我们首先必须使用`“$()”`函数来包装我们的 `CSS` 规则。而
`CSS` 规则作为参数传递到 `jQuery` 对象内部后，再返回包含页面中对应元素的 `jQuery` 对象。
随后，我们就可以对这个获取到的 `DOM` 节点进行行为操作了。

	#box { //使用 ID 选择器的 CSS 规则
		color:red; //将 ID 为 box 的元素字体颜色变红
	} 
	
在`jQuery` 选择器里，我们使用如下的方式获取同样的结果：

	$('#box').css('color', 'red'); //获取 DOM 节点对象，并添加行为

那么除了 `ID` 选择器之外，还有两种基本的选择器，分别为：元素标签名和类(`class`)：

|选择器 |`CSS` 模式| `jQuery` 模式| 描述
|:------|:------|:------|:------
|元素名 | `div {}`| `$('div')`| 获取所有 `div` 元素的 `DOM`对象
|`ID` | `#box {}`| `$('#box')`| 获取一个 ID 为 `box` 元素的 `DOM` 对象
|类(`class`)| `.box{}`| `$('.box')`| 获取所有 `class` 为 `box` 的所有 `DOM` 对象

---

	$('div').css('color', 'red'); //元素选择器，返回多个元素
	$('#box').css('color', 'red'); //ID 选择器，返回单个元素
	$('.box').css('color', 'red'); //类(class)选择器，返回多个元素

为了证明 `ID` 返回的是单个元素，而元素标签名和类(`class`)返回的是多个，我们可以采
用 `jQuery` 核心自带的一个属性 `length` 或 `size()`方法来查看返回的元素个数。

	alert($('div').size()); //3 个
	alert($('#box').size()); //1 个，后面两个失明了
	alert($('.box').size()); //3 个

同理，你也可以直接使用 `jQuery` 核心属性来操作：

alert($('#box').length); //1 个，后面失明了

*警告：有个问题特别要注意，`ID` 在页面只允许出现一次，我们一般都是要求开发者要
遵守和保持这个规则。但如果你在页面中出现三次，并且在 `CSS` 使用样式，那么这三个元
素还会执行效果。但如果，你想在 `jQuery` 这么去做，那么就会遇到失明的问题。所以，开
发者必须养成良好的遵守习惯，在一个页面仅使用一个 `ID`。*

	$('#box').css('color', 'red'); //只有第一个 ID 变红，后面两个失明

`jQuery` 选择器的写法与 `CSS` 选择器十分类似，只不过他们的功能不同。`CSS` 找到元素
后添加的是单一的样式，而 `jQuery` 则添加的是动作行为。最重要的一点是：`CSS` 在添加样
式的时候，高级选择器会对部分浏览器不兼容，而 `jQuery` 选择器在添加 `CSS` 样式的时候却
不必为此烦恼。

	#box > p { //CSS 子选择器，IE6 不支持
		color:red;
	}
	
	$('#box > p').css('color','red'); //jQuery 子选择器，兼容了 IE6
	
`jQuery` 选择器支持 `CSS1`、`CSS2` 的全部规则，支持 `CSS3` 部分实用的规则，同时它还有
少量独有的规则。所以，对于已经掌握 `CSS` 的开发人员，学习 `jQuery` 选择器几乎是零成本。
而 `jQuery` 选择器在获取节点对象的时候不但简单， 还内置了容错功能， 这样避免像 `JavaScript`
那样每次对节点的获取需要进行有效判断。

	$('#pox').css('color', 'red'); //不存在 ID 为 pox 的元素，也不报错
	document.getElementById('pox').style.color = 'red'; //报错了

因为 `jQuery` 内部进行了判断，而原生的 DOM 节点获取方法并没有进行判断，所以导
致了一个错误，原生方法可以这么判断解决这个问题：

	if (document.getElementById('pox')) { //先判断是否存在这个对象
		document.getElementById('pox').style.color = 'red';
	}
	
那么对于缺失不存在的元素，我们使用 `jQuery` 调用的话，怎么去判断是否存在呢？因
为本身返回的是 `jQuery` 对象，可能会导致不存在元素存在与否，都会返回 `true`。

	if ($('#pox').length > 0) { //判断元素包含数量即可
		$('#pox').css('color', 'red');
	}

除了这种方式之外，还可以用转换为 DOM 对象的方式来判断，例如：

	if ($('#pox').get(0)) {} 或 if ($('#pox')[0]) {} //通过数组下标也可以获取 DOM 对象

####二．进阶选择器

在简单选择器中，我们了解了最基本的三种选择器：元素标签名、`ID` 和类(`class`)。那么
在基础选择器外，还有一些进阶和高级的选择器方便我们更精准的选择元素。

|选择器 |`CSS` 模式 |`jQuery` 模式 |描述
|------|------|------|------
|群组选择器 |`span,em,.box {}` |`$('span,em,.box')`| 获取多个选择器的 `DOM` 对象
|后代选择器 |`ul li a {}`| `$('ul li a')`| 获取追溯到的多个 `DOM` 对象
|通配选择器 |`* {}` |`$('*')`| 获取所有元素标签的 `DOM` 对象

---

	//群组选择器
	span, em, .box { //多种选择器添加红色字体
		color:red;
	}
	$('span, em, .box').css('color', 'red'); //群组选择器 jQuery 方式
	
	//后代选择器
	ul li a { //层层追溯到的元素添加红色字体
		color:red;
	}
	$('ul li a').css('color', 'red'); //群组选择器 jQuery 方式
	
	//通配选择器
	* { //页面所有元素都添加红色字体
		color:red;
	 }
	$('*').css('color', 'red'); //通配选择器
	
目前介绍的六种选择器，在实际应用中，我们可以灵活的搭配，使得选择器更加的精准
和快速：

	$('#box p, ul li *').css('color', 'red'); //组合了多种选择器

*警告：在实际使用上，通配选择器一般用的并不多，尤其是在大通配上，比如：`$('*')`，
这种使用方法效率很低，影响性能，建议竟可能少用。*

还有一种选择器，可以在 ID 和类(class)中指明元素前缀，比如：

	$('div.box'); //限定必须是.box 元素获取必须是 div
	$('p#box div.side'); //同上

类(`class`)有一个特殊的模式，就是同一个 `DOM` 节点可以声明多个类(`class`)。那么对于这
种格式，我们有多 `class` 选择器可以使用，但要注意和 `class` 群组选择器的区别。

	.box.pox { //双 class 选择器，IE6 出现异常
		color:red;
	}
	$('.box.pox').css('color', 'red'); //兼容 IE6，解决了异常

多 `class` 选择器是必须一个 `DOM` 节点同时有多个 `class`，用这多个 `class` 进行精确限定。
而群组 `class` 选择器，只不过是多个 `class` 进行选择而已。

	$('.box, .pox').css('color', 'red'); //加了逗号，体会区别

*警告：在构造选择器时，有一个通用的优化原则：只追求必要的确定性。当选择器筛选
越复杂，jQuery 内部的选择器引擎处理字符串的时间就越长。比如：*

	$('div#box ul li a#link'); //让 jQuery 内部处理了不必要的字符串
	$('#link'); //ID 是唯一性的，准确度不变，性能提升

####三．高级选择器

在前面我们学习六种最常规的选择器， 一般来说通过这六种选择器基本上可以解决所有
`DOM` 节点对象选择的问题。但在很多特殊的元素上，比如父子关系的元素，兄弟关系的元
素，特殊属性的元素等等。在早期 `CSS` 的使用上，由于 `IE6` 等低版本浏览器不支持，所以
这些高级选择器的使用也不具备普遍性，但随着 `jQuery` 兼容，这些选择器的使用频率也越
来越高。

层次选择器

在层次选择器中， 除了后代选择器之外， 其他三种高级选择器是不支持 IE6 的， 而 jQuery
却是兼容 IE6 的。

	//后代选择器
	$('#box p').css('color', 'red'); //全兼容
	
jQuery 为后代选择器提供了一个等价 find()方法

	$('#box').find('p').css('color', 'red'); //和后代选择器等价
	
	//子选择器，孙子后失明
	#box > p { //IE6 不支持
		color:red;
	}
	$('#box > p').css('color', 'red'); //兼容 IE6
	
`jQuery` 为子选择器提供了一个等价 `children()`方法：

	$('#box').children('p').css('color', 'red'); //和子选择器等价

|选择器 |`CSS` 模式 |`jQuery` 模式 |描述
|------|------|-------|------
|后代选择器 |`ul li a {}`| `$('ul li a')`| 获取追溯到的多个 `DOM` 对象
|子选择器| `div > p {}`| `$('div p')`| 只获取子类节点的多个 `DOM` 对象
|`next` 选择器| `div + p {}`| `$('div + p')`| 只获取某节点后一个同级 `DOM`对象
|`nextAll` 选择器| `div ~ p {}`| `$('div ~ p')`| 获取某节点后面所有同级 `DOM`对象

---

	//next 选择器(下一个同级节点)
	#box + p { //IE6 不支持
		color:red;
	}
	$('#box+p').css('color', 'red'); //兼容 IE6
	
jQuery 为 next 选择器提供了一个等价的方法 next()：

	$('#box').next('p').css('color', 'red'); //和 next 选择器等价
	//nextAll 选择器(后面所有同级节点)
	#box ~ p { //IE6 不支持
		color:red;
	}
	$('#box ~ p').css('color', 'red'); //兼容 IE6
	
jQuery 为 nextAll 选择器提供了一个等价的方法 nextAll()：

	$('#box').nextAll('p').css('color', 'red'); //和 nextAll 选择器等价
	
层次选择器对节点的层次都是有要求的，比如子选择器，只有子节点才可以被选择到，
孙子节点和重孙子节点都无法选择到。`next` 和 `nextAll` 选择器，必须是同一个层次的后一个
和后 `N` 个，不在同一个层次就无法选取到了。

在 `find()`、`next()`、`nextAll()`和 `children()`这四个方法中，如果不传递参数，就相当于传递
了`“*”` ，即任何节点，我们不建议这么做，不但影响性能，而且由于精准度不佳可能在复杂
的 `HTML` 结构时产生怪异的结果。

	$('#box').next(); //相当于$('#box').next('*');

为了补充高级选择器的这三种模式，jQuery 还提供了更加丰富的方法来选择元素：

	$('#box').prev('p').css('color', 'red'); //同级上一个元素
	$('#box').prevAll('p').css('color', 'red'); //同级所有上面的元素
	
`nextUntil()`和 `prevUnitl()`方法是选定同级的下面或上面的所有节点，选定非指定的所有
元素，一旦遇到指定的元素就停止选定。

	$('#box').prevUntil('p').css('color', 'red'); //同级上非指定元素选定，遇到则停止
	$('#box').nextUntil('p').css('color', 'red'); //同级下非指定元素选定，遇到则停止
	
`siblings()`方法正好集成了 `prevAll()`和 `nextAll()`两个功能的效果，及上下相邻的所有元素
进行选定：

	$('#box').siblings('p').css('color', 'red'); //同级上下所有元素选定
	//等价于下面：
	$('#box').prevAll('p').css('color', 'red'); //同级上所有元素选定
	$('#box').nextAll('p').css('color', 'red'); //同级下所有元素选定

*警告：切不可写成“`$('#box').prevAll('p').nextAll('p').css('color', 'red');`”这种形式，因为
`prevAll('p')`返回的是已经上方所有指定元素，然后再 `nextAll('p')`选定下方所有指定元素，这
样必然出现错误。*

理论上来讲，`jQuery` 提供的方法 `find()`、`next()`、`nextAll()`和 `children()`运行速度要快于使
用高级选择器。因为他们实现的算法有所不同，高级选择器是通过解析字符串来获取节点对
象，而 `jQuery` 提供的方法一般都是单个选择器，是可以直接获取的。但这种快慢的差异，
对于客户端脚本来说没有太大的实用性， 并且速度的差异还要取决了浏览器和选择的元素内
容。比如，在 `IE6/7` 不支持 `querySelectorAll()`方法，则会使用“Sizzle”引擎，速度就会慢，
而其他浏览器则会很快。有兴趣的可以了解这个方法和这个引擎。
选择器快慢分析：

	//这条最快，会使用原生的 getElementById、ByName、ByTagName 和 querySelectorAll()
	$('#box').find('p');

	//jQuery 会自动把这条语句转成$('#box').find('p')，这会导致一定的性能损失。它比最快的形式慢了 5%-10%
	$('p', '#box');
	
	//这条语句在 jQuery 内部，会使用$.sibling()和 javascript 的 nextSibling()方法，一个个遍历节点。它比最快的形式大约慢 50%
	$('#box').children('p');
	
	//jQuery 内部使用 Sizzle 引擎，处理各种选择器。Sizzle 引擎的选择顺序是从右到左，所以这条语句是先选p，然后再一个个过滤出父元素#box，这导致它比最快的形式大约慢70%
	$('#box > p');
	
	//这条语句与上一条是同样的情况。但是，上一条只选择直接的子元素，这一条可以于选择多级子元素，所以它的速度更慢，大概比最快的形式慢了 77%。
	$('#box p');
	
	//jQuery 内部会将这条语句转成$('#box').find('p')，比最快的形式慢了 23%。
	$('p', $('#parent'));
	
综上所属，最快的是 `find()`方法，最慢的是`$('#box p')`这种高级选择器。如果一开始将
`$('#box')`进行赋值，那么 `jQuery` 就对其变量进行缓存，那么速度会进一步提高。

	var box = $('#box');
	var p = box.find('p');

*注意：我们应该推荐使用哪种方案呢？其实，使用哪种都差不多。这里，我们推荐使用
`jQuery` 提供的方法。因为不但方法的速度比高级选择器运行的更快，并且它的灵活性和扩展
性要高于高级选择器。使用“+”或“~”从字面上没有 `next` 和 `nextAll` 更加语义化，更加清
晰，`jQuery` 的方法更加丰富，提供了相对的 `prev` 和 `prevAll`。毕竟 `jQuery` 是编程语言，需要
能够灵活的拆分和组合选择器，而使用 CSS 模式过于死板。所以，如果 jQuery 提供了独立
的方法来代替某些选择器的功能，我们还是推荐优先使用独立的方法。*

|CSS 模式 |jQuery 模式 |描述
|------|------|------
|`a[title]`| `$('a[title]')`| 获取具有这个属性的 DOM 对象
|`a[title=num1]`| `$('a[title=num1]'`)|获取具有这个属性=这个属性值的 DOM对象
|`a[title^=num]`|` $('a[title^=num]')`|获取具有这个属性且开头属性值匹配的DOM 对象
|`a[title\|=num]`| `$('a[title\|=num]'`)|获取具有这个属性且等于属性值或开头属性值匹配后面跟一个“-”号的 DOM 对象
|`a[title$=num]`| `$('a[title$=num]'`)|获取具有这个属性且结尾属性值匹配的DOM 对象
|`a[title!=num]`| `$('a[title!=num]'`)|获取具有这个属性且不等于属性值的DOM 对象
|`a[title~=num]`|` $('a[title~=num]')`|获取具有这个属性且属性值是以一个空格分割的列表，其中包含属性值的 DOM 对象
|`a[title*=num]`| `$('a[title*=num]')`|获取具有这个属性且属性值含有一个指定字串的 DOM 对象
|`a[bbb][title=num1]`| `$('a[bbb][title=num1]')`|获取具有这个属性且属性值匹配的 DOM对象

属性选择器也不支持 `IE6`， 所以在 `CSS` 界如果要兼容低版本， 那么也是非主流。 但 `jQuery`
却不必考虑这个问题。

	//选定这个属性的
	a[title] { //IE6 不支持
		color:red;
	}
	
	$('a[title]').css('color', 'red'); //兼容 IE6 了
	//选定具有这个属性=这个属性值的
	a[title=num1] { //IE6 不支持
		color:red;
	}
	$('a[title=num1]').css('color', 'red'); //兼容 IE6 了
	
	//选定具有这个属性且开头属性值匹配的
	a[title^=num] { //IE6 不支持
		color:red;
	}
	$('a[title=^num]').css('color', 'red'); //兼容 IE6 了
	
	//选定具有这个属性且等于属性值或开头属性值匹配后面跟一个“-”号
	a[title|=num] { //IE6 不支持
		color:red;
	}
	$('a[title|="num"]').css('color', 'red'); //兼容 IE6 了
	
	//选定具有这个属性且结尾属性值匹配的
	a[title$=num] { //IE6 不支持
		color:red;
	}
	$('a[title$=num]').css('color','red'); //兼容 IE6 了
	
	//选定具有这个属性且属性值不想等的
	a[title!=num1] { //不支持此 CSS 选择器
		color:red;
	}
	$('a[title!=num1]').css('color','red'); //jQuery 支持这种写法
	
	//选定具有这个属性且属性值是以一个空格分割的列表，其中包含属性值的
	a[title~=num] { //IE6 不支持
		color:red;
	}
	$('a[title~=num1]').css('color','red'); //兼容 IE6
	
	//选定具有这个属性且属性值含有一个指定字串的
	a[title*=num] { //IE6 不支持
		color:red;
	}
	$('a[title*=num]').css('color','red'); //兼容 IE6
	
	//选定具有多个属性且属性值匹配成功的
	a[bbb][title=num1] { //IE6 不支持
		color:red;
	}
	$('a[bbb][title=num1]').css('color','red'); //兼容 IE6

####四．基本过滤器	

过滤器主要通过特定的过滤规则来筛选所需的 `DOM` 元素，和 `CSS` 中的伪类的语法类
似：使用冒号(:)开头。

|过滤器名 |jQuery 语法 |说明| 返回
|:----|:----|:----|:----
|`:first` |`$('li:first')` |选取第一个元素 |单个元素
|`:last `|`$('li:last')` |选取最后一个元素 |单个元素
|`:not(selector)`| `$('li:not(.red)')` |选取 `class` 不是 `red` 的 `li` 元素 |集合元素
|`:even` |`$('li.even')` |选择索引(0 开始)是偶数的所有元素 |集合元素
|`:odd` |`$('li:odd')`| 选择索引(0 开始)是奇数的所有元素 |集合元素
|`:eq(index)`| `$('li:eq(2)')` |选择索引(0 开始)等于 `index` 的元素 |单个元素
|`:gt(index)`| `$('li:gt(2)')`|选择索引(0 开始)大于 `index` 的元素|集合元素
|`:lt(index)`| `$('li.lt(2)')`| 选择索引(0 开始)小于 `index` 的元素|集合元素
|`:header` |`$(':header')`|选择标题元素，`h1 ~ h6` |集合元素
|`:animated` |`$(':animated')` |选择正在执行动画的元素| 集合元素
|`:focus`| `$(':focus')` |选择当前被焦点的元素 |集合元素

---

	$('li:first').css('background', '#ccc'); //第一个元素
	$('li:last).css('background', '#ccc'); //最后一个元素
	$('li:not(.red)).css('background', '#ccc'); //非 class 为 red 的元素
	$('li:even').css('background', '#ccc'); //索引为偶数的元素
	$('li:odd).css('background', '#ccc'); //索引为奇数的元素
	$('li:eq(2)).css('background', '#ccc'); //指定索引值的元素
	$('li:gt(2)').css('background', '#ccc'); //大于索引值的元素
	$('li:lt(2)').css('background', '#ccc'); //小于索引值的元素
	$(':header').css('background', '#ccc'); //页面所有 h1 ~ h6 元素

*注意： `:focus` 过滤器，必须是网页初始状态的已经被激活焦点的元素才能实现元素获取。
而不是鼠标点击或者 `Tab` 键盘敲击激活的。*

	$('input').get(0).focus(); //先初始化激活一个元素焦点
	$(':focus').css('background', 'red'); //被焦点的元素

`jQuery` 为最常用的过滤器提供了专用的方法，已达到提到性能和效率的作用：
	
	$('li').eq(2).css('background', '#ccc'); //元素 li 的第三个元素，负数从后开始
	$('li').first().css('background', '#ccc'); //元素 li 的第一个元素
	$('li').last().css('background', '#ccc'); //元素 li 的最后一个元素
	$('li').not('.red').css('background', '#ccc'); //元素 li 不含 class 为 red 的元素
	
*注意：`:first`、`:last` 和 `first()`、`last()`这两组过滤器和方法在出现相同元素的时候，`first` 会
实现第一个父元素的第一个子元素，`last` 会实现最后一个父元素的最后一个子元素。所以，
如果需要明确是哪个父元素，需要指明：*	
	
	$('#box li:last').css('background', '#ccc'); //#box 元素的最后一个 li
	//或
	$('#box li).last().css('background', '#ccc'); //同上
	
####五. 内容过滤器	
	
	内容过滤器的过滤规则主要是包含的子元素或文本内容上。
	
|过滤器名| jQuery| 语法| 说明| 返回
|:----|:----|:----|:----
|`:contains(text)`|`$(':contains("ycku.com")')`|选取含有`"ycku.com"`文本的元素| 元素集合
|`:empty` |`$(':empty')`| 选取不包含子元素或空文本的元素 |元素集合
|`:has(selector)` |`$(':has(.red)')` |选取含有 `class` 是 `red `的元素 |元素集合
|`:parent` |`$(':parent')` |选取含有子元素或文本的元素 |元素集合	

---
	
	//选择元素文本节点含有 ycku.com 文本的元素
	$('div:contains("ycku.com")').css('background', '#ccc');
	$('div:empty').css('background', '#ccc'); //选择空元素
	$('ul:has(.red)').css('background', '#ccc'); //选择子元素含有 class 是 red 的元素
	$(':parent').css('background', '#ccc'); //选择非空元素
	
`jQuery` 提供了一个 `has()`方法来提高`:has` 过滤器的性能：	
	
	$('ul').has('.red').css('background', '#ccc'); //选择子元素含有 class 是 red 的元素	
	
`jQuery` 提供了一个名称和`:parent` 相似的方法， 但这个方法并不是选取含有子元素或文本
的元素，而是获取当前元素的父元素，返回的是元素集合。	
	
	$('li').parent().css('background', '#ccc'); //选择当前元素的父元素
	$('li').parents().css('background', '#ccc'); //选择当前元素的父元素及祖先元素
	$('li').parentsUntil('div').css('background', '#ccc'); //选择当前元素遇到 div 父元素停止

####六. 可见性过滤器	
	
	可见性过滤器根据元素的可见性和不可见性来选择相应的元素。
	
|过滤器名| `jQuery` 语法 |说明 |返回
|:----|:----|:----|:----
|`:hidden` |`$(':hidden')` |选取所有不可见元素 |集合元素
|`:visible` |`$(':visible')` |选取所有可见元素 |集合元素	

---	
	
	$('p:hidden).size(); //元素 p 隐藏的元素
	$('p:visible').size(); //元素 p 显示的元素		
	
*注意：`:hidden` 过滤器一般是包含的内容为：`CSS` 样式为 `display:none`、`input` 表单类型为
`type="hidden"`和 `visibility:hidden` 的元素。*	
	
####七. 子元素过滤器	
	
	子元素过滤器的过滤规则是通过父元素和子元素的关系来获取相应的元素。
	
|过滤器名| jQuery 语法 |说明|返回
|:----|:----|:----|:----
|`:first-child` |`$('li:first-child')` |获取每个父元素的第一个子元素 |集合元素
|`:last-child` |`$('li:last-child')` |获取每个父元素的最后一个子元素 |集合元素
|`:only-child`| `$('li:only-child')`| 获取只有一个子元素的元素 |集合元素
|`:nth-child(odd/even/eq(index))`|`$('li:nth-child(even)')`|获取每个自定义子元素的元素(索引值从 1 开始计算) |集合元素	

---
	
	$('li:first-child').css('background', '#ccc'); //每个父元素第一个 li 元素
	$('li:last-child').css('background', '#ccc'); //每个父元素最后一个 li 元素
	$('li:only-child').css('background', '#ccc'); //每个父元素只有一个 li 元素
	$('li:nth-child(odd)').css('background', '#ccc'); //每个父元素奇数 li 元素
	$('li:nth-child(even)').css('background', '#ccc'); //每个父元素偶数 li 元素
	$('li:nth-child(2)').css('background', '#ccc'); //每个父元素第三个 li 元素
	
####八. 其他方法	
	
	`jQuery` 在选择器和过滤器上，还提供了一些常用的方法，方便我们开发时灵活使用。
	
|方法名| jQuery 语法| 说明| 返回
|:----|:----|:----|:----
|`is(s/o/e/f)` |`$('li').is('.red')`| 传递选择器、`DOM`、`jquery` 对象| 集合元素
|`hasClass(class)`|`$('li').eq(2).hasClass('red')`|其实就是 `is("." + class)` |集合元素
|`slice(start, end)`| `$('li').slice(0,2)`|选择从 `start` 到 `end` 位置的元素，<br />如果是负数，则从后开始 |集合元素
|`filter(s/o/e/f)` |`$('li').filter('.red')`||
|`end()`|`$('div').find('p').end()`|获取当前元素前一次状态 |集合元素
|`contents()` |`$('div').contents()`|获取某元素下面所有元素节点，包括文本节点，<br />如果是 `iframe`，则可以查找文本内容集合元素	
	
---	
	
	$('.red').is('li'); //true，选择器，检测 class 为是否为 red
	$('.red').is($('li')); //true，jQuery 对象集合，同上
	$('.red').is($('li').eq(2)); //true，jQuery 对象单个，同上
	$('.red').is($('li').get(2)); //true，DOM 对象，同上
	$('.red').is(function () { //true，方法，同上
		return $(this).attr('title') == '列表 3'; //可以自定义各种判断
	}));
	$('li').eq(2).hasClass('red'); //和 is 一样，只不过只能传递 class
	$('li').slice(0,2).css('color', 'red'); //前三个变成红色
	
*注意：这个参数有多种传法和 `JavaScript` 的 `slice` 方法是一样的比如：`slice(2)`，从第三个
开始到最后选定；`slice(2,4)`，第三和第四被选定；`slice(0,-2)`，从倒数第三个位置，向前选定
所有；`slice(2,-2)`，前两个和末尾两个未选定。*	
	
	$("div").find("p").end().get(0); //返回 div 的原生 DOM
	$('div').contents().size(); //返回子节点(包括文本)数量
	$('li').filter('.red').css('background','#ccc'); //选择 li 的 class 为 red 的元素
	$('li').filter('.red, :first, :last').css('background','#ccc'); //增加了首尾选择
	//特殊要求函数返回
	$('li').filter(function () {
	return $(this).attr('class') == 'red' && $(this).attr('title') == '列表 3';
	}).css('background', '#ccc');
	
####九. 表单常规选择器

我们可以使用 `id`、 类(`class`)和元素名来获取表单字段， 如果是表单元素， 都必须含有 `name`
属性，还可以结合属性选择器来精确定位。	
	
	$('input').val(); //元素名定位，默认获取第一个
	$('input').eq(1).val(); //同上，获取第二个
	$('input[type=password]').val(); //选择 type 为 password 的字段
	$('input[name=user]').val(); //选择 name 为 user 的字段

那么对于 `id` 和类(`class`)用法比较类似，也可以结合属性选择器来精确的定位，在这里我
们不在重复。对于表单中的其他元素名比如：`textarea`、`select` 和 `button` 等，原理一样，不在
重复。

虽然可以使用常规选择器来对表单的元素进行定位， 但有时还是不能满足开发者灵活多
变的需求。所以，`jQuery` 为表单提供了专用的选择器。

|方法名 |描述 |返回
|:----|:----|:----
|`:input` |选取所有 input、textarea、select 和 button 元素 |集合元素
|`:text` |选择所有单行文本框，即 type=text |集合元素
|`:password`| |选择所有密码框，即 type=password |集合元素
|`:radio`| 选择所有单选框，即 type=radio |集合元素
|`:checkbox` |选择所有复选框，即 type=checkbox |集合元素
|`:submit`| 选取所有提交按钮，即 type=submit| 集合元素
|`:reset`| 选取所有重置按钮，即 type=reset |集合元素
|`:image`| 选取所有图像按钮，即 type=image| 集合元素
|`:button`| 选择所有普通按钮，即 button 元素| 集合元素
|`:file`| 选择所有文件按钮，即 type=file| 集合元素
|`:hidden`| 选择所有不可见字段，即 type=hiddenv 集合元素

	$(':input').size(); //获取所有表单字段元素
	$(':text).size(); //获取单行文本框元素
	$(':password').size(); //获取密码栏元素
	$(':radio).size(); //获取单选框元素
	$(':checkbox).size(); //获取复选框元素
	$(':submit).size(); //获取提交按钮元素
	$(':reset).size(); //获取重置按钮元素
	$(':image).size(); //获取图片按钮元素
	$(':file).size(); //获取文件按钮元素
	$(':button).size(); //获取普通按钮元素
	$(':hidden).size(); //获取隐藏字段元素

*注意：这些选择器都是返回元素集合，如果想获取某一个指定的元素，最好结合一下属
性选择器。*

	$(':text[name=user]).size(); //获取单行文本框 name=user 的元素

####九. 表单过滤器
	
`jQuery` 提供了四种表单过滤器，分别在是否可以用、是否选定来进行表单字段的筛选过
滤。	

|方法名| 描述| 返回
|`:enabled` |选取所有可用元素 |集合元素
|`:disabled` |选取所有不可用元素 |集合元素
|`:checked` |选取所有被选中的元素，单选和复选字段 |集合元素
|`:selected` |选取所有被选中的元素，下拉列表 |集合元素
    			
	$(':enabled').size(); //获取可用元素
	$(':disabled).size(); //获取不可用元素
	$(':checked).size(); //获取单选、复选框中被选中的元素
	$(':selected).size(); //获取下拉列表中被选中的元素	
		
	
	
	
	
	
	
	
	
	
	
	
	

