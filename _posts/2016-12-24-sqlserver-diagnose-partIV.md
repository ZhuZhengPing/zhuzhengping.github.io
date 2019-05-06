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

以下是使用 SQL Profiler 工具时一些常用操作：

<b>如果有模板存在时，使用存在的模板，不要重新创建。</b>

大多数情况下，存在的模板就能满足你的需求。但是如果你需要诊断一些特殊的数据库问题(例如死锁)。在这种情况下你可以使用自定义模板。 File -> Templates -> New Template，指定模板名称，事件以及列。你也可以根基自己的需要修改已经存在的模板。

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_NewTemplate.JPG" style="display:block;" />

创建一个新模板

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/Creating_template.JPG" style="display:block;" />

<b>捕获TableScan或DeadLock事件</b>

你知道你可以使用SQL Profiler监听这两个事件吗？

想象这样一种情况，你已经在测试库建立了所有的索引，经过测试后，你已经在生产服务器中实现了索引，假设有一些未知的原因，在生产数据库中还是有性能问题。你怀疑其中的一个查询执行了一些额外的表扫描。你需要检测问题，但你如何开始呢？

SQL Profiler 给你几种方法来检测这个问题。你可以编辑模板，分析在数据库中可能的表扫描或死锁事件。因此，在创建/编辑跟踪模板时检查 DeadLock 部分中的死锁图以及死锁链事件，然后运行 SQL Profiler .当数据库中发生任何表扫描或死锁时，SQL Profiler 将捕获相应的事件，并且你还能找到上述情况相应的 TSQL。

注意：你可能还需要 SQL Server 日志文件记录死锁事件，以便在日志文件中获取死锁的上下文信息。这很重要，因为你有时候需要结合SQL Server日志文件的信息以检测导致死锁的 TSQL.

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_TableScan.JPG" style="display:block;" />

检测表扫描

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SSMS_Deadlock_Events.JPG" style="display:block;" />

<b>问题重现跟踪</b>

如您所知，为了解决生产数据库服务器中的任何性能问题，你需要在测试数据库服务器中模拟生产环境(查询集，在给定时间段内在生产数据库中执行的连接数)以便可以重现性能问题，你准备怎么做呢？

SQL Profiler允许您重现跟踪功能,您可以使用TSQL_Replay跟踪模板来捕获生产服务器中的事件，并将该跟踪保存在.trace文件中.您可以在测试服务器上重放跟踪，以重新生成和诊断问题。

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_Replay.JPG" style="display:block;" />

