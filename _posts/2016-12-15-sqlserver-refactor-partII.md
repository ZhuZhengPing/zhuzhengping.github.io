---
layout: post
title:  "SQL Server优化数据访问: Part II(TSQL查询以及优化)"
date:   2016-12-15 16:32:18 +0800
categories: sql
tags: sql
author: Zhengping Zhu
---

* content
{:toc}

## 概念

还记得我们在任务吗？我们的使命是优化SQL Server数据库的性能。该应用程序在测试时运行得相当好，但很快在生产部署后，它随着数据库中数据量的增加而开始缓慢执行，经过几个月后，应用程序开始非常慢，这时需要程序员来优化程序。

请查看上一篇文章，了解它是如何开始的，以及我们开始优化过程：

[SQL Server优化数据访问: Part I(使用索引)](http://kk93.win/2016/12/08/sqlserver-optimize-partI/)

在前3个步骤（在上一篇文章中讨论过）中，我们在数据库中实现了索引，这是因为我们必须在短时间内使用最少的步骤提高数据库性能，但是如果我们的数据访问代码是低效的，如果我们的TSQL写得不好怎么办？

应用索引将显着提高数据访问性能，在任何数据访问优化过程中，您必须确保数据访问代码和TSQL是最有效的。

因此，在本文中，我们将关注使用最佳做法编写或重构数据访问代码。我们需要先做好准备。所以，让我们在下一个步骤做基础：










### 第四步：将TSQL代码从应用程序移动到数据库服务器

我知道你可能不喜欢这个建议，您可能已经使用一个ORM为您生成所有的SQL，或者，您或您的团队可能在应用程序代码中写SQL（在数据访问层方法中），但是如果你需要优化数据访问性能，或者您需要在应用程序中解决性能问题，我建议您将SQL代码移动到您的数据库服务器（使用存储过程，视图，函数和触发器）。为什么？那么，我有一些强烈的理由这个建议：

>* 从应用程序移除SQL并使用存储过程/视图/函数/触发器实现它们将避免应用程序中出现重复的SQL，这也将确保TSQL代码的可重用性
>* 使用数据库对象实现所有TSQL将使您能够更轻松地分析TSQL，以找到可能导致性能低下的低效代码，此外，这将允许您集中管理您的TSQL代码。
>* 这样做还将使您能够重新考虑TSQL代码，以利用一些高级索引技术（将在本系列文章的后面部分讨论）。这还将帮助您编写更多的“基于设置”的SQL以及删除您可能已经在应用程序中编写的任何“过程性”SQL。

尽管索引（在步骤1到步骤3）将让您在您的应用程序中快速解决性能问题（如果运用正确），下面的步骤4可能不会给你一个真正的性能提升，但是，这将主要使您能够执行其他后续优化步骤，并轻松应用其他技术，以进一步优化您的数据访问。

如果你已经使用一个ORM（比如说，NHibernate）在应用程序中实现数据访问，您可能会发现您的应用程序在开发和测试环境中执行得很好，但是如果你在一个生产系统中遇到性能问题，每秒都会发生大量事务，并且存在太多并发数据库连接，以便优化应用程序的性能，您可能需要重新考虑基于ORM的数据访问逻辑，可以优化基于ORM的数据访问，但是，如果您在数据库中使用TSQL对象实现数据访问例程，并且总是访问太慢，你可以考虑优化数据库。

让我们假设您已经使用数据库中的TSQL对象实现了数据操作。让我们走向优化冒险中最重要的一步，我们将重新考虑我们的数据访问代码，并应用最佳做法。

### 第五步：确定低效的TSQL，重写并应用

无论数据库中建了多好的索引，如果你写了抵消的数据检索/访问逻辑，你一定会得到缓慢的性能。

我们都想写好代码，当我们为特定需求写入数据访问时，我们又很多种方法来实现特定的数据访问(和应用程序的业务逻辑)，但是，在大多数情况下，我们必须在不同成员的团队中工作，他们都有着不同的经验和意识，因此，在开发阶段，我们的团队成员可能以不同的方式编写代码，其中一些可能使用的不是最佳做法。在写代码的时候，我们都希望完成任务。但是当我们的代码在生产中运行时，我们就能看到问题。

现在是重构代码的时候。写出高性能代码的时候。

我有一些SQL的最佳做法，你可以看看。但我相信你已经知道大部分。问题是，在现实中，你只是没在你的代码中写了这些好代码（当然，你总是有一些好的理由）。但是总有一天会出现这种情况，你代码运行慢，你的客户开始不高兴。

虽然你应该知道单靠最佳实践是不够的，您必须确保在编写TSQL时遵循最佳实践。这是最重要的事情。

#### 一些TSQL最佳实践

<b>不要在SQL查询中使用`SELECT *`</b>

>* 可能获取不必要的列，这将增加数据检索的时间
>* 数据库引擎不能利用索引（在上一篇文章中讨论）的好处，因此查询执行缓慢

*select 列表中不要出现不必要的列，多表连接不要出现不必要的条件*

>* 在Select查询中选择不必要的列会增加实际查询的开销，特别是如果不必要的列是LOB类型
>* 在连接条件中包含不必要的表将使数据库引擎检索和获取不必要的数据，并增加查询执行时间

<b>不要在子查询中使用COUNT（）聚合来执行存在检查</b>

不要使用这种方法

```
SELECT column_list FROM table WHERE 0 < (SELECT count(*) FROM table2 WHERE ..)
```

推荐使用这种方法

```sql
SELECT column_list FROM table WHERE EXISTS (SELECT * FROM table2 WHERE ...)
```

>* 使用COUNT()时，SQL Server不知道你正在进行存在检查，他对所有数据求count，通过执行表扫描或扫描最小的非聚集索引
>* 当你使用 EXISTS，SQL Server 知道你再进行存在检查，当找到第一个匹配的值，它就返回 true 并停止扫描。

### 尽量避免在两种类型的列之间连接

在不同数据类型的两列之间连接时，其中一列必须转换为另一列的类型

如果要连接具有不兼容类型的表，其中一个可以使用索引，但是查询优化器不能在它转换的列上选择索引，例如：

```sql
SELECT column_list FROM small_table, large_table WHERE
smalltable.float_column = large_table.int_column 
```

在这种情况下，SQL Server将整数列转换为float，因为int在层次结构中比float低，它不能使用large_table.int_column上的索引，它可以使用smalltable.float_column上的索引。

<b>避免死锁</b>

>* 在所有存储过程和触发器中以相同顺序访问表
>* 保持您的事务尽可能短。在事务期间尽可能少的操作数据。
>* 不要在事务中间等待用户输入

<b>使用“基于设置的方法”而不是“过程方法”写入TSQL</b>

>* 数据库引擎针对基于集的SQL进行了优化.当必须处理大的结果集（超过1000）时，应避免使用过程方法（使用游标或函数来处理结果集中的行）
>* 使用内联子查询来替换用户定义的函数
>* 使用相关子查询替换基于游标的代码
>* 如果程序编码真的有必要，至少使用表变量而不是光标来导航和处理结果集

<b>不使用`COUNT(*)`获取表中的记录计数</b>

要获取表中的总行数，我们通常使用以下Select语句,此查询将执行全表扫描以获取行计数。

```sql
SELECT COUNT(*) FROM dbo.orders
```

以下查询不需要全表扫描,(请注意，这可能不会给你100％完美的结果，但这只是方便，如果你不需要一个完美的计数。)

```sql
SELECT rows FROM sysindexes 
WHERE id = OBJECT_ID('dbo.Orders') AND indid < 2
```

### 尽量避免动态SQL

除非真的需要，尽量避免使用动态SQL，因为：

>* 动态SQL很难调试和故障排除
>* 如果提供了用户输入，那么就有可能发生SQL注入攻击

<b>尽量避免使用临时表</b>

>* 除非真的需要，尽量避免使用临时表。而是使用表变量。
>* 在99％的情况下，表变量驻留在内存中，因此它要快得多。临时表驻留在TempDb数据库中。所以操作临时表需要数据库间通信，因此会更慢。

<b>使用全文搜索来搜索文本数据，而不是LIKE搜索</b>

全文搜索总是优于LIKE搜索。

>* 全文搜索使您能够实现复杂搜索条件，无法使用LIKE搜索实现。例如在单个词或短语上搜索（并且可选地，对结果集进行排序），搜索靠近另一个词或短语的词或短语，或搜索特定词的同义形式。
>* 实施全文本搜索比LIKE搜索更容易实现（特别是在复杂搜索需求的情况下）。
>* 

<b>使用UNION替代“OR”</b>

>* 在查询中不使用“OR”，而是使用“UNION”组合两个区别查询的结果集。这将提高查询性能。
>* 请更好地使用UNION ALL。 UNION ALL比UNION快，因为它不必对结果集进行排序

<b>为大对象实现延迟加载策略</b>

>* 将大对象列（如VARCHAR（MAX），Image，Text等）存储在与主表不同的表中，并对主表中的大对象进行引用
>* 检索查询中的所有主表数据，以及是否需要加载大对象,仅当需要时从大对象表中检索大对象数据。

<b>使用VARCHAR(MAX)，VARBINARY(MAX)和NVARCHAR(MAX)</b>

>* 在SQL Server 2000中，一行的大小不能超过8000字节。此限制是由于SQL Server的8 KB内部页大小,所以要在单个列中存储更多的数据,您需要使用存储在8 KB数据页集合中的TEXT，NTEXT或IMAGE数据类型（BLOB）
>* 这些与在同一个表中存储其他数据的数据页不同，这些页面以B树结构排列，这些数据不能用作存储过程或函数中的变量,并且它们不能使用（如REPLACE，CHARINDEX或SUBSTRING）字符串函数，在大多数情况下，您必须使用READTEXT，WRITETEXT和UPDATETEXT。
>* 要解决此问题，请在SQL Server 2005中使用VARCHAR（MAX），NVARCHAR（MAX）和VARBINARY（MAX）,这些数据类型可以保存（2 GB）,
>* 当MAX数据类型中的数据超过8 KB时,使用溢出页（在ROW_OVERFLOW分配单元中），并且在IN_ROW分配单元中的原始数据页中留有指向页的指针

<b>写出好的用户定义函数</b>

>* 不要在存储过程，触发器，函数和批处理中重复调用函数，例如，在存储过程过程的许多位置，您可能需要一个字符串变量的长度，但不要在需要时调用LEN函数;而是调用LEN函数一次，并将结果存储在变量中供以后使用。

<b>写出好的存储过程</b>

>* 不要使用“SP_XXX”作为命名约定，它会导致其他搜索和I / O操作（因为系统存储过程名称以“SP_”开头）。使用“SP_XXX”作为命名约定还增加了与现有系统存储过程冲突的可能性。
>* 使用“设置Nocount打开”消除额外的网络故障
>* 当索引结构更改时，在EXECUTE语句（第一次）中使用WITH RECOMPILE子句（以便存储过程的编译版本可以利用新创建的索引）。
>* 使用默认参数值以便于测试。

<b>写出好的触发器</b>

>* 尽量避免使用触发器。触发触发器并执行触发事件是一个高消耗性能的过程
>* 触发器不要使用约束。
>* 不要对不同的触发事件使用相同的触发器（插入，更新，删除）
>* 不要在触发器中使用事务代码。触发器始终在触发触发器的代码的事务范围内运行。

<b>写出好的视图</b>

>* 使用视图重用复杂的TSQL块,并为其启用索引视图（稍后将讨论）
>* 如果不希望让用户不小心修改表结构，请使用带SCHEMABINDING选项的视图。
>* 不要使用单个表的视图（这将是不必要的开销）。使用视图来编写访问多个表中的列的查询。

<b>写出好的事务</b>

>* 在SQL Server 2005之前，在BEGIN TRANSACTION和每个后续修改语句之后，必须检查@@ ERROR的值，如果它的值不为零，那么最后一条语句导致错误，该事务必须回滚并且必须提出错误，在SQL Server 2005及更高版本中，Try ... Catch块可用于处理TSQL中的事务。所以尝试使用Try ...基于Catch的事务代码
>* 尝试避免嵌套事务。使用@@ TRANCOUNT变量来确定是否需要启动事务（以避免嵌套事务）。
>* 尽可能早地启动事务，并尽可能快地提交/回滚事务，以减少资源锁定的时间段。

### 如何分析和确定TSQL改进的范围？

在理想的情况下，你总是预防疾病而不是治疗。但是，在现实中，你不能每次预防，我知道你的团队有很多专业人士，我知道你有一个很好的审查代码过程，但仍然有坏的代码和差的设计,因为，无论你将使用什么先进的技术,您的客户要求将永远更加高级，这是软件开发中的普遍真理，因此，设计，开发和交付基于需求的系统将永远是一个具有挑战性的工作。

所以，同样重要的是你知道如何解决。你真的需要知道如何在性能问题发生后对其进行故障排除，您需要学习分析你的TSQL代码，识别瓶颈，考虑这些因素以解决性能问题，有许多方法来解决数据库和TSQL性能问题，但在最基本的层次上，您必须了解并查看需要分析的TSQL的执行计划。

### 了解查询执行计划

当你在SQL Server引擎中执行SQL语句，SQL Server首先必须确定执行它的最佳方法（在执行查询之前生成最佳查询执行计划的系统），为了实现这一点，查询优化器（在执行查询之前生成最优查询执行计划的系统）使用几个系统信息，如数据分布统计，索引结构，元数据和其他信息来分析几个可能的执行计划，并最终选择一个很可能是最好的执行计划的时间。

你知道吗？您可以使用SQL Server Management Studio来预览和分析要发出的查询的估计执行计划，在SQL Server Management Studio中编写SQL之后，单击执行计划图标（见下文）以在实际执行查询之前查看执行计划

（注意：或者，您可以在执行查询之前将实际执行计划选项“开启”，如果这样做，Management Studio将在结果窗口中包含正在执行的实际执行计划以及结果集。）

<img src="https://www.codeproject.com/KB/database/RefactorTSQLs/Estimated_execution_plan.jpg" style="width:750px" />

#### 详细了解查询执行计划

执行计划图中的每个图标代表计划中的一个操作项（操作员）。执行计划必须从右到左读取，并且每个操作项具相对于查询的总执行成本（100％）的百分比。

在上述执行计划图中，最右边的第一个图标表示HumanResources表中的“聚簇索引扫描”操作（读取表中的所有主键索引值）（这需要100％的总查询执行成本），并且图中最左边的图标表示SELECT操作（只需要总查询执行成本的0％）。

以下是在图形查询执行计划中经常会看到的重要图标及其相应的操作符：

<img src="https://www.codeproject.com/KB/database/RefactorTSQLs/QueryPlanOperators.JPG" style="width:750px" />

图形执行计划中的每个图标表示查询中的特定操作项。有关图标及其相应操作项的完整列表，请转到[http://technet.microsoft.com/en-us/library/ms175913.aspx](http://technet.microsoft.com/en-us/library/ms175913.aspx)。

注意上面给出的执行计划中的“查询成本”。它相对于批次具有100％的成本。这意味着，该特定查询具有100％的成本，因为只有一个查询,如果在查询窗口中同时执行多个查询，则每个查询都有自己的成本百分比（小于100％）.

要了解查询计划中每个特定操作项的更多详细信息，请将鼠标指针移动到每个项目/图标上。您将看到一个如下所示的窗口：

<img src="https://www.codeproject.com/KB/database/RefactorTSQLs/Query_plan_info.jpg" />

此窗口提供有关执行计划中特定查询项的详细估计信息，上述窗口显示聚簇索引扫描的估计详细信息，并在AdventureWorks数据库的HumanResources架构的Employee表中查找具有Gender ='M'的行，该窗口还显示估计的IO，CPU，行数，每行的大小以及用于与其他可能的执行计划进行比较以选择最佳计划的其他成本

我发现了一篇文章，可以帮助您进一步了解和详细分析TSQL执行计划。您可以在这里查看：[http：//www.simple-talk.com/sql/performance/execution-plan-basics/](http：//www.simple-talk.com/sql/performance/execution-plan-basics/)。

#### 通过查看执行计划，我们能获得什么信息？

每当任何查询执行缓慢时，您可以查看估计（和实际，如果需要）执行计划，并可以识别在查询中占用最多时间（以百分比表示）的项目，当你开始检查任何TSQL进行优化时，大多数时候，你想做的第一件事是查看执行计划，您很可能快速识别SQL中在整个SQL中创建瓶颈的区域。

在查询的执行计划中继续监视以下昂贵的运算符。如果发现其中一个，您可能在您的TSQL有问题，您需要重新考虑TSQL以提高性能。

<b>Table Scan</b>: 在对应的表没有聚簇索引时发生。最可能的，创建聚集索引或碎片整理索引.

<b>Clustered Index Scan</b>: 有时被认为等同于表扫描。在符合条件的列上的非聚簇索引不可用时发生。大多数时候，创建一个非聚集索引。

<b>Hash Join</b>: 当两个表之间的联接列未建立索引时，会发生这种情况。在这些列上创建索引。

<b>Nested Loops</b>: 当非聚簇索引不包括（覆盖）在SELECT列表中使用的列时，会发生这种情况。对于非聚集索引列中的每个成员，数据库服务器必须搜索聚集索引以检索在SELECT列表中指定的其他列值。创建一个覆盖的索引

<b>RID Lookup</b>: 在具有非聚簇索引但同一个表没有任何聚簇索引时发生。在这种情况下，数据库引擎必须使用行ID查找实际行，在相应的表上创建聚簇索引

### TSQL重构 - 一个真实的生活故事

知识只有在应用于解决现实生活中的问题时才具有价值。无论你是多么有知识，你需要有效地利用你的知识，以解决你的问题

让我们读一个真实的生活故事。在这个故事中，Tom先生是我们开发的应用程序开发团队的成员之一。

在我们的应用程序的数据访问（TSQL）中开始我们的优化任务时，我们确定了一个低性能的存储过程，处理一个月的销售数据需要50秒以上，以下是调用存储过程以检索2009年“Caps”的销售数据

```sql
exec uspGetSalesInfoForDateRange '1/1/2009', 31/12/2009,'Cap'
```

因此，Tom被指派以优化存储过程。以下是一个存储过程

```sql
ALTER PROCEDURE uspGetSalesInfoForDateRange
    @startYear DateTime,
    @endYear DateTime,
    @keyword nvarchar(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT
       Name,
       ProductNumber,
       ProductRates.CurrentProductRate Rate,
    ProductRates.CurrentDiscount Discount,
    OrderQty Qty,
    dbo.ufnGetLineTotal(SalesOrderDetailID) Total,
    OrderDate,
    DetailedDescription
    FROM
    Products INNER JOIN OrderDetails
    ON Products.ProductID = OrderDetails.ProductID
    INNER JOIN Orders
    ON Orders.SalesOrderID = OrderDetails.SalesOrderID
    INNER JOIN ProductRates
    ON
    Products.ProductID = ProductRates.ProductID
    WHERE
    OrderDate between @startYear and @endYear
    AND
    (
        ProductName LIKE '' + @keyword + ' %' OR
        ProductName LIKE '% ' + @keyword + ' ' + '%' OR
        ProductName LIKE '% ' + @keyword + '%' OR
        Keyword LIKE '' + @keyword + ' %' OR
        Keyword LIKE '% ' + @keyword + ' ' + '%' OR
        Keyword LIKE '% ' + @keyword + '%'
    )
    ORDER BY
    ProductName
END

GO
```

<b>分析索引</b>

作为第一步，Tom先生想要查看在存储过程中被查询的表的索引,他快速查看了查询，并确定了表应该有索引的字段（例如，在连接查询中使用的字段，WHERE条件和ORDER BY子句）,他发现在其中一些列上缺少几个索引,例如，缺少以下两列的索引：

>* OrderDetails.ProductID
>* OrderDetails.SalesOrderID

他在这两列上创建了非聚集索引，并执行了存储过程如下：

```sql
exec uspGetSalesInfoForDateRange '1/1/2009', 31/12/2009 with recompile
```

存储过程的性能现已提高，但仍低于预期水平（35秒）（注意“with recompile”子句。它强制SQL Server引擎重新编译存储过程并重新生成执行计划以利用新构建的索引）。

<b>分析查询执行计划</b>

Tom先生的下一步是查看SQL Server Management Studio中的执行计划,他通过在查询窗口中编写存储过程的'exec'语句，并查看“估计的执行计划”,

分析执行计划，他确定了一些重要的改进范围：

>* 即使表具有适当的索引，也在执行查询时在表上发生扫描。表扫描占用了整个查询执行时间的30％。
>* 正在进行“嵌套循环连接”（三种连接实现之一），从查询中的SELECT列表中指定的表中一个列。

对于表扫描问题，Tom想知道是否发生任何索引碎片（因为所有索引都已正确实现）。他运行了一个TSQL，它报告数据库中表列上的索引碎片信息并发现两个现有的索引碎片，立即，他碎片整理这两个索引，存储过程花了25秒

为了摆脱“嵌套循环连接”，他在相应的表（包括SELECT列表中的列）中植入了“覆盖索引”，因此，在选择列时，数据库引擎能够检索非聚集索引节点中的列值。这样做现在将查询性能降低到23秒。

<b>实施一些最佳做法</b>

Tom先生确定对结果集中的每一行执行UDF ufnGetLineTotal（SalesOrderDetailID），而UDF只是使用提供的参数中的值执行另一个TSQL，并返回一个标量值。以下是UDF定义：

```sql
ALTER FUNCTION [dbo].[ufnGetLineTotal]
(
    @SalesOrderDetailID int
)
RETURNS money
AS
BEGIN

    DECLARE @CurrentProductRate money
    DECLARE @CurrentDiscount money
    DECLARE @Qty int
    
    SELECT
        @CurrentProductRate = ProductRates.CurrentProductRate,
        @CurrentDiscount = ProductRates.CurrentDiscount,
        @Qty = OrderQty
    FROM
        ProductRates INNER JOIN OrderDetails ON
        OrderDetails.ProductID = ProductRates.ProductID
    WHERE
        OrderDetails.SalesOrderDetailID = @SalesOrderDetailID
    
    RETURN (@CurrentProductRate-@CurrentDiscount)*@Qty
END
```

这似乎是计算订单总额的“程序方法”，Tom先生决定在原始查询中将UDF的TSQL实现为内联SQL。以下是他必须在存储过程中实现的简单更改：

```sql
dbo.ufnGetLineTotal(SalesOrderDetailID) Total        -- Old Code
(CurrentProductRate-CurrentDiscount)*OrderQty Total -- New Code
```

执行查询后，Tom立即发现查询现在需要14秒执行。

为了进一步优化范围，Tom先生决定在TSQL的SELECT列表中查看列类型。很快，他发现一个文本列（Products.DetailedDescription）包括在SELECT列表中,查看应用程序代码，Tom发现应用程序未使用此列值,结果集中的几个列显示在应用程序的列表页面中，当用户单击列表中的特定项目时，显示包含文本列值的详细信息页面

从SELECT列表中排除该文本列大大减少了查询执行时间从14秒到6秒,因此，Tom先生决定应用“延迟加载”策略来使用存储过程加载此文本列，该过程接受“ID”参数并选择文本列值,在实现之后，他发现当用户看到项目列表中的项目的详细页面时，新创建的存储过程执行,还将这两个“文本”列转换为VARCHAR（MAX）列,并且使他能够使用len（）函数,

<b>进一步优化</b>

下一步是什么？迄今为止的所有优化步骤将执行时间减少到6秒。Tom认为查询可以有进一步的改进，所以他缩进和重新排列了TSQL并一次又一次地改进存储过程。TSQL具有一些LIKE条件（实际的存储过程基本上对一些表执行关键字搜索），用于将若干模式与某些列值匹配，当他注释掉LIKE语句时，突然存储过程执行时间跳到1秒以下

LIKE搜索占用了TSQL代码中最多的时间。仔细看看LIKE搜索条件，Tom先生非常确定，基于LIKE搜索的SQL可以很容易地使用全文本搜索来实现，看起来两个列需要启用全文搜索。他只花了5分钟来实施FTS（创建完整文本目录，启用两个列全文，并使用FREETEXT函数替换LIKE子句），并且查询执行在1秒以内！

