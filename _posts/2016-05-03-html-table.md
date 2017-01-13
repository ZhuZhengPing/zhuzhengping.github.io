---
layout: post
title:  "XHTML中的表格的基本格式"
date:   2016-05-03 15:14:54 +0800
categories: XHTML
tags: 表格的基本格式
---

* content
{:toc}

这里主要是讲述XHTML学习内容中的表格的基本格式。




## HTNL表格基本格式

```html
	<table>		用来声明表格的开始
		<tr>	用来设置表格的行
			<th>...</th>		用来设置标题的栏位
		</tr>
		<tr>
			<td>...</td>		用来设置数据的栏位
		</tr>
	</table>
```

**`<tahle>`标签下的属性**

```html
属性				属性值			说明

 border				 像素        	设置表格的边线
 
 cellspacing 		 	像素		 绝对设置,存储格框线宽度
 
				百分比		 相对设置,存储格框线宽度
					
 cellpadding			 像素		 绝对设置,数据与框线的距离
 
				百分比		 相对设置,数据与框线的距离
					
 width 				 像素		 绝对设置,像素表示表格宽度
 
				百分比		 相对设置,百分比表表格宽度
					
 height				 像素        	绝对设置,像素表示表格宽度
 
				百分比		 绝对设置,百分比表表格宽度
					
 align				 left		表格往左靠(默认)
 
				center		 表格往中靠
					
				right		  表格网右靠
					
 bgcolor			英文/十六	 表格的背景颜色
 
 background          		URL         	表格的背景图片
 
 summary			字符串		 用来描述表格数据说明
 
 bordercolor			英文/十六	 边框的颜色
 
 bordercolorlight		同上		 边框的亮色
 
 bordercolordark	   	同上		 边框的暗色
```

**`<table>`标签下的边框设置**

```html
属性名称		属性值			说明
frame		void			不要显现表格的边线
		above			只要显现出表格的上边线
		below			只显现出表格的下边线
		hsides			只显示表格的上下边线
		vsides			只显现表格的左右边线
		lhs			只显现表格的左边线
		rhs			显现表格的右边线											 
		border/box      	会显现出表格的所有边线

rules		rows            	只显示出横行的格框线
		cols			只显示出直行的格框线
		all			显示全部格框线
		groups          	表示列组合水平部分
		none			不显示任何格框线
```

 **`<tr>``<th>``<td>`标签下的常用属性**

```html
属性名称				属性值			说明
width				像素			绝对设置,以像素值设置宽	
				百分比			相对设置,以百分比设置宽
height				像素			绝对设置,以像素值设置高
				百分比			相对设置,以百分比设置宽
bgcolor				英文/十六		数据栏的颜色设置
align(水平方向)			left			数据靠左
				center			数据靠中
				right			数据靠右
valign(垂直方向)
				top			数据靠上
				middle			数据靠中
				bottom			数据靠下
nowrap				无			在单元格中换行
```

**拆分与合并单元格**

```html
属性				属性值			说明
colspan			 	 数字			向两边扩展栏位
rowspan			      数字			向下扩展栏位
```

**表格的结构化、直列化、标题**


结构化格式：

```html
		<table>
		<thead>……</thead>    --------表头区
		<tbody>……</tbody>    --------表体区
		………………………
		<tfoot>……</tfoot>	  --------表尾区
		</table>
```

**直列化格式：`<colgroup>`….`</colgroup>`**

```html
属性			属性值			说明
align			left 			靠左
			center			靠中
			right			靠右
valign			top			靠上
			middle			靠中
			bottom			靠下
span			数字			直列数目
width			像素/百分比		宽度
```

**个别直列设置**

格式:<col>功能完全和<colgroup>一样.

**表格的标题**

```html
<table>
	<caption>….</caption>
</table>
```

`<caption>`下的属性值有:

```html
属性名称			属性值			说明
align			top			标题在表格上方
			bottom		    	标题在表格下方
```



