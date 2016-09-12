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

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f7r52yi57xj30kg0bsmzg.jpg" style="width:100%" />

要构建解决方案，首先创建一个新的解决方案 ASPPatterns.Chap5.DecoratorPattern，并添加一个新的 C#类库项目 ASPPatterns.Chap5.DecoratorPattern，并添加一个新的.Model。另外，要创建简单的领域模型，它包含 Product 实体和 Price 接口，以及两个实现了 Price 接口的装饰对象。

向项目中添加一个带有如下契约的新接口 IPrice

```c#
namespace Pattern.Decorator
{
    public interface IPrice
    {
        decimal Cost { get; set; }
    }
}
```

添加一个表示商品实体类 Product,并添加如下属性

```c#
namespace Pattern.Decorator
{
    public class Product
    {
        public IPrice Price { get; set; }
    }
}
```

可以添加 IPrice 接口的3个实现。第一个实现时 BasePrice 类。该类提供了商品价格的默认行为，并且由资源库在从数据存储中提取商品列表时设置该价格。向项目中添加一个新类 BasePrice，其定义如下

```c#
namespace Pattern.Decorator
{
    public class BasePrice:IPrice
    {
        private Decimal _cost;

        public decimal Cost
        {
            get
            {
                return _cost;
            }
            set
            {
                _cost = value;
            }
        }
    }
}
```

添加的 IPrice 接口的第2个实现使用商业折扣逻辑来装饰默认的价格行为。新类 TradeDiscountPriceDecorator,其代码定义如下

```c#
namespace Pattern.Decorator
{
    public class TradeDiscountPriceDecorator:IPrice
    {
        private IPrice _basePrice;

        public TradeDiscountPriceDecorator(IPrice price)
        {
            _basePrice = price;
        }

        public decimal Cost
        {
            get
            {
                return _basePrice.Cost * 0.95m;
            }
            set
            {
                _basePrice.Cost = value;
            }
        }
    }
}
```

TradeDiscountPriceDecorator 类的作用是包装 IPrice 接口的实现，将价格降低5个百分点。因为 Product 类只是通过接口引用价格，所以它并不知道自己正在与 TradeDiscountPriceDecorator 类交互。

IPrice 接口的第3个实现是使用现金乘数装饰 IPrice 实现的类。向项目中添加一个新类 CurrencyPriceDecorator

```c#
namespace Pattern.Decorator
{
    public class CurrencyPriceDecorator:IPrice
    {

        private IPrice _basePrice;
        private decimal _exchangeRate;

        public CurrencyPriceDecorator(IPrice price, decimal exchangeRate)
        {
            _basePrice = price;
            _exchangeRate = exchangeRate;
        }

        public decimal Cost
        {
            get
            {
                return _basePrice.Cost * _exchangeRate;
            }
            set
            {
                _basePrice.Cost = value;
            }
        }
    }
}
```

与 TradeDiscountPriceDecorator 类一样，CurrencyPriceDecorator将 IPrice 实现作为实参构造器，同时带有比率实参并将比率应用到基价，不管该基价实际上是 BasePrice 类还是 TradeDiscountPriceDecorator类。

为了把装饰行为应用到 Product 类，添加了一组扩展方法。向项目中添加一个新类 ProductCollectionExtensionMethods.

```c#
namespace Pattern.Decorator
{
    public static class ProductCollectionExtensionMethods
    {
        public static void ApplyCurrencyMultiplier(this IEnumerable<Product> products)
        {
            foreach (Product p in products)
            {
                p.Price = new CurrencyPriceDecorator(p.Price, 0.78m);
            }
        }

        public static void ApplyTradeDiscount(this IEnumerable<Product> products)
        {
            foreach (Product p in products)
            {
                p.Price = new TradeDiscountPriceDecorator(p.Price);
            }
        }
    }
}
```

这两个方法只是遍历商品集合，并根据调用的方法来应用 CurrencyPriceDecorator 或 TradeDiscountPriceDecorator。

这里使用的是扩展方法，这样 ProductService 类中的代码量就可以保持最少，并且使 ProductService 类只负责任务协调而不关心如何应用装饰类的底层逻辑。

为了让 ProductService 类能够获取一组商品，需要添加商品资源库接口，因此向项目中添加一个新的接口 IProductRepository, 该接口只有一个方法 FindAll，它只返回一个 Product 对象集合

```c#
namespace Pattern.Decorator
{
    public interface IProductRepository
    {
        IEnumerable<Product> FindAll();
    }
}
```

要完成解决方案，需要添加 ProductService 类，它负责协调检索并应用商业折扣和现金乘积。向项目中添加一个新类 ProductService.

```c#
namespace Pattern.Decorator
{
    public class ProductService
    {
        private IProductRepository _productRepository;

        public ProductService(IProductRepository productRepository)
        {
            _productRepository = productRepository;
        }

        public IEnumerable<Product> GetAllProducts()
        {
            IEnumerable<Product> products = _productRepository.FindAll();

            products.ApplyTradeDiscount();

            products.ApplyCurrencyMultiplier();

            return products;
        }
    }
}
```

可以看出，ProductService 类用 IProductRepository 作为构造器实参，并且它只有一个返回商品集合的方法，这些商品都应用了商业折扣和现金乘积。前面提及，通过使用扩展方法，ProductService 方法中的代码量保持最少，同时可以让人们立即明白 ProductService 类的责任是什么，而无需分心去弄清楚实现折扣和现金乘数的应用程序。











