---
layout: post
title:  "Entity framework"
date:   2016-08-04 16:32:18 +0800
categories: linq
tags: .net linq
author: Zhengping Zhu
---

* content
{:toc}

## 概念

ADO.NET Entity Framework 是一种编程模型，主要减少数据库结构与面向对象编程结构之间的差异。使用EF，你不用编写 SQL 代码就能与关系型数据库交互。并且，在与强类型进行 LINQ 查询时，EF 还会在运行时生成正确的 SQL 语句。





### Entity Framework 的基础知识

EF API 是以 ADO.NET 为基础的。和其他 ADO.NET 交互方式一样，Entity Framework 使用一个 ADO.NET 数据提供程序来与数据存储进行交互。所不同的是，在能够与 EF API 交互之前，微软 SQL Server 数据提供程序已经对底层结构进行了必要的更新以支持 System.Data.Entity.dll 程序集。

System.Data.Entity.dll 程序集还包含了各种命名空间来解释 EF 服务本身。EF API 的两个关键部分为对象服务和实体客户端