如果你想知道更多的 TSQL 重现跟踪，可以看看[http://msdn.microsoft.com/en-us/library/ms189604.aspx](http://msdn.microsoft.com/en-us/library/ms189604.aspx)

<b>创建调优跟踪</b>

数据库 tuning advisor 是一个非常好的工具，可以提供良好的调优建议，以提高数据库性能，要从tuning advisor获得良好的建议，您需要为该工具提供类似于生产环境的“负载负载”,您需要执行相同的一组TSQL并在测试服务器中打开相同数量的并发连接，然后在那里运行tuning advisor，SQL Profiler允许您使用调整模板捕获适当的事件和列集，使用SQL Profiler 的 Tuning templete，捕获跟踪并保存。使用tuning advisor跟踪文件在测试服务器中创建负载.

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_Tuning.JPG" style="display:block;" />

<b>在SQL Profiler中抓取ShowPlan显示SQL执行计划</b>

有时候，相同的查询将在生产和测试服务器中有不同的性能。并且需要调查性能问题，您需要查看生产服务器中用于执行实际查询的TSQL执行计划。

很明显，您只能在生产服务器中运行该TSQL（导致性能问题）来查看实际的执行计划，很多原因。当然，您可以查看类似查询的估计执行计划，但是此执行计划可能不能真正的生产数据库中实际使用的执行计划，SQL Profiler可以在这方面帮助您，在生产服务器中进行概要分析时，可以在跟踪中包括ShowPlan或ShowPlan XML，在生产服务器中进行概要分析时，会在跟踪时捕获SQL计划以及TSQL文本。在测试服务器也这样做，并分析和比较两个执行计划以轻松找出它们之间的差异。

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_ShowPlan.JPG" style="display:block;" />

指定包括在跟踪中的执行计划

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SQL_Profiler_ShowPlanTrace.JPG" style="display:block;" />

### 使用性能监视工具（Perfmon）诊断性能问题

当您在数据库中遇到性能相关的问题，SQL Profiler使您能够在大多数情况下诊断并找出性能问题背后的原因，但是，有时仅仅是profiler不能帮助你确定问题的确切原因。

例如，在使用生产服务器中的分析器分析查询执行时间时，您已经看到相应的TSQL执行缓慢（例如10秒），相同的查询在测试服务器中花费的时间要少得多（例如，200ms）。您分析了查询执行计划和数据量，并发现那些是大致相同的。因此，必须有一些其他问题，在生产服务器中造成瓶颈情况。那么你如何诊断这个问题？

性能监视工具（称为Perfmon）在这些情况下帮助您，性能监视器是一种内置于Windows操作系统中的工具，可以不时收集与硬件和软件度量相关的统计数据。

当TSQL在数据库服务器中执行时，有许多利益相关者参与执行查询并返回结果的操作。这些包括TSQL执行引擎，服务器缓冲区缓存，SQL优化程序，输出队列，CPU，磁盘I / O和许多其他东西。因此，如果这些中的一个没有很好和快速地执行其对应的任务，数据库服务器所需的最终查询执行时间将变长。使用性能监视工具，您可以仔细查看这些单个组件的性能，并找出性能问题的根本原因。

使用性能监视工具（系统监视器），您可以创建包含不同内置计数器（在执行查询时衡量每个单独组件的性能）的计数器日志，并使用图形视图分析计数器日志，以了解详细信息。此外，您可以将性能计数器日志与SQL Profiler跟踪结合一段时间，以便在执行查询时更好地了解完整情况。

#### 性能监视器的基本使用

Windows具有许多内置对象及其对应的性能计数器，这些都是在安装Window时安装的，安装SQL Server时，SQL Server的性能计数器也会被安装。因此，当定义性能计数器日志时，这些计数器可用。

按照以下步骤创建性能计数器日志：

<b>从SQL Profiler工具中的Tools - > Performance Monitor启动性能监视器工具。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/LaunchPerfmon.JPG" style="display:block;" />

<b>通过单击计数器日志 - >新建日志设置创建新的性能计数器日志。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/LaunchPerfmon.JPG" style="display:block;" />

<b>通过单击计数器日志 - >新建日志设置创建新的性能计数器日志。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/New_Perfmon_log.JPG" style="display:block;" />

指定日志文件名，然后按OK。

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/Perfmon_name.JPG" style="display:block;" />

<b>单击“添加计数器”按钮在新创建的计数器日志中选择首选计数器。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/AddCounters.JPG" style="display:block;" />

<b>通过从列表中选择所需的对象及其相应的计数器，添加首选计数器。完成后单击“关闭”。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/PermMonCounters.JPG" style="display:block;" />

<b>所选计数器将以表单形式显示</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/SelectedCounters.JPG" style="display:block;" />

<b>单击日志文件选项卡，然后单击“配置”选项卡以指定日志文件位置，并根据需要修改日志文件名称。完成后单击“确定”。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/CounterLogLocation.JPG" style="display:block;" />

<b>单击“计划”选项卡以指定读取计数器信息并写入日志文件的计划,或者，也可以为“开始日志”和“停止日志”选项选择“手动”，在这种情况下，将在启动性能计数器日志后记录计数器数据。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/Perfmon_schedule.JPG" style="display:block;" />

<b>单击“常规”选项卡并指定收集计数器数据的时间间隔。</b>


<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/PerfmonInterval.JPG" style="display:block;" />

<b>按“确定”并通过选择计数器日志并单击开始启动性能计数器日志,完成后，停止计数器日志。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/StartPerfmonCoutnerLog.JPG" style="display:block;" />

<b>要查看日志数据，请再次关闭并打开性能监视器工具,单击查看日志图标（红色框中的图标）查看计数器日志。单击“源”选项卡，选择“日志文件”单选按钮，然后通过单击“添加”按钮添加日志文件以查看。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/ViewLogFile1.JPG" style="display:block;" />

<b>默认情况下，仅选择三个默认计数器显示在计数器日志输出中。通过单击“数据”选项卡并通过单击“添加”按钮选择所需的计数器，指定其他计数器（在创建计数器日志时包括）。</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/AddCountersViewLogFile.JPG" style="display:block;" />

<b>单击“确定”按钮在图形视图中查看性能计数器日志输出</b>

<img src="https://www.codeproject.com/KB/database/DiagnoseProblemsSQLServer/PerfmonLogOutput.JPG" style="display:block;" />










