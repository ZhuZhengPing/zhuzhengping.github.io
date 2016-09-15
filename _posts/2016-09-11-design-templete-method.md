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

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f7u01c0hovj30sc0c70wf.jpg" style="width:100%" alt="模板方法" />

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

ReturnOrder 实体表示客户正在办理退货手续的订单。Action 属性确定退货单的类型，PaymentTransactionId 指用来该订单的原始支付，PricePaid 和 PostageCost 分别指订单总价和运费。ProductId 存放退货商品的唯一标识符。最后，设置 AmountToRefund，这是退还给客户的总金额。

在建立领域模型后，可以实现抽象模板方法，它将由具体的缺陷退货和无条件退货子类重写。为了创建模板方法，向项目中添加一个新类 ReturnProcessTemplate

```c#
namespace Pattern.TempleteMethod
{
    public abstract class ReturnProcessTemplete
    {
        protected abstract void GenerateReturnTransactionFor(ReturnOrder returnOrder);
        protected abstract void CalculateRefundFor(ReturnOrder returnOrder);

        public void Process(ReturnOrder returnOrder)
        {
            GenerateReturnTransactionFor(returnOrder);
            CalculateRefundFor(returnOrder);
        }
    }
}
```

该类以及它的前两个方法均是抽象的，需要由子类实现。第三个方法只在两个抽象方法中调用并传入 ReturnOrder 实体作为参数。

现在可以添加两个模板方法子类。首先向项目中添加一个新类 NoQuibblesReturnProcess

```c#
namespace Pattern.TempleteMethod
{
    public class NoQuibblesReturnProcess:ReturnProcessTemplete
    {

        protected override void GenerateReturnTransactionFor(ReturnOrder returnOrder)
        {
            throw new NotImplementedException();
        }

        protected override void CalculateRefundFor(ReturnOrder returnOrder)
        {
            returnOrder.AmountToRefund = returnOrder.PricePaid;
        }
    }
}
```

前面曾经提及，NoQuibblesReturnProcess 将商品退还入库，该逻辑位于重写后的 GenerateReturnTransactionFor 方法中。为了使该练习简单，这里并没有包含实现该功能的代码，但通常会在这里用代码来添加一个库存事务，增加退货商品的总库存。

重写的方法 CalculateRefundFor 只是将退货单上的 AmountToRefund 属性设置为商品的原始价格。注意，这里并没有退还邮寄费用。

FaultyReturnProcess 类是第二个继承 ReturnProcessTemplate 的子类。该类负责处理有缺陷退货商品。向项目中添加一个新类 FaultyReturnProcess.

```c#
namespace Pattern.TempleteMethod
{
    public class FaultyReturnProcess:ReturnProcessTemplete
    {
        protected override void GenerateReturnTransactionFor(ReturnOrder returnOrder)
        {
            throw new NotImplementedException();
        }

        protected override void CalculateRefundFor(ReturnOrder returnOrder)
        {
            returnOrder.AmountToRefund = returnOrder.PricePaid + returnOrder.PostageCost;
        }
    }
}
```

重写的 GenerateReturnTransactionFor 方法创建一个返厂单，用于发送缺陷商品以获取退款。同样，处于简洁性考虑，这里没有包含实现该功能的代码。CalculateRefundFor 和 NoQuibblesReturnProcess 的不同之处在于，在返回给客户的货代中包含邮寄费用。

在创建协调退货处理的 Service 类之前，需要某种方式根据退货单的类型来获取正确的处理类。创建一个新类 ReturnProcessFactory

```c#
namespace Pattern.TempleteMethod
{
    public static class ReturnProcessFactory
    {
        public static ReturnProcessTemplete CreateFrom(ReturnAction returnAction)
        {
            switch (returnAction)
            {
                case ReturnAction.FaultyReturn:
                    return new FaultyReturnProcess();
                case ReturnAction.NoQuibblesReturn:
                    return new NoQuibblesReturnProcess();
                default:
                    throw new ApplicationException("No Process Template defined for Return Action of " + returnAction.ToString());
            }
        }
    }
}
```

Factory 类隐藏了复杂性，不让客户看见，同时确保该逻辑放在一个位置上交由 Factory 类负责

最后，可以向项目中添加 ReturnOrderService 类

```c#
namespace Pattern.TempleteMethod
{
    public class ReturnService
    {
        public void Process(ReturnOrder returnOrder)
        {
            ReturnProcessTemplete returnProcess = ReturnProcessFactory.CreateFrom(returnOrder.Action);

            returnProcess.Process(returnOrder);
        }
    }
}
```




