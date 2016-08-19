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

但是，上面的代码会把 Internet Explorer 作为单独的窗口打开，而应用程序并没有与新窗口相连接，因此不能控制浏览器。

### 从应用程序中进行简单的 Web 浏览

为了简单起见，首先创建一个 Window Forms 应用程序，它只有一个 TextBox 控件和一个 WebBrower 控件。构建该应用程序，让最终用户在文本框中输入一个 URL，并按回车键。WebBrowser 控件就会提取网页，并显示得到的文档。

```c#
private void textBox1_KeyPre(object sender,KeyPressEventArgs e){
	if(e.KeyChar == (char)13){
		webBrowser1.Navigate(textBox1.Text);
	}
}
```

### WebRequet 类和 WebResponse 类的层次结构

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f6y7lr7hsxj30h4084q3z.jpg" style="width:100%" />

WebRequest 类和 WebResponse 类都是抽象的，不能进行实例化。这些基类提供了用于处理 Web 请求和响应的通用功能，这些功能独立于给定操作所使用的协议。

有了 WebRequest.Create()方法，在 URI 中就不需要专门用于处理 HTTP 协议的对象。 WebRequest.Create()方法检查 URI 中的协议说明符，以实例化和返回一个适当类的对象。

### URI

Uri 和 UriBuilder 是 System命名空间中的两个类，它们都用于表示 URI。

对于 Uri 类，构造函数需要一个完整的 URI 字符串：

```c#
Uri MSPage = new Uri("http://www.baidu.com/index.html?Order=true");
```

Uri 类提供了许多只读属性。当 Uri 对象构造出来之后，它就不能修改了。

```c#
// ?Order=true
string Queue = MSPage.Query;
// /index.html
string AbsolutePath = MSPage.AbsolutePath;
// http
string Scheme = MSPage.Scheme;
// 80
int Port = MSPage.Port;
// www.baidu.com
string Host = MSPage.Host;
// true
bool IsDefaultPort = MSPage.IsDefaultPort;
```

然而，UriBuilder 类实现的属性较少：只允许构建一个完整的 URI。这些属性可读写。可以给构造函数提供构建 URI 所需的各种组件

```c#
UriBuilder MSPage = new UriBuilder("http", "www.baidu.com", 80, "index.html");
```

或者把值赋给属性，以此构建 URI 的组件

```c#
UriBuilder MSPage = new UriBuilder();
MSPage.Scheme = "http";
MSPage.Host = "www.microsoft.com";
MSPage.Port = 80;
MSPage.Path = "SomeFolder/SomeFile.html";
```

 在完成 UriBuilder 类的初始化后，就可以使用 Uri 属性获得相应的 Uri 对象
 
```c#
Uri CompletedUri = MSPage.Uri;
```

### IP 地址和 DNS 名称

在 Internet 上，服务器和客户端都由 IP 地址或主机名标识。通常，主机名是在 Web 浏览器的窗口中输入的地址。另一方面，IP 地址是计算机用于互相识别的标识符，它实际上是用于确保 Web 请求和响应到达相应计算机的地址。一台计算机甚至可以有多个 IP 地址。

目前，IP 地址一般是一个32位的值，例如192.168.1.100就是一个32位的IP地址。IP地址的这个格式称为 IPv4。目前有许多计算机和其他设备在竞争 Internet 上的一个地点，所以人们开发了一个较新的地址：IPv6.它提供了 64 位的IP地址。.NET Framework 允许应用程序同时使用 IPv4和IPv6.

 为了使这些主机名发挥作用，首先必须发送一个网络请求，把主机名翻译成IP地址，翻译工作由一个或几个 DNS 服务器完成。DNS 服务器中保存的一个表把主机名映射为它知道的所有计算机的 IP 地址以及其他 DNS 服务器的 IP 地址，这些 DNS 服务器用于在该表中查找它不知道的主机名。本机计算机至少知道一个 DNS 服务器。
 
 在发送请求之前，计算机首先应要求 DNS 服务器指出与输入的主机名相对应的 IP 地址。找到正确的 IP 地址后，计算机就可以定位请求，并通过网络发送它。
 
### 用于 IP 地址的.NET类
 
 IPAddress 类代表 IP 地址。地址本身可以作为 GetAddressBytes 属性，并使用 ToString()方法转化为用小数点隔开的十进制格式。此外，IPAddress 类也实现静态的 Parse()方法，这个方法的作用与 ToString()方法刚好相反，把小数点隔开的十进制字符串转化为 IP 地址：
 
```c#
IPAddress ipAddress = IPAddress.Parse("234.56.78.9");
byte[] address = ipAddress.GetAddressBytes();
string ipString = ipAddress.ToString();
```

在上面的示例中，byte 整形数 address 的值是 IP 地址的二进制表示，字符串 ipAddress 的值为文本 "234.56.78.9"。

IPAddress 类还提供了许多静态的常量字段，以返回特殊的地址。例如，Loopback 地址允许计算机给它自己发送信息，而 Broadcast 地址允许多播到本地网络上。

```c#
// The following line will set loopback to "127.0.0.1".
// the loopback address indicates the local host.
string loopback = IPAddress.Loopback.ToString();

// The following line will set broadcast address to "255.255.255.255"
// the broadcast address is used to send a message to all machines on the local network.
string broadcast = IPAddress.Broadcast.ToString();
```










