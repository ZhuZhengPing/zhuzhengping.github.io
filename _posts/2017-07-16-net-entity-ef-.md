---
layout: post
title:  "在Entity Framework 4.0中使用 Repository 和 Unit of Work 模式 "
date:   2017-07-16 16:32:18 +0800
categories: ef
tags: .net ef
author: Zhengping Zhu
---

* content
{:toc}

## 概念

如果你一直在关注这个博客的话，你知道我最近在讨论我们加到Entity Framework 4.0中的POCO功能的方方面面，新加的POCO支持促成了在Entity Framework中实现透明性持久的新方式，而该方式在Entity Framework 3.5中是无法实现的。

将我们基于Northwind的例子做一下扩充，譬如说，我有兴趣支持下列与Customer（客户）实体相关的操作：

>* 通过ID来查询客户 
>* 通过名字来查询客户 
>* 往数据库中加一个新客户 

我还想能够基于ID来查询产品。

最后，给定一个客户，我想要能够往数据库中加一个Order（订单）。

在进入细节之前，我想先说明两件事情：

>* 处理这个问题，“正确”的方式不止一个。在过程中，我会做许多简化的假设，其目的是展示一幅非常高层次的草图，示范如何实现这2个模式来解决手上的问题。 
>* 通常来说，在使用TDD时，我会从测试开始，使用我的测试来逐步展开我的设计。因为在这个例子中我没有按TDD做，请耐心点，如果你看到我在做象预先定义接口这样的事情，而不是让测试和共用的东西来主宰接口的必要性，等等。 










#### 实现 Repository 模式

让我们先开始实现针对Customer实体的操作，看一下Customer的repository的样子：

```c#
public interface ICustomerRepository{            
	Customer GetCustomerById(string id);    
	IEnumerable<Customer> FindByName(string name);    
	void AddCustomer(Customer customer);
}
```

这个repository接口看上去满足有关Customer的所有需求：

>* GetCustomerById 应该允许我通过主键来得单个客户实体 
>* FindByName 应该允许我查询客户 
>* AddCustomer 应该允许我往数据库中加一个客户 

