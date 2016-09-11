---
layout: post
title:  "工厂模式"
date:   2016-09-10 16:32:18 +0800
categories: design
tags: design 工厂模式
author: Zhengping Zhu
---

* content
{:toc}

## 概念

工厂模式的主要作用是隐藏创建对象的复杂性。同样，客户通常不指定具体要创建的类。相反，客户将面向接口或抽象类进行编码，让 Factory 类负责创建具体的类型。通常，Factory 类有一个返回抽象类或接口的静态方法。客户通常提供某种信息，然后 Factory 类使用提供的信息来确定创建并返回哪个子类。









将创建子类的责任抽象出来的好处是，允许客户代码无需考虑依赖类的具体细节。Factory 模式的另一个好处是，把负责对象创建的代码集中起来，如果需要修改对象生成方式，可以轻松定位并更新，而不会影响到依赖它的代码。

<img src="http://ww3.sinaimg.cn/mw690/006dag38jw1f7pewwcw8dj30rg0eadhe.jpg" style="width:100%" />

>* Client 类通过调用 Factory 类来获取 IProduct 的实现。Client 类传递一些有关子类类型的信息，但并不知道如何创建它。
>* Factory 类负责根据形参提供的信息创建子类
>* IProduct 是客户在其代码例程中引用的接口，由 ConcreteProductA 和 ConcreteProductB 实现。
>* ConcreteProductA 和 ConcreteProductB 是 IProduct 的子类实现。

### 示例代码

在这个场景中，OrderService 类只有一个名为 Dispatch 的方法，该方法负责协调货运公司对象的创建，该对象又被用来创建包裹的托运标识符。

<img src="http://ww1.sinaimg.cn/mw690/006dag38jw1f7pgf0bobtj30gy0cz40i.jpg" style="width:80%" alt="工厂模式" />

首先，构建简单的领域模型，该模型由 Order 实体和 Address 值对象组成，分别表示真实的订单和送货地址。向项目中添加一个新的类 Address.

```c#
public class Address
{
	public string CountryCode { get; set; }
}
```

在向项目中添加一个类 Order

```c#
public class Order
{
	public decimal TotalCost { get; set; }
	public decimal WeightInKG { get; set; }
	public string CourierTrackingId { get; set; }
	public Address DispatchAddress { get; set; }
}
```

接下来，需要为货运公司创建接口。向项目中添加一个新的接口 IShippingCourier,其契约定义如下

```c#
public interface IShippingCourier
{
	string GenerateConsignmentLabelFor(Address address);
}
```

IShippingCourier 接口仅有一个简单的方法，该方法将 Address 参数作为实参并返回一个托运ID字符串

现在已经定义了契约，可以添加该接口的两个实现了。向项目中添加一个新类 DHL，其代码如下

```c#
public class DHL:IShippingCourier
{
	public string GenerateConsignmentLabelFor(Address address)
	{
		return "DHL-XXXX-XXXX-XXXX";
	}
}
```

再向项目中添加该接口的领一个实现 RoyalMail

```c#
public class RoyalMail:IShippingCourier
{
	public string GenerateConsignmentLabelFor(Address address)
	{
		return "RMXXXX-XXXX-XXXX";
	}
}
```

为了让练习保持简单，这两个货运公司实现只返回表示货运公司托运 ID 的硬编码字符串值。在实际应用中，这些类将与货运公司的第三方解决方案集成起来生成可追踪的托运ID。

Factory 类的作用是根据订单的价值与重量来确定应该使用哪一家货运公司。向项目中添加一个新类 UKShippingCourierFactory

```c#
public class UKShippingCourierFactory
{
	public static IShippingCourier CreateShippingCourierFor(Order order)
	{
		if ((order.TotalCost > 100) || (order.WeightInKG > 5))
		{
			return new DHL();
		}
		else
		{
			return new RoyalMail();
		}
	}
}
```

Factory 类有一个静态方法 CreateShippingCourierFor,它返回实现 IShippingCourier 接口的货运公司。Factory 方法根据订单的总价和重量来确定返回哪一家货运公司。

最后，添加 OrderService 类。向项目中添加一个新类 OrderService.

```c#
public class OrderService
{
	public void Dispatch(Order order)
	{
		IShippingCourier shippingCourier =UKShippingCourierFactory.CreateShippingCourierFor(order);

		order.CourierTrackingId = shippingCourier.GenerateConsignmentLabelFor(order.DispatchAddress);
	}
}
```












