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





```c#
static async void GetData()
{
	HttpClient httpClient = new HttpClient();
	HttpResponseMessage response = null;
	response = await httpClient.GetAsync("http://services.odata.org/northwind/northwind.svc/regions");
	if (response.IsSuccessStatusCode)
	{
		Console.WriteLine("Response Status Code: " + response.StatusCode + " " + response.ReasonPhrase);
		string responseBodyAsText = response.
			Content.
			ReadAsStringAsync().
			Result;
		Console.WriteLine("Received payload of"
			+ responseBodyAsText.Length
			+ " characters");
	}
}
```

### 标题

HttpClient 的 DefaultRequestHeaders 属性允许设置或改变标题。使用 Add 方法可以给集合添加标题。

```c#
httpClient.DefaultRequestHeaders.Add("Accept", "application/json;odata=verbose");
```

从 DefaultHeaders 属性返回的 HttpRequestHeaders 对象有许多辅助属性，可用于许多标准标题。可以从这些属性中读取标题的值，但它们是只读的。要设置其值，需要使用 Add 方法。

```c#
static async void GetData()
{
	HttpClient httpClient = new HttpClient();
	HttpResponseMessage response = null;
	httpClient.DefaultRequestHeaders.Add("Accept", "application/json;odata=verbose");
	Console.WriteLine("Request Headers:");
	EnumerateHeaders(httpClient.DefaultRequestHeaders);
	Console.WriteLine();
	response = await httpClient.GetAsync("http://services.odata.org/northwind/northwind.svc/regions");
	if (response.IsSuccessStatusCode)
	{
		Console.WriteLine("Response Headers:");
		EnumerateHeaders(response.Headers);
	}
}
```

EnumerateHeaders 函数很简单：

```c#
private static void EnumerateHeaders(HttpHeaders headers)
{
	foreach (var header in headers)
	{
		var value = "";
		foreach (var val in header.Value)
		{
			value = val + " ";
		}
		Console.WriteLine("Header: "+header.Key+" Value:"+value);
	}
}
```

下面是显示的输出结果

```
Request Headers:
Header:Accept Value: application/json; odata=verbose

Response Headers:
Header: Connection Value: Keep-Alive
Header: Vary Value: *
Header: X-Content-Type-Options Value:nosniff
Header: DataServiceVersion Value: 2.0
...
```

### HttpContent

响应中的 Content 属性返回一个 HttpContent 对象。为了获得 HttpContent 对象中的数据，需要使用所提供的一个方法。在例子中，使用了 ReadAsStringAsync 方法。这是一个异步调用，但在这个例子中没有使用异步调用功能。调用 Result 方法会阻塞该调用，直到 ReadAsStringAsync 方法执行完毕，然后继续执行下面的代码

其他从 HttpContent 对象中获得数据的方法有 ReadAsStringAsync(返回数据的字节数组)和 ReadAsStringAsync(返回一个流)。也可以使用 LoadIntoBufferAsync 把内容加载到内存缓存中。

### HttpMessageHandler

HttpClient 类可以把 HttpMessageHandler 作为其构造函数的参数，这样就可以定制请求。默认使用 WebRequestHandler 对象。它有许多属性可以设置，例如 ClientCertificates 、Pipelining、CachePolity、ImpersonationLevel等。

HttpClientMessageHandlerRequest 项目时一个非常简单的例子，说明了如何添加定制的处理程序。

```c#
static void GetData()
{
	HttpClient httpClient = new HttpClient();
	HttpResponseMessage response = null;
	Console.WriteLine();
	response = httpClient.GetAsync("http://services.odata.org/northwind/northwind.svc/regions").Result;
	Console.WriteLine(response.StatusCode);
}
```

注意创建 HttpClient 对象的调用接受了一个参数-MessageHandler 对象。这个处理程序的作用是把一个字符串作为参数，在控制台上显示它，如果消息是"error"，就把响应的状态码设置为 Bad Request。

```c#
public class MessageHandle : HttpClientHandler
{
	string displayMessage = "";
	public MessageHandle(string message)
	{
		displayMessage = message;
	}
	protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, System.Threading.CancellationToken cancellationToken)
	{
		Console.WriteLine("In DisplayMessageHandler "+displayMessage);
		if (displayMessage == "error")
		{
			var response = new HttpResponseMessage(System.Net.HttpStatusCode.BadRequest);
			var tsc = new TaskCompletionSource<HttpResponseMessage>();
			tsc.SetResult(response);
			return tsc.Task;
		}
		return base.SendAsync(request, cancellationToken);
	}
}
```

该处理程序的有趣之处是：检查 displayMessage 是否是 "error" ,如果是 "error"，就创建要返回的响应，把状态设置为 Bad Request。接下来的两行代码只创建了要返回的 Task。注意响应在 HttpResponseMessage 任务中通过 SetResult 方法设置。

添加定制处理程序有许多理由。设置处理程序管道，是为了添加多个处理程序。除了默认的处理程序之外，还有 DelegatingHandler,它执行一些代码，再把调用委托给内部或下一个处理程序。HttpClientHandler 是最后一个处理程序，它把请求发送到地址。每个添加的 DelegatingHandler 都调用下一个或内部的处理程序，最后一个是基于 HttpClientHandler 的处理程序。

### 把输出结果显示为 HTML 页面

前几个实例说明了.NET基类如何简化从 Web 上下载和处理数据。但是迄今为止，从 Web 上下载的文件都是以纯文本显示的。人们总是希望以 Internet Explorer 的界面样式查看 HTML 文件，其中呈现的 HTML 允许用户查看 Web 文档的实际面貌。但是，Microsoft 的 Internet Explorer 并没有.NET版本，但这并不意味着，不能完成这个任务。

在.NET Framework 2.0发布之前，可以引用封装了 Internet Explorer 的 COM(Component Object Model，组件对象模型)对象，使用.NET交互操作功能，把应用程序作为浏览器。自从.NET Framework 2.0发布以来，就可以在 Windows Forms 应用程序中使用内置的 WebBrower 控件。

WebBrower 控件封装了 COM 对象，甚至可以更方便地完成以前复杂的任务。除了使用 WebBrower 控制之外，另一个选项是使用编程功能，从代码中调用 Internet Explorer 实例。

如果不使用新的 WebBrowser 控件，就可以使用 System.Diagnostics 命名空间中的 Process 类，通过编程打开 Internet Explorer 进程，导航到给定的网页.

```c#
Process myProcess = new Process();
myProcess.StartInfo.FileName = "iexplore.exe";
myProcess.StartInfo.Arguments = "http://www.wrox.com";
myProcess.Start();
```






