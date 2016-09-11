---
layout: post
title:  "装饰模式"
date:   2016-09-10 16:32:18 +0800
categories: design
tags: design 装饰模式
author: Zhengping Zhu
---

* content
{:toc}

## 概念

采用装饰模式，可以通过组合动态地向对象中添加新行为。该模式的实现方式是：要么从同一个基类继承，要么实现一个共享的接口并注入待装饰类的实例。换句话说，装饰模式就是用一个带有扩展行为或状态的类来包装现有类的过程。可以将多个装饰添加到一个类中以组合扩展行为。






<img src="http://ww3.sinaimg.cn/mw690/006dag38gw1f7pxc3ubasj30mc0ehwfs.jpg" style="width:100%" alt="装饰模式" />

上图所示的类共同构成了装饰模式。它们的角色如下

>* IProduct 定义了商品的接口。DefaultProduct 和 ProductDecorator 必须实现该接口。
>* DefaultProduct 提供了可供装饰的类的基本功能
>* ProductDecorator 实现了 IProduct 接口，并且被注入了一个指向 IProduct 实例的引用
>* ConcreteDecoratorA 继承自 ProductDecorator，并向 IProduct 实例中添加状态和新行为。

### 代码示例

在该示例中，使用装饰模式将折扣和现金乘数(可能用于某种商品类型)应用到商品列表中。ProductService 类负责协调商品列表的检索，然后用折扣和现金乘数来装饰这些商品。

<img src="" style="width:100%" />

要构建解决方案，首先创建一个新的解决方案 ASPPatterns.Chap5.DecoratorPattern，并添加一个新的 C#类库项目 ASPPatterns.Chap5.DecoratorPattern，并添加一个新的.Model。另外，要创建简单的领域模型











