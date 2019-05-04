---
layout: post
title:  "mysql 必知必会笔记"
date:   2019-01-10 16:32:18 +0800
categories: mysql
tags: mysql
author: Zhengping Zhu
---

* content
{:toc}

## 概念

这几天在看 `MySQL必知必会` 这本书,由于当前公司正在使用的是sql server数据库，有一定的数据基础，去看mysql感觉比较容易，只是记录一些和sql server语法不一样的地方





























### 使用正则表达式进行搜索

#### 使用点通配符

mysql 可以使用正则表达式搜索，其实sql server也是可以的，但是其中语法有不一样，例如下面的搜索

```sql
select prod_name from products where prod_name REGEXP '.000'
```

输出

```
JetPack 1000
JetPack 2000
```

其中.是正则表达式语言中一个特殊的字符。它表示匹配任意一个字符，因此，1000和2000都匹配且返回。


#### 使用 or 匹配

```sql
select prod_name from products where prod_name REGEXP '1000|2000' 
```

输出

```
JetPack 1000
JetPack 2000
```

#### 匹配几个字符之一

```sql
select proc_name from products where prod_name REGEXP '[123] Tom'
```

输出

```
1 ton anvil
2 ton anvil
```

使用正则表达式[123]Ton。意思是匹配1或2或3，因此，1 ton和2 ton都匹配且返回

#### 