这暂时听上去不错，象这样，为你的repository定义一个接口是个好主意，特别是你对使用mocks(模拟对象） 或 fakes （假冒对象）来编写测试感兴趣的话，接口允许你完全不用考虑数据库，促成更好的单元测试。在将来会有更多的博客贴子讨论可测试性，mocks 和 fakes,等等。

你也许可以进一步扩展这个接口定义，定义一个共用的IRepository，来处理多个repository类型中共有的关注。如果对你有用的话，这是件值得做的事。在这个特定的例子中，我没看到其必要性，所以我就免了。但在你添加更多的repository以及重构时，这完全有可能会变得非常重要。

让我们拿这个repository来看一下如何利用Entity Framework来做一个实现，允许数据访问：

首先，我需要一个可以用来查询数据的ObjectContext。你也许想作为repository构造器的一部分生成一个ObjectContext，但最好还是把那个关注从repository中去除，在别的地方处理为好。

这是我的构造器：

```c#
public CustomerRepository(NorthwindContext context){    
	if (context == null)        
		throw new ArgumentNullException("context");   
	_context = context;
} 
```

在上面的代码片段中，NorthwindContext是个我自己的ObjectContext类型。

让我们来提供 ICustomerRepository 接口所需的方法的实现。

GetCustomerById 非常容易实现，多亏了LINQ。使用标准的LINQ运算符，我们可以象这样实现 GetCustomerById ：

```c#
public Customer GetCustomerById(string id){    
	return _context.Customers.Where(c => c.CustomerID == id).Single();
}
```

类似地，FindByName 可以象这样。 再一次，LINQ支持使得其实现非常容易：

```c#
public IEnumerable<Customer> FindByName(string name){    
	return _context.Customers.Where( c => c.ContactName.StartsWith(name)).ToList();                        
}
```

注意，我选择将结果呈示为`IEnumerable<T>`，你也许会选择将这呈示为`IQueryable<T>`。这么做有其含意，在这个情形下，我对呈示建立在repository返回结果之上的基于IQueryable的另外的查询组合，不是很感兴趣。

最后，让我们来看一下可以如何实现AddCustomer：

```c#
public void AddCustomer(Customer customer){    
	_context.Customers.AddObject(customer);
}
```

你也许想把保存功能作为AddCustomer方法的一部分来实现。那么做也许对这个简单的例子没问题，但一般来说，这不是个好主意，这正是Unit of Work出场的地方，过一会儿，我们会看到如何使用这个模式来允许我们实现和协调Save行为。

这里是使用Entity Framework来处理持久性的CustomerRepository的完整实现：

```c#
public class CustomerRepository : ICustomerRepository{    
	private NorthwindContext _context;    
	public CustomerRepository(NorthwindContext context)    {        
		if (context == null)            
			throw new ArgumentNullException("context");         
		_context = context;    
	}    
	public Customer GetCustomerById(string id)    {        
		return _context.Customers.Where(c => c.CustomerID == id).Single();    
	}    
	public IEnumerable<Customer> FindByName(string name)    {        
		return _context.Customers.Where(c => c.ContactName.StartsWith(name)).AsEnumerable<Customer>();                            
	}    
	public void AddCustomer(Customercustomer)    {       
		_context.Customers.AddObject(customer);    
	}
}
```

这里是我们可以如何在客户端代码中使用该repository：

```c#
CustomerRepository repository = new CustomerRepository(context);
Customer c = new Customer( ... );
repository.AddCustomer(c);
context.SaveChanges();
```

在处理与Product和Order相关的需求时，我可以定义下列接口（建造类似CustomerRepository一样的实现）。为简便起见，我把其细节省略了。

```c#
public interface IProductRepository{    
	Product GetProductById(int id);
}
public interface IOrderRepository{    
	void AddOrder(Order order);
}
```

#### 使用ObjectContext实现 Unit of Work （工作单元） 模式

你也许已经注意到了，尽管我们没有实现任何特定的模式来明确地地允许我们将相关操作聚合进一个工作单元（unit of work），但我们已经通过NorthwindContext（我们的ObjectContext类）免费获取了Unit of Work功能。

其想法是，我可以使用Unit of Work将一套相关的操作聚合在一起，Unit of Work记录我感兴趣的变动，直到我准备将它们保存到数据库为止。最终，当我准备保存时，我可以那么做。

我可以象这样定义一个“Unit of Work”接口：

```c#
public interface IUnitOfWork{            
	void Save();
}
```

注意，在Unit of Work中，你也许还会选择实现Undo / Rollback功能。在使用Entity Framework时，推荐的undo做法是，丢弃你的上下文以及你想undo的变动。

我已经提到，我们的ObjectContext类型(NorthwindContext)在极大程度上支持Unit of Work模式。 基于我刚定义的契约，为了使得事情更为明确一点，我可以将NorthwindContext类改成实现IUnitOfWork接口： 

```c#
public class NorthwindContext : ObjectContext, IUnitOfWork{       
	public void Save()    {        
		SaveChanges();    
	}
	. . . 
```

在做了这个变动之后，我需要对我们的repository实现做个小的调整：

```c#
public class CustomerRepository : ICustomerRepository{    
	private NorthwindContext _context;    
	public CustomerRepository(IUnitOfWork unitOfWork)    {        
		if (unitOfWork == null)            
			throw new ArgumentNullException("unitOfWork");        
		_context = unitOfWork as NorthwindContext;    
	}    
	public Customer GetCustomerById(string id)    {        
		return _context.Customers.Where(c => c.CustomerID == id).Single();    
	}    
	public IEnumerable<Customer> FindByName(string name)    {        
		return _context.Customers.Where(c => c.ContactName.StartsWith(name)).AsEnumerable<Customer>();
	}    
	public void AddCustomer(Customer customer)    {        
		_context.Customers.AddObject(customer);    
	}
}
```

就这么简单！现在，我们有了一个对IUnitOfWork友好的repository，你甚至可以使用基于IUnitOfWork的上下文来协调跨越多个repository的工作。下面是一个将订单加到数据库的例子，需要多个repository的工作来查询数据，最终将记录保存回数据库中去：

```c#
	IUnitOfWork unitOfWork = new NorthwindContext();
	CustomerRepository customerRepository = new CustomerRepository(unitOfWork);
	Customer customer = customerRepository.GetCustomerById("ALFKI");
	ProductRepository productRepository = new ProductRepository(unitOfWork);
	Product product = productRepository.GetById(1);
	OrderRepository orderRepository = new OrderRepository(unitOfWork);
	Order order = new Order(customer); order.AddNewOrderDetail(product, 1);            
	orderRepository.AddOrder(order);
	unitOfWork.Save();
```

非常有趣地看到，为了在Entity Framework之上使用Repository 和 Unit of Work模式来访问数据，我们要编写的代码是如此地少。Entity Framework的LINQ支持以及原装的Unit of Work功能使得在Entity Framework之上建立repository简单之极。

另一个要注意的事情是，我在这个贴子里讨论的很多东西，都不是与Entity Framework 4.0特别有关，所有这些一般原理在Entity Framework 3.5下也适用。但要能够象上面展示的那样，在POCO支持的基础之上，使用Repository 和Unit of Work，确实显示了Entity Framework 4.0中的威力。我希望你会发现这非常有用。

最后，我要重申一下，有很多方式可以处理这个题目，在应用Entity Framework, Repository 和 Unit of Work时，还有许多变种方案可以符合你的需求。你也许会选择实现公共的IRepository接口，你也许还会选择实现Repository<TEntity>基类，来给予你一些跨越所有repository的常用repository功能。

尝试一些方法，看哪个最适用于你。我在这里讨论的只是一般的指南而已，但我希望这足够让你起步。更重要的是，我希望这示范了如何可以使用我们在Entity Framework 4.0中引进的POCO支持，来帮助你建造Entity Framework友好的领域模型，而不必违背透明持久性方面的基本原则。
