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

### IPHostEntry 类

IPHostEntry 类用于封装与某台特定的主机相关的信息。通过这个类的 HostName 属性，可以使用主机名，通过 AddressList 属性返回一个 IPAddress 对象数组。

### Dns 类

Dns 类能够与默认的 DNS 服务器进行通信，以检索 IP 地址。Dns 类有两个重要的静态方法：Resolve()方法和 GetHostByAddress()方法。给 Resolve() 方法提供主机名，Resolve() 方法就可以使用 DNS 服务器获取主机的详细信息，给 GetHostByAddress()方法提供 IP 地址，GetHostByAddress()方法也可以返回主机的详细信息。这两个方法都返回一个 IPhostEntry 对象。

```c#
IPHostEntry wroxHost = Dns.Resolve("www.wrox.com");
IPHostEntry wroxHostCopy = Dns.GetHostByAddress("208.215.179.178");
```

这段代码中，两个 IPHostEntry 对象将包含 wrox.com 服务器的详细信息。

Dns 类与 IPAddress 类和 IPHostEntry 类的不同之处在于：Dns 类实际上可以与服务器进行通信，以获取有关信息: 而 IPAddress 类和 IPHostEntry 类只是包含许多便利属性的简单数据结构，可以访问底层的数据。

### DnsLookup 示例

下面通过查找 DNS 名称的示例来说明 DNS 和 IP 相关的类

该示例应用程序让用户在主文本框中输入 DNS 名称。当用户点击 Resolve 按钮时，这个示例就是用 Dns.Resolve()方法检索 IPHostEntry 引用，并显示主机名和 IP 地址。注意，显示的主机名也许与输入的名称不同，如果一个 DNS 名称仅作为另一个 DNS 名称的代理，就会发生这种情况。

<img src="http://ww2.sinaimg.cn/mw690/006dag38jw1f6zedwxa5sj30da0bamxv.jpg" style="width:70%" />

这些控件分别名为 textBoxInput、btnResolve、txtBoxHostName 和 listboxIPs。

```c#
private void btnResolve_Click(object sender, EventArgs e)
{
	try
	{
		IPHostEntry iphost = Dns.GetHostEntry(textBoxInput.Text);
		foreach (IPAddress ip in iphost.AddressList)
		{
			string ipaddress = ip.AddressFamily.ToString();
			listboxIPs.Items.Add(ipaddress);
			listboxIPs.Items.Add(" " + ip.ToString());
		}
		txtBoxHostName.Text = iphost.HostName;
	}
	catch(Exception ex)
	{
		MessageBox.Show("Unable to process the request because " +
			"the following problem occurred:\n"
			+ ex.Message, "Exception occurred");
	}
}
```

### 较低层的协议

这里介绍一些用于较低层次上进行通信的 .NET 类。System.Net.Socket 命名空间包含一些相关的类。

类 					|用途
Socket				|这个低层的类用于管理连接。WebRequest、TcpClient 和 UdpClient 等类在内部使用这个类
NetworkStream		|这个类是从 Stream 派生的，它表示来自网络的数据流
SmtpClient			|允许通过 SMTP 发送消息(邮件)
TcpClient			|允许创建和使用 TCP 连接
TcpListener			|允许监听引入的 TCP 连接请求
UdpClient			|用于为 UDP 客户创建连接(UDP 是 TCP 的一种替代协议，它没有得到广泛应用，主要用于本地网络)

FTP 并不是依赖于文本命令的唯一高层协议，HTTP、SMTP、POP和其他协议都基于相似的文本命令。同样，许多现代的图形工具隐藏了命令的传输过程，因此用户一般意识不到这些命令的存在。例如，在 Web 浏览器中输入 URL 和把 Web 请求发送给服务器时，浏览器实际上发给服务器的是一条纯文本的 GET 命令，这条命令的作用与 FTP 的 get 命令相似。此外，浏览器也可以发送 POST 命令，该命令表示浏览器在请求上附有其他数据。

但是，协议本身都不足以实现计算机直接的通信。即使客户和服务器都理解某个协议，如 HTTP,它们仍然不能互相理解，除非另外有协议说明字符是如何传输的，即使用的是什么二进制格式。更进一步说，认真考虑最底层问题，什么电压用于代表二进制数据中的0和1？这些问题都需要通过协议配置和规定他们，因此网络领域的开发人员和硬件工程师通常要查阅协议栈。在列出两个主机进行通信所需要的各种协议和机制时，创建一个协议栈，其中既有高层协议，也有最底层的协议。这种方法利用模块化和分成的方式获得了高效的通信。

