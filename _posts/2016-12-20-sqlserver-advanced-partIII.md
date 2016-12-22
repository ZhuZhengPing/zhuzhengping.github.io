---
layout: post
title:  "SQL Server优化数据访问: Part III(高级索引和反标准化)"
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

我们需要提高计算列的性能，你需要在计算列上创建索引。当创建索引后，对应的列值被更新时，计算列上的索引值也会更新，当执行查询时，数据库引擎不会对每一行执行计算公式，它返回准备计算的值，在计算列上创建索引可以提高性能。

<b>注意：</b>如果你想在计算列上创建索引，你需要确保计算列上没有不确定的函数(例如 `getdate()`),因为每次调用他，它返回的不是同一个值。

#### 创建视图索引

<b>为什么要使用视图</b>

就我所知，视图只是组合一些数据库查询的字段，如果你的 TSQL 使用了视图，你可以在访问数据库时重复使用，也可以和其他表或者视图一起连接产生新的结果集，数据库引擎将会把视图和你提供的SQL合并，生成执行计划。因此，视图主要是能重复使用复杂的 SELECT 查询，并且数据库引擎会为 TSQL 的某些部分重复使用执行计划。

视图不会带来显著的性能优势。在我前些年的SQL时代，我第一次了解视图是，视图是存储 SELECT 查询结果集的。但是很快我就发现，视图只是编译和执行了查询，并且视图不能存储结果集。

但是现在，你可以在视图上做一些工作，让它真的能存储 SELECT 查询的结果集。怎么做呢，这个不难，你只需要在视图上创建索引就行了。

如果你再视图上创建了索引，视图成为“索引视图”，对于索引视图，数据库处理 SQL 并将结果存储在数据文件中。当这些表更新时，SQL SERVER 自动维护索引，当你用索引视图查询时，数据库引擎只从索引中取值，这比单纯的视图要快，因此，在视图上创建索引有很大的性能优势。

创建视图索引确实可以提高性能，当索引视图对应的表发生变化时，数据库引擎必须更新索引。当视图里很多行都需要处理聚合函数时，并且视图对应的表不会经常修改，应该考虑用索引视图

<b>怎样创建索引视图</b>

指定 SCHEMABINDING  选项创建或修改视图

```sql
CREATE VIEW dbo.vOrderDetails
WITH SCHEMABINDING 
AS 
  SELECT...
```

>* 在视图上创建唯一的聚集索引。
>* 在视图上创建非聚集索引。

也不能每次都创建索引视图。根据下面的一些要求来创建：

>* 必须使用SCHEMABINDING选项创建视图。在这种情况下，数据库引擎将不允许您更改对应的表结构。
>* 视图不能包含非确定性函数(例如 getdate())，DISTINCT子句或子查询.
>* 视图中的基础表必须具有聚集索引（主键）。

### 在用户定义的函数上创建索引 (UDF)

要在UDF上创建索引，必须创建一个计算列，然后必须在计算列字段上创建索引。

<b>下面是创建步骤</b>

创建一个函数，在函数上添加 SCHEMABINDING 选项，确保函数里没有定义不确定的方法或操作(例如 getdate() 或者 distinct等待).

```sql
CREATE FUNCTION [dbo.ufnGetLineTotal]
(
-- Add the parameters for the function here
@UnitPrice [money],
@UnitPriceDiscount [money],
@OrderQty [smallint]
)
RETURNS money
WITH SCHEMABINDING
AS

BEGIN
    return (((@UnitPrice*((1.0)-@UnitPriceDiscount))*@OrderQty))
END
```

在所需的表中添加计算列，并指定函数的参数作为计算列的值。

```sql
CREATE FUNCTION [dbo.ufnGetLineTotal]
(
-- Add the parameters for the function here
@UnitPrice [money],
@UnitPriceDiscount [money],
@OrderQty [smallint]
)
RETURNS money
WITH SCHEMABINDING
AS

BEGIN
    return (((@UnitPrice*((1.0)-@UnitPriceDiscount))*@OrderQty))
END
```

<img src="https://www.codeproject.com/KB/database/IndexAndDenormalize/ComputedColumnFunction.JPG" />

在计算列上创建索引。

我们已经看到，在计算列上创建索引，可以更快地查询结果。但是我们通过在计算列上使用 UDF 并在这些列上创建索引会有什么不同呢？

当你在查询中包含UDF时，这样会给你带来巨大的性能优势，特别是在不同表/视图之间的连接条件中使用UDF。我已经看到在连接条件中使用UDF编写的大量连接查询，我一直认为UDF在连接条件下会很慢（如果要处理的结果数量相当大并且没有创建UDF索引），并且必须有一种方法来优化它。在计算列中的函数上创建索引是解决方案。

### 在 XML 列上创建索引

如果有任何XML列，请创建索引。XML列作为二进制大对象（BLOB）存储在SQL Server（SQL Server 2005及更高版本）中，可以使用XQuery查询，但是没有索引，查询XML数据类型可能非常耗时。这对于大型XML实例尤其如此，因为SQL Server必须在运行时分割包含XML的二进制大对象

要提高对XML数据类型的查询性能，可以对XML列进行索引。 XML索引分为两类：

<b>主XML索引</b>

当在 XML 列上创建主索引，SQL Server 细分 XML 内容并创建元素和属性名称等信息，根路径，节点类型和值等。创建主索引使SQL Server能够更轻松地支持XQuery请求

