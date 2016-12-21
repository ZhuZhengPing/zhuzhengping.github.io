---
layout: post
title:  "SQL Server优化数据访问: Part III(TSQL查询以及优化)"
date:   2016-12-20 16:32:18 +0800
categories: sql
tags: sql
author: Zhengping Zhu
---

* content
{:toc}

## 概念

我们正在优化SQL Server数据库，到目前为止，我们已经做了很多事情，我们在数据库表中应用索引，然后重写TSQL以优化数据访问，如果你想知道我们之前做了什么优化，可以看看下面这些文章

>* [SQL Server优化数据访问: Part I](http://kk93.win/2016/12/08/sqlserver-optimize-partI/)
>* [SQL Server优化数据访问: Part II](http://kk93.win/2016/12/15/sqlserver-refactor-partII/)

你做了这些优化，可是数据库任然有性能问题，让我告诉你一件事，即使你使用了适当的索引，并且重构了 TSQL ，还是有一些性能的问题。必须有一些其他的方法来处理这些问题。

SQL Server 提供了一些高级的索引技术。这些可能优化你的数据库性能问题。让我们来实现这些高级的索引技术。 







### 第六步：使用一些高级的索引

例如你现在需要从数据库中查询订单信息，在应用程序中，你可能已经写好了代码，通过对产品和销售数据进行计算来获得订单总价格。可是为什么不在数据库中实现所有功能呢？

看看下图。你可以为一个列指定计算公式。在 TSQL 语句中查询这个计算列时，SQL 引擎将通过公式计算获得这个计算列。因此在执行查询时，SQL 引擎会计算订单总价格并返回结果

<img src="https://www.codeproject.com/KB/database/IndexAndDenormalize/ComputedColumn.JPG" />

听起来不错，以这种方式可以在 SQL 中进行计算。但是有些时候，如果表中数据量非常大，这样可能就是低性能的。如果在 SELECT 语句的 WHERE 条件里面指定了计算列，性能将更差。SQL 引擎需要为每个计算列计算。它需要扫描整个聚集索引。

我们需要提高计算列的性能，你需要在计算列上创建索引。当创建索引后，对应的列值被更新时，计算列上的索引值也会更新，当执行查询时，


