### 使用 SmtpClient

SmtpClient 对象可以通过 SMTP 传送邮件消息。使用 SmtpClient 对象的一个简单示例如下：

```c#
SmtpClient sc = new SmtpClient("mail.mySmtpHost.com");
sc.Send("evjen@yahoo.com", "editor@wrox.com", "The latest chapter", "Here is the latest.");
```

在其最简单的形式中，使用了 SmtpClient 对象的一个实例。在这个例子中，该实例还提供 SMTP 服务器的主机，该 SMTP 服务器用来在 Internet 上发送邮件消息。还可以使用 Host 属性完成相同的任务：

```c#
SmtpClient sc = new SmtpClient();
sc.Host = "mail.mySmtpHost.com";
sc.Send("evjen@yahoo.com", "editor@wrox.com", "The latest chapter", "Here is the latest.");
```

有了 SmtpClient 对象后，就可以调用 Send()方法，提供 From 地址、To 地址、主题以及邮件的消息正文。

在许多情况下，邮件消息都比这里的示例复杂，为此，还可以给 Send() 方法传递一个 MailMessage 对象：

```c#
SmtpClient sc = new SmtpClient();
sc.Host = "mail.mySmtpHost.com";
MailMessage mm = new MailMessage();
mm.Sender = new MailAddress("evjen@yahoo.com", "Bill Evjen");
mm.To.Add(new MailAddress("editor@wrox.com", "Paul Reese"));
mm.To.Add(new MailAddress("marketing@wrox.com", "Wrox Marketing"));
mm.CC.Add(new MailAddress("publisher@wrox.com", "Barry Pruett"));
mm.Subject = "The latest chapter";
mm.Body = "<b>Here you can put a long message</b>";
mm.IsBodyHtml = true;
mm.Priority = MailPriority.High;
sc.Send(mm);
```

使用 MailMessage 对象可以细调构建邮件消息的方式。我们可以发送 HTML 消息，添加任意多个 To 和 CC 收件人，修改消息的优先级，使用消息编码，以及添加附件。添加附件的功能在下面的代码片段中定义：

```c#
SmtpClient sc = new SmtpClient();
sc.Host = "mail.mySmtpHost.com";
MailMessage mm = new MailMessage();
mm.Sender = new MailAddress("evjen@yahoo.com", "Bill Evjen");
mm.To.Add(new MailAddress("editor@wrox.com", "Paul Reese"));
mm.To.Add(new MailAddress("marketing@wrox.com", "Wrox Marketing"));
mm.CC.Add(new MailAddress("publisher@wrox.com", "Barry Pruett"));
mm.Subject = "The latest chapter";
mm.Body = "<b>Here you can put a long message</b>";
mm.IsBodyHtml = true;
mm.Priority = MailPriority.High;
Attachment att = new Attachment("myExcelResults.zip", MediaTypeNames.Application.Zip);
mm.Attachments.Add(att);
sc.Send(mm);
```

### 使用 TCP 类

传输控制协议(TCP)类为连接和发送两个端点之间的数据提供了简单的方法。端点是IP地址和端口号的组合。已有的协议很好地定义了端口号，例如，HTTP 使用端口 80，SMTP 使用端口 25。Internet 地址编码分配机构把端口号赋予这些已知的服务。除非实现某个已知的服务，否则应选择大于1024的端口号。

### TcpSend 和 TcpReceive 示例

为了说明这两个类的工作原理，需要构建两个应用程序。第一个应用程序是 TcpSend，

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f700i2xm55j309404pjrk.jpg" />

创建了一个 C# Windows 应用程序，其中的窗体包含两个文本框(txtHost 和 txtPort)，分别用于主机名和端口。该窗体还有一个按钮(btnSend)，单击它可以启动一个连接。

```c#
private void btnSend_Click(object sender, EventArgs e)
{
	TcpClient tcpClient = new TcpClient(txtHost.Text, Int32.Parse(txtPort.Text));
	NetworkStream ns = tcpClient.GetStream();
	FileStream fs = File.Open("form2.cs", FileMode.Open);

	int data = fs.ReadByte();

	while (data != -1)
	{
		ns.WriteByte((byte)data);
		data = fs.ReadByte();
	}

	fs.Close();
	ns.Close();
	tcpClient.Close();
}
```