以下是创建主XML索引的语法：

```sql
CREATE PRIMARY XML INDEX
index_name
ON <object> ( xml_column ) 
```

<b>辅助XML索引</b>

创建主XML索引可提高XQuery性能，因为XML数据已经被细分了，但是，SQL Server仍然需要扫描已细分的数据以找到所需的结果。为了进一步提高查询性能，应在主XML索引之上创建辅助XML索引。

有三种类型的辅助XML索引：

>* “路径”辅助XML索引：使用.exist（）方法确定特定路径是否存。
>* “Value”辅助XML索引：在执行基于值的查询时使用。
>* “属性”辅助XML索引：在知道值的路径时检索属性值。

以下是创建辅助XML索引的语法：

```sql
CREATE XML INDEX
index_name
ON <object> ( xml_column )
USING XML INDEX primary_xml_index_name
FOR { VALUE | PATH | PROPERTY }
```

### 应用反标准化，使用历史表和预计算列

<b>反标准化</b>

如果您正在设计OLTA系统的数据库（在线事务分析系统，主要是针对只读查询进行优化的数据仓库），您可以（并且应该）在数据库中应用反标准化和索引，也就是说，相同的数据将存储在不同的表中，但报告和数据分析查询运行的速度非常快。

但是，如果您正在设计OLTP系统的数据库（在线事务处理系统，主要是一个大多数数据更新操作发生的事务系统[即，大多数时候都使用的INSERT / UPDATE / DELETE操作]），建议您至少实现第一，第二和第三范式，以便最小化数据冗余，从而最小化数据存储并提高可管理性。

尽管我们应该在OLTP系统中应用标准化，我们通常需要在数据库上运行大量的读操作（SELECT查询），所以，在应用所有的优化技术后，如果您发现您的一些数据查询操作仍然非常耗时，你需要考虑应用某种反标准化，所以问题是，你应该如何应用反标准化，为什么会提高性能？

<b>让我们看一个简单的例子找到答案</b>

假设我们有两个表OrderDetails（ID，ProductID，OrderQty）和Products（ID，ProductName）存储订单明细信息和产品信息，现在为某个订单查询其订购数量和产品名称，需要连接OrderDetails和Products表。

```sql
SELECT Products.ProductName,OrderQty 
FROM OrderDetails INNER JOIN Products
ON OrderDetails.ProductID = Products.ProductID
WHERE SalesOrderID = 47057
```

现在，如果这两个表包含大量的行，并且如果您发现即使应用所有优化步骤后查询仍然执行缓慢，您可以应用一些反标准化，如下所示：

将ProductName列添加到OrderDetails表中，并更新ProductName列值。

重写上面的查询如下：

```sql
SELECT ProductName,OrderQty  
FROM OrderDetails
WHERE SalesOrderID = 47057
```

请注意，在OrderDetails表中应用反标准化之后，我们不得不做一个牺牲，我们必须在两个地方（在OrderDetails和Products表中）存储相同的数据（ProductName），做这种反标准化将增加整体数据存储。

在反标准化时，我们必须在数据冗余和Select操作的性能之间做一些权衡，此外，在应用反标准化之后，我们必须重新考虑我们的一些数据插入/更新操作，请确保您不要过度应用反标准化，以便不会破坏您的基本数据设计。仅对非常耗时的数据访问中涉及的关键表应用反标准化（如果需要）。

<b>历史表</b>

在您的应用程序中，如果在一个时间段定期运行一些数据检索操作（比如说，报表），如果过程涉及到具有标准化结构的大尺寸表，您可以考虑定期从事务规范化表中移动数据到反标准化的，大量索引，单个历史表.您还可以在数据库服务器中创建计划指定时间填充此历史记录表，如果这样做，周期性数据检索只操作单个表，并且操作将执行更快.

例如，假设连锁店有每月销售报告，需要3个小时才能完成，您可以按照这些步骤（以及执行其他优化步骤）：

>* 创建一个很多索引的历史表，以存储销售数据。
>* 在以24小时为间隔（午夜）运行的SQL Server中创建计划操作，并为计划操作指定SQL以从事务表填充历史记录表。
>* 修改您的报表代码，以便它现在从历史记录表中读取数据。

<b>创建计划操作</b>

按照以下简单步骤在SQL Server中创建定期填充指定计划的历史记录表的计划操作。

确保SQL Server代理正在运行。为此，启动SQL Server配置管理器，单击SQL Server 2005服务，并通过右键单击启动SQL Server代理。

<img src="https://www.codeproject.com/KB/database/IndexAndDenormalize/StartSQLServerAgent.JPG" />

展开对象资源管理器中的SQL Server代理节点，然后单击“作业”节点以创建新作业。在“常规”选项卡中，填写作业名称和描述。

<img src="https://www.codeproject.com/KB/database/IndexAndDenormalize/UploadingDataHistoryTable.JPG" />

在“步骤”选项卡上，单击“新建”按钮创建新的作业步骤。填写步骤的名称，并填写TSQL（将使用每日销售数据加载历史记录表），并将类型选择为“Transact-SQL脚本（T-SQL）”。按“确定”保存步骤。

转到“计划”选项卡，然后单击“新建”按钮指定作业计划。

<img src="https://www.codeproject.com/KB/database/IndexAndDenormalize/ScheduleDailySalesData.JPG" />

单击“确定”按钮保存计划并将计划应用于指定的作业。













