---
layout: post
title:  "装饰模式"
date:   2016-12-06 16:32:18 +0800
categories: design
tags: design decorative
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在应用程序的一些场合中，我们需要创建一个基本功能的对象，并且能动态地在该对象上添加一些额外的功能。例如，我们需要创建一个Stream对象来处理一些数据，但在某些情况下，这个流对象能够在某些情况下加密。所以我们可以把基本的Stream对象准备好，然后在需要时动态添加加密功能。

另一种办法是，在 stream 类里面添加一个 bool 类型的开关，通过这个开关来控制 stream 是否加密。但是这种方法会有类似的问题 - 我们如何在类中添加类型定制加密逻辑？现在，通过对现有类进行子类化并在派生类中具有自定义加密逻辑，可以很容易地做到这一点。

当 stream 只需要某一种加密时，这么做是很有用的，如果要实现多个加密功能动态组合添加到这个类，这可能正是装饰模式使用的场景，GoF将装饰器模式定义为"动态附加功能到对象。装饰器提供了一个灵活的替代子类化扩展功能"

[源码下载地址](https://www.codeproject.com/KB/architecture/479635/DecoratorSampleApp.zip)

[转载自 codeproject](https://www.codeproject.com/articles/479635/understandingplusandplusimplementingplusdecoratorp)







在查看装饰器模式的细节之前，让我们先看看这个模式的类图，看看每个类都负责什么。

<img src="https://www.codeproject.com/KB/architecture/479635/GoFClassDiagram.jpg" alt="装饰模式" />

>* Component: 它定义了实际对象的接口，需要动态添加功能到ConcreteComponent中
>* ConcreteComponent: 可以动态添加功能的实际对象。
>* Decorator: 这定义了可以添加到ConcreteComponent的所有动态功能的接口
>* ConcreteDecorator: 所有可以添加到ConcreteComponent的功能。每个需要的功能都是一个ConcreteDecorator类。

### 代码实现

为了理解装饰器模式，我们来看一个面包店的计费系统的例子。此面包店专营蛋糕和糕点。客户可以购买蛋糕和糕点，然后选择其他额外的东西。额外的产品是奶油，樱桃，气味和名片。

现在，如果我们采用经典的子类化方法来创建这个计费系统，需要创建下面的类

>* 蛋糕
>* 奶油和樱桃的蛋糕
>* 奶油和樱桃和气味的蛋糕
>* 奶油和樱桃和气味和名片的蛋糕
>* 樱桃蛋糕
>* 糕点
>* 奶油和樱桃的糕点
>* 奶油和樱桃和气味的糕点
>* 奶油和樱桃和气味和名片的糕点
>* 樱桃糕点 
>* 更多 更多..............

创建和维护这些类是一个非常大的问题，让我们来看看如何用装饰模式来实现这个功能。

创建零件类

```
public abstract class BakeryComponent
{
    public abstract string GetName();
    public abstract double GetPrice();
}
```

这个类定义了实际对象的接口，需要将功能动态添加到组件。所以让我们现在创建组件类

```c#
class CakeBase : BakeryComponent
{
    // In real world these values will typically come from some data store
    private string m_Name = "Cake Base";
    private double m_Price = 200.0;

    public override string GetName()
    {
        return m_Name;
    }

    public override double GetPrice()
    {
        return m_Price;
    }
}

class PastryBase : BakeryComponent
{
    // In real world these values will typically come from some data store
    private string m_Name = "Pastry Base";
    private double m_Price = 20.0;

    public override string GetName()
    {
        return m_Name;
    }

    public override double GetPrice()
    {
        return m_Price;
    }
}
```

我们已经创建了基础类，现在需要研究将其他需要的东西动态地添加上去，看看下面的 Decorator 装饰类

```c#
public abstract class Decorator : BakeryComponent
{
    BakeryComponent m_BaseComponent = null;
    
    protected string m_Name = "Undefined Decorator";
    protected double m_Price = 0.0;

    protected Decorator(BakeryComponent baseComponent)
    {
        m_BaseComponent = baseComponent;
    }

    #region BakeryComponent Members

    string BakeryComponent.GetName()
    {
        return string.Format("{0}, {1}", m_BaseComponent.GetName(), m_Name);
    }

    double BakeryComponent.GetPrice()
    {
        return m_Price + m_BaseComponent.GetPrice();
    }
    #endregion
}
```

这里有两件事值得关注，首先是这个类实现了 BakeryComponent 接口，实现了接口的蛋糕也是一个蛋糕，因此所有操作也应该装饰这个蛋糕。其次需要注意它还包含BakeryComponent对象，因为我们需要蛋糕和装饰项之间的逻辑is-a关系，但实际上不是这样的情况，我们在里面存一个BakeryComponent对象，以便能够模仿这种关系。

简而言之，我们所做的不是使用继承的静态is关系，我们通过使用组合创建一个动态的is-a关系。

现在看看如何实现ConcreteDecorators

```c#
class ArtificialScentDecorator : Decorator
{
    public ArtificialScentDecorator(BakeryComponent baseComponent)
        : base(baseComponent)
    {
        this.m_Name = "Artificial Scent";
        this.m_Price = 3.0;
    }
}

class CherryDecorator : Decorator
{
    public CherryDecorator(BakeryComponent baseComponent)
        : base(baseComponent)
    {
        this.m_Name = "Cherry";
        this.m_Price = 2.0;
    }
}

class CreamDecorator : Decorator
{
    public CreamDecorator(BakeryComponent baseComponent)
        : base(baseComponent)
    {
        this.m_Name = "Cream";
        this.m_Price = 1.0;
    }
}
```

现在在这些类中，我们只是设置装饰器的具体值，而不是定制任何行为.如果我们有需要，可以自定义行为或者在 ConcreteDecorator 对象中添加更多的状态变量，为了说明这一点，假如每当客户选择在他的蛋糕上添加名片时，他可以获得下一次购买的折扣卡，我们需要在收据中显示此消息，让我们看看ConcreteDecorator在这种情况下如何添加自己的状态和行为

```c#
class NameCardDecorator : Decorator
{
    private int m_DiscountRate = 5;

    public NameCardDecorator(BakeryComponent baseComponent)
        : base(baseComponent)
    {
        this.m_Name = "Name Card";
        this.m_Price = 4.0;
    }

    public override string GetName()
    {
        return base.GetName() + 
            string.Format("\n(Please Collect your discount card for {0}%)", 
            m_DiscountRate);
    }        
}
```

现在我们的客户端应用程序可以创建这些ConcreteComponents与任何装饰器的组合。让我们来看看客户端的示例代码实现。

```c#
static void Main(string[] args)
{
    // Let us create a Simple Cake Base first
    CakeBase cBase = new CakeBase();
    PrintProductDetails(cBase);

    // Lets add cream to the cake
    CreamDecorator creamCake = new CreamDecorator(cBase);
    PrintProductDetails(creamCake);
    
    // Let now add a Cherry on it
    CherryDecorator cherryCake = new CherryDecorator(creamCake);
    PrintProductDetails(cherryCake);

    // Lets now add Scent to it
    ArtificialScentDecorator scentedCake = new ArtificialScentDecorator(cherryCake);
    PrintProductDetails(scentedCake);

    // Finally add a Name card on the cake
    NameCardDecorator nameCardOnCake = new NameCardDecorator(scentedCake);
    PrintProductDetails(nameCardOnCake);
    
    // Lets now create a simple Pastry
    PastryBase pastry = new PastryBase();
    PrintProductDetails(pastry);

    // Lets just add cream and cherry only on the pastry 
    CreamDecorator creamPastry = new CreamDecorator(pastry);
    CherryDecorator cherryPastry = new CherryDecorator(creamPastry);
    PrintProductDetails(cherryPastry);
}
```

运行程序

<img src="https://www.codeproject.com/KB/architecture/479635/Screenshot.jpg" />

在包装之前，让我们看看我们的示例应用程序如何在类图中实现装饰器模式，并让它与装饰器模式的类图进行比较

<img src="https://www.codeproject.com/KB/architecture/479635/OurClassDiagram.jpg" />