这个示例用主机名何端口号创建 TcpClient 类。或者，如果有 IPEndPoint 类的一个实例，就可以把该实例传递给 TcpClient 类的构造函数。在检索到 NetworkStream 类的一个实例后，打开源代码文件，并开始读取字节。与许多二进制流一样，这里也需要将 ReadByte()方法的返回值和-1相比较，以确定是否到达流的末尾。

为了避免应用程序界面的冻结，我们使用一个后台线程来等待，然后从连接中读取

```c#
public Form2()
{
	InitializeComponent();
	Thread thread = new Thread(new ThreadStart(Listen));
	thread.Start();
}

public void Listen()
{
	IPAddress localAddr = IPAddress.Parse("127.0.0.1");
	Int32 port = 2112;
	TcpListener tcpListener = new TcpListener(localAddr, port);
	tcpListener.Start();

	TcpClient tcpClient = tcpListener.AcceptTcpClient();
	NetworkStream ns = tcpClient.GetStream();
	StreamReader sr = new StreamReader(ns);
	string result = sr.ReadToEnd();
	Invoke(new UpdateDisplayDelegate(UpdateDisplay), new object[] { result});
	tcpClient.Close();
	tcpListener.Stop();
}

public void UpdateDisplay(string text)
{
	txtDisplay.Text = text;
}

protected delegate void UpdateDisplayDelegate(string text);
```

该线程在 Listen()方法中执行，并允许在不暂停界面的情况下阻塞对 AcceptTcpClient() 方法的调用。注意这里把 IP 地址 127.0.0.1 和端口号 2112 硬编码到应用程序中，因此需要从客户端应用程序输入相同的端口号。

### UDP

UDP 是一个几乎没有什么功能的简单协议，且几乎没有什么系统开销。开发人员常常在速度和性能要求比可靠性更高的应用程序中使用 UDP，如视频流。

可以看出，和 TcpClient 类相比，UdpClient 类提供了一个较小、较简单的接口。尽管 TCP 和 UDP 类都在后台使用套接字，但 UdpClient 类不包含返回一个网络流以读写数据的方法。相反，成员函数 Send() 把一个字节数组作为参数，Receive()函数则返回一个字节数组。另外， UDP 是一个无连接的协议，所以可以指定把通信的端点作为 Send()方法和 Receive()方法的一个参数，而不是在前面的构造函数或 Connect()方法中指定。

```c#
static void Main(string[] args)
{

	UdpClient udpClient = new UdpClient();
	string sendMsg = "Hello echo server";
	byte[] sendBytes = Encoding.ASCII.GetBytes(sendMsg);
	udpClient.Send(sendBytes, sendBytes.Length, "SomeEchoServer.net", 7);
	IPEndPoint endPoint = new IPEndPoint(0, 0);
	byte[] revBytes = udpClient.Receive(ref endPoint);
	string rcvMessage = Encoding.ASCII.GetString(revBytes, 0, revBytes.Length);

	// should print out "Hello echo server";
	Console.WriteLine(rcvMessage);
	Console.ReadKey();
}
```

Encoding.ASCII 类常常用于把字符串转化为字节数组，或把字节数组转化为字符串。还要注意，IPEndPoint 应通过引用传递给 Receive() 方法。因为 UDP 不是一个面向连接的协议，对 Reveice()方法的每次调用都会从不同的端点读取数据，所以 Receive()方法会用发送主机的 IP 地址和端口填充该参数。

### Socket 类

Socket 类提供了网络编程中最高级的控制。说明该类简单的方式是用 Socket 类重写 TcpReceive 应用程序。

```c#
 public void Listen()
{

	Socket listener = new Socket(AddressFamily.InterNetwork,
		SocketType.Stream,
		ProtocolType.Tcp);

	listener.Bind(new IPEndPoint(IPAddress.Any, 2112));
	listener.Listen(0);
	Socket socket = listener.Accept();
	Stream netStream = new NetworkStream(socket); 
	StreamReader reader = new StreamReader(netStream);
	string result = reader.ReadToEnd();
	Invoke(new UpdateDisplayDelegate(UpdateDisplay), new object[] { result});
	socket.Close();
	listener.Close();
}
```

