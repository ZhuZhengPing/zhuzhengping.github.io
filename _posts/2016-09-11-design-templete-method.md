---
layout: post
title:  "模板方法模式"
date:   2016-09-10 16:32:18 +0800
categories: design
tags: design 模板方法模式
author: Zhengping Zhu
---

* content
{:toc}

## 概念

模板方法模式属于 GoF 行为模式分组，当算法骨架定义完毕但有些步骤推迟给子类实现时，应用该模式。





模板方法模式定义了算法的骨架结构，但将某些步骤和细节推迟给子类实现。算法的结构和工作流保持不变，但具体步骤的细节给子类来实现。

### UML

下图给出了模板方法模式的 UML 示意图。

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f7sacfnwfhj30gn07xjs8.jpg" style="width:100%" alt="模板方法模式" />

上图所示的类共同构成了模板方法模式。它们的角色如下

>* AbstractClass 类定义了骨架流程工作流，其中一些抽象步骤将由 ConcreteClassA 和 ConcreteClassB 重写和实现。这使得算法的细节可以根据子类不同而有所改变，但允许整个结构保持一致。
>* ConcreteClassA 和 ConcreteClassB 继承自 AbstractClass,它们实现了抽象方法并给出了算法的细节。

### 代码示例

本例中，将模板方法模式应用于一个电子商务网站的退货处理系统。对于每张退货单，都需要经过一系列处理流程，根据待处理的退货的类型不同，这些流程稍有不同。在这家虚构的公司中，退货单有两种方式：无条件退货和有缺陷退货单。无条件退货允许客户退还商品并接收全额退款，但需减去最初邮寄和包装的费用，然后将商品返回到库存中。如果客户收到一件有缺陷的商品并希望退款，就形成有问题退货，该退款包括最初支付的邮寄和包装费用，此外还有一张返厂单。

下图给出了该练习中涉及的所有类

<img src="" style="width:100%" alt="模板方法" />

下面开始该练习，向项目中添加一个新类 ReturnAction

```c#
namespace Pattern.TempleteMethod
{
    public enum ReturnAction
    {
        FaultyReturn=0,
        NoQuibblesReturn=1
    }
}
```

这个枚举类型可用来确定正在处理的退货是何种类型。接下来，添加退货单实体，向项目中添加一个新类 ReturnOrder

```c#
namespace Pattern.TempleteMethod
{
    public class ReturnOrder
    {
        public ReturnAction Action { get; set; }
        public string PaymentTransactionId { get; set; }
        public decimal PricePaid { get; set; }
        public decimal PostageCost { get; set; }
        public long ProductId { get; set; }
        public decimal AmountToRefund { get; set; }
    }
}
```














