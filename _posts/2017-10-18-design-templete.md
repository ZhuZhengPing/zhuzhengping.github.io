---
layout: post
title:  "模板方法模式"
date:   2017-10-18 16:32:18 +0800
categories: design
tags: design factory
author: Zhengping Zhu
---

* content
{:toc}

## 概念

模板方法模式——在一个抽象类中定义一个操作中的算法骨架（对应于生活中的大家下载的模板），而将一些步骤延迟到子类中去实现（对应于我们根据自己的情况向模板填充内容）。模板方法使得子类可以不改变一个算法的结构前提下，重新定义算法的某些特定步骤，模板方法模式把不变行为搬到超类中，从而去除了子类中的重复代码。















### 模板方法模式的实现

理解了模板方法的定义之后，自然实现模板方法也不是什么难事了，下面以生活中炒蔬菜为例来实现下模板方法模式。在现实生活中，做蔬菜的步骤都大致相同，如果我们针对每种蔬菜类定义一个烧的方法，这样在每个类中都有很多相同的代码，为了解决这个问题，我们一般的思路肯定是把相同的部分抽象出来到抽象类中去定义，具体子类来实现具体的不同部分，这个思路也正式模板方法的实现精髓所在，具体实现代码如下：

```c#
// 客户端调用
class Client
{
	static void Main(string[] args)
	{
		// 创建一个菠菜实例并调用模板方法
		Spinach spinach = new Spinach();
		spinach.CookVegetabel();
		Console.Read();
	}
}

public abstract class Vegetabel
{
	// 模板方法，不要把模版方法定义为Virtual或abstract方法，避免被子类重写，防止更改流程的执行顺序
	public  void CookVegetabel()
	{
		Console.WriteLine("抄蔬菜的一般做法");
		this.pourOil();
		this.HeatOil();
		this.pourVegetable();
		this.stir_fry();
	}

	// 第一步倒油
	public  void pourOil()
	{
		Console.WriteLine("倒油");
	}

	// 把油烧热
	public  void HeatOil()
	{
		Console.WriteLine("把油烧热");
	}

	// 油热了之后倒蔬菜下去，具体哪种蔬菜由子类决定
	public abstract void pourVegetable();

	// 开发翻炒蔬菜
	public  void stir_fry()
	{
		Console.WriteLine("翻炒");
	}
}

// 菠菜
public class Spinach : Vegetabel
{
   
	public override void pourVegetable()
	{
		Console.WriteLine("倒菠菜进锅中");
	}
}

// 大白菜
public class ChineseCabbage : Vegetabel
{      
	public override void pourVegetable()
	{
		Console.WriteLine("倒大白菜进锅中");
	}
}
```