Socket 类需要再编写几行代码来完成相同的任务。对于初学者，构造函数的参数需要为使用 TCP 协议的流套接字指定 IP 寻址方案。这些参数只是可用于 Socket 类的许多组合之一，TcpClient 类会配置这些设置。接着把侦听器的套接字绑定到一个端口上，开始帧听引入的连接。当引入的请求到达时，就可以使用 Accept() 方法创建一个新的套接字来处理该连接。最后为套接字附加一个 StreamReader 实例来读取引入的数据，其方式与前面大致相同。

Socket 类也包含许多方法，用于异步地接受、连接、发送和接收数据。通过回调委托使用这些方法的方式与前面用 WebRequest 类请求异步页面的方式相同。如果确实需要了解套接字的内部情况，就可以使用 GetSocketOption()方法和 SetSocketOption()方法，他们允许查看和配置各种选项，包括超时、生存期和其他低级选项。

```c#
static void Main(string[] args)
{

	Socket listener = new Socket(AddressFamily.InterNetwork,
		SocketType.Stream,
		ProtocolType.Tcp);

	listener.Bind(new IPEndPoint(IPAddress.Any, 2112));
	listener.Listen(10);

	while (true)
	{
		Socket socket = listener.Accept();
		string receivedValue = string.Empty;
		while (true)
		{
			byte[] receivedBytes = new byte[1024];
			int numBytes = socket.Receive(receivedBytes);
			Console.WriteLine("Receiving .");
			receivedValue += Encoding.ASCII.GetString(receivedBytes, 0, numBytes);
			if (receivedValue.IndexOf("[FINAL]") > -1)
			{
				break;
			}
		}
		Console.WriteLine("Received value: {0}", receivedValue);
		string replyValue = "Message successfully received.";
		byte[] replyMessage = Encoding.ASCII.GetBytes(replyValue);
		socket.Send(replyMessage);
		socket.Shutdown(SocketShutdown.Both);
		socket.Close();
	}
	listener.Close();

	Console.ReadKey();
}
```

这个例子使用 Socket 类建立了一个套接字。该套接字使用 TCP 协议，并通过端口 2112 接收从任意 IP 地址引入的消息。把通过打开的套接字接收到的值写入控制台屏幕。这个消费应用程序会继续接收字节，知道接收到[FINAL]字符串为止。

### 构建客户端应用程序

下一步是构建一个客户端应用程序，该应用程序给第一个控制台应用程序发送一条消息。客户端只要遵循该应用程序建立的规则，就可以给服务器控制台应用程序发送任何消息。第一条规则是服务器控制台应用程序只是用特别的协议帧听。本例中的服务器应用程序使用 TCP 协议帧听消息。另一条规则是服务器应用程序只帧听特定的端口，对于本例是端口 2112.最后一条规则是对于任意正在发送的消息，消息的最后一位必须以字符串[FINAL]结尾。

```c#
static void Main(string[] args)
{
	byte[] receivedBytes = new byte[1024];
	IPHostEntry ipHost = Dns.Resolve("127.0.0.1");
	IPAddress ipAddress = ipHost.AddressList[0];
	IPEndPoint ipEndPoint = new IPEndPoint(ipAddress, 2112);
	Console.WriteLine("Starting: Creating Socket object");
	Socket sender = new Socket(AddressFamily.InterNetwork,
		SocketType.Stream,
		ProtocolType.Tcp);

	sender.Connect(ipEndPoint);
	Console.WriteLine("Successfully connected to {0}",sender.RemoteEndPoint);
	string sendingMessage = "Hello World Socket Test";
	Console.WriteLine("Creating message: Hello World Socket Test");
	byte[] forwardMessage = Encoding.ASCII.GetBytes(sendingMessage + "[FINAL]");
	sender.Send(forwardMessage);

	int totalBytesReceived = sender.Receive(receivedBytes);
	Console.WriteLine("Message provided from server: {0}",Encoding.ASCII.GetString(receivedBytes,0,totalBytesReceived));
	sender.Shutdown(SocketShutdown.Both);
	sender.Close();
	Console.ReadLine();
}
```

<img src="http://ww4.sinaimg.cn/mw690/006dag38jw1f70997dfdij30jz0f6jsg.jpg" style="width:100%" />






