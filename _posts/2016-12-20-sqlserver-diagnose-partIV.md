---
layout: post
title:  "SQL Server优化数据访问: Part IV(诊断数据库性能问题)"
date:   2016-12-24 16:32:18 +0800
categories: sql
tags: sql
author: Zhengping Zhu
---

* content
{:toc}

## 概念

想象一下你是一个医生。当你的病人感到不舒服，生病了，你会怎么做？

你首先需要了解他的病因对么？在大多数情况下，根据您的知识和经验研究症状，在大多数情况下都能找到病因。

但是，你可能也不是总能这么幸运，有些患者的并很复杂或者病因很不常见。这时候需要对患者进行诊断，进行一个或多个测试。然后结合测试的结果发现病因。你才可以进行正确的治疗计划。

在数据库性能优化中，我们也需要这么做。现在我们需要学习如何诊断 SQL Server 数据库中性能问题。看看下面的文字，了解我们之前是如何优化数据库的：

>* [SQL Server优化数据访问: Part I](http://kk93.win/2016/12/08/sqlserver-optimize-partI/)
>* [SQL Server优化数据访问: Part II](http://kk93.win/2016/12/15/sqlserver-refactor-partII/)
>* [SQL Server优化数据访问: Part III](http://kk93.win/2016/12/20/sqlserver-advanced-partIII/)


### 第八步：诊断性能问题，使用SQL Profiler和性能监视工具

SQL Profiler分析器工具是SQL Server领域中最着名的性能故障排除工具，如果要调查性能问题，这是启用诊断数据库的第一个工具。

<b>SQL Profiler 基本使用方法</b>

90%几率是你已经会使用这个工具了，但是我假设是很多新手阅读这篇文章，并且想了解 SQL Profiler 的基本使用方法。

按以下列方式开始使用SQL Profiler：

>* 启动SQL Profiler（工具 - > Management Studio中的SQL Server Profiler），并连接SQL Server实例. 选择要跟踪的文件并选择跟踪模板。<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_ProfilerTemplate.JPG" style="display:block;" />
>* （可选）选择特定事件（在跟踪中输出），并选择/取消选择列（在跟踪输出中查看的信息）。<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_Events.JPG" style="display:block;" />
>* （可选）指定跟踪中的显示顺序,此外，过滤您感兴趣的事件数据，例如，单击“过滤器”并指定数据库名称（在“Like”文本框中）只跟踪指定数据库。请注意，过滤很重要，因为SQL事件探查器会捕获所有不必要的事件，信息太多的话很难处理。<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_ColumnFilter.JPG" style="display:block;" />
>* 运行分析器（单击绿色的播放按钮），然后等待返回结果。<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_trace.JPG" style="display:block;" />
>* 当获取到跟踪信息时，停止分析器(按下红色停止图标),并将跟踪信息保存到跟踪文件或SQL Server表中.<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_Save_Trace.JPG" style="display:block;" />
>* 如果跟踪保存在表上,则使用下列SQL查询.
```sql
SELECT TextData,Duration,..., FROM Table_Name ORDER BY
Duration DESC
```
<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_Trace_Query.JPG" style="display:block;" />

<b>有效使用SQL Profiler来解决性能相关问题</b>

在大多数情况下，SQL 分析器可以用来找到最耗时的性能问题。并且该工具不仅能给出TSQL持续时间信息，还可以用来诊断和排除许多不同的问题。

当你运行 SQL Profiler时，要么你需要诊断性能问题，或者你需要提前诊
断任何可能的性能问题，确保您的系统部署在生产环境中没有问题。













