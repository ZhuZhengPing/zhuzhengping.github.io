---
layout: post
title:  "网络 Http"
date:   2016-08-16 16:32:18 +0800
categories: .net
tags: .net http
author: Zhengping Zhu
---

* content
{:toc}

## 概念

HttpClient 类用于发送 HTTP 请求，接收请求的响应，它在 System.Net.Http 命名空间中。System.Net.Http 命名空间的类有助于简化在客户端和服务器上使用 Web 服务

HttpClient 类派生于 System.Net.Http.HttpMessageInvoker 类，这个类负责执行 SendAsync 方法。SendAsync 方法是 HttpClient 类的主干。SendAsync 方法调用是异步的，这样就可以编写一个完全异步的系统来调用 Web 服务。










