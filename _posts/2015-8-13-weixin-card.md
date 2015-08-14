---
layout : post
title : "微信卡卷"
category : 微信
duoshuo: true
date : 2015-8-13

---

前些天因为公司要求做一个卡卷开发的功能，走了很多的弯路，为了预防下次再走弯路，特别在这里做一个总结。

[官方微信给出了对应的JSSDK文档](http://mp.weixin.qq.com/wiki/7/aaa137b55fb2e0456bf8dd9148dd613f.html)

####步骤一：绑定域名

这里只能绑定一级域名和顶级域名，如果绑定的二级域名或者三级域名，会出现 invalid signature错误

一开始分不清什么是一级域名，什么是二级域名，最后问了网络方面的朋友才知道，域名之中有几个点就是几级域名

例如 `baidu.com` 之间只有一个 `.`， 是一级域名， `www.baidu.com` 之间有两个 `.`， 是二级域名

所做的域名在该域名下  或者是属于该域名的子域名

####步骤二： 引入JS文件

官方给出了示例代码

	wx.config({
		debug: true, 
		appId: '', // 必填，公众号的唯一标识, 填写公众平台appId
		timestamp: , // 必填，生成签名的时间戳
		nonceStr: '', // 必填，生成签名的随机串
		signature: '',// 必填，签名，见附录1
		jsApiList: ['addCard','chooseCard','openCard'] // 必填，需要使用的JS接口列表，这里如果要到达领取页面，只需要调用 addCard接口
	});

虽然弄不明白 `addCard`,'chooseCard','openCard'三个接口具体是什么意思，但是先写上

新建 index.aspx页面

下面生成timestamp, nonceStr, signature, 使用 后台代码`asp.net`实现

	// 定义wx.config参数
	public string appid { get; set; }
    public string nonceStr { get; set; }
	public string time { get; set; }
	public string signature { get; set; }
	
	// 加载事件获得参数
	protected void Page_Load(object sender, EventArgs e)
	{
		if (!IsPostBack)
		{
			GetJSSign();
		}
	}
	
	// 生成wx.config参数
	public void GetJSSign()
	{
		time = CreatenTimestamp().ToString();
		nonceStr = CreatenNonce_str();
		string ticket = GetJSTicket();
		// 指定当前页的url 需要和当前页面的地址完全相同 `baidu.com` 换成你当前页面所在的域名 
		string url = "http://baidu.com/index.aspx";
		signature = GetSignature(ticket, nonceStr, time, url).ToLower();
	}
	
	/// <summary>
	/// 创建时间戳
	///本代码来自开源微信SDK项目：https://github.com/night-king/weixinSDK
	/// </summary>
	/// <returns></returns>
	public static long CreatenTimestamp()
	{
		return (DateTime.Now.ToUniversalTime().Ticks - 621355968000000000) / 10000000;
	}
	
	/// <summary>
	/// 创建随机字符串
	///本代码来自开源微信SDK项目：https://github.com/night-king/weixinSDK
	/// </summary>
	/// <returns></returns>
	public static string CreatenNonce_str()
	{
		string[] strs = new string[]
		{
		"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z",
		"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
		};
		Random r = new Random();
		var sb = new StringBuilder();
		var length = strs.Length;
		for (int i = 0; i < 16; i++)
		{
			sb.Append(strs[r.Next(length - 1)]);
		}
		return sb.ToString();
	}
	
	public string GetJSTicket()
	{
		// token
		string _appid = System.Configuration.ConfigurationManager.AppSettings["AppID"];
		appid = _appid;
		string secret = System.Configuration.ConfigurationManager.AppSettings["AppSecret"];
		string url = string.Format("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}", appid, secret);
		string token = CheckTokenTime("Token.xml", url, 0);
		
		url = string.Format("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token={0}&type=jsapi", token);
		string ticket = CheckTokenTime("Ticket.xml", url, 2);
		return ticket;
	}
	
	public static string CheckTokenTime(string name,string postUrl,int index)
	{
		System.Xml.XmlDocument doc = new System.Xml.XmlDocument();
		string url = System.AppDomain.CurrentDomain.SetupInformation.ApplicationBase + name;// "Token.xml";
		doc.Load(url);
		System.Xml.XmlNode node = doc.SelectSingleNode("//Tokens");
		string token = node.Attributes["Token"].Value;
		string tokenTime = node.Attributes["TokenTime"].Value;
		//当前时间
		DateTime nowTime = DateTime.Now;

		///如果配置文件中的tokenTime的时间消炎当前时间减7000秒
		///那么该token将失效
		///重新获取新的token，并更新tokenTime  和  token
		if (tokenTime == "" || tokenTime == null || Convert.ToDateTime(tokenTime) < nowTime.AddSeconds(-6000))
		{
			token = GettokenForTest(postUrl, index);
			UpdateConfig(token, nowTime, name);
		}
		return token;
	}
	
	public static string Post(string url, string prarm)
	{
		try
		{
			string result = "";
			byte[] bs = System.Text.Encoding.UTF8.GetBytes(prarm);
			System.Net.HttpWebRequest req = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(url);

			req.Method = "POST";
			req.ContentType = "application/x-www-form-urlencoded";
			req.ContentLength = bs.Length;
			req.KeepAlive = false;
			//req.UserAgent = "";
			using (System.IO.Stream reqStream = req.GetRequestStream())
			{
				reqStream.Write(bs, 0, bs.Length);
				using (System.Net.HttpWebResponse response = (System.Net.HttpWebResponse)req.GetResponse())
				{
					using (System.IO.Stream resStream = response.GetResponseStream())
					{
						System.IO.StreamReader sr = new System.IO.StreamReader(resStream, System.Text.Encoding.UTF8);
						result = sr.ReadToEnd().Trim();
						sr.Close();
					}
				}
			}
			return result;
		}
		catch (Exception ex)
		{
			return ex.Message;
		}
	}
	
	/// <summary>
	/// 获取最新的Token  
	/// </summary>
	/// <param name="corpid"></param>
	/// <param name="corpsecret"></param>
	/// <returns></returns>
	public static string GettokenForTest(string url,int index)
	{
		string Token = "";
		//string appid = System.Configuration.ConfigurationSettings.AppSettings["AppID"];
		//string secret = System.Configuration.ConfigurationSettings.AppSettings["AppSecret"];
		try
		{
			//string url = string.Format("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid={0}&secret={1}", appid, secret);
			byte[] bs = System.Text.Encoding.UTF8.GetBytes("");
			System.Net.HttpWebRequest req = (System.Net.HttpWebRequest)System.Net.HttpWebRequest.Create(url);

			req.Method = "POST";
			req.ContentType = "application/x-www-form-urlencoded";
			req.ContentLength = bs.Length;
			req.KeepAlive = false;
			//req.UserAgent = "";
			using (System.IO.Stream reqStream = req.GetRequestStream())
			{
				reqStream.Write(bs, 0, bs.Length);
				using (System.Net.HttpWebResponse response = (System.Net.HttpWebResponse)req.GetResponse())
				{
					using (System.IO.Stream resStream = response.GetResponseStream())
					{
						System.IO.StreamReader sr = new System.IO.StreamReader(resStream, System.Text.Encoding.UTF8);
						Token = sr.ReadToEnd().Trim();
						sr.Close();
						string[] str = Token.Substring(1, Token.Length - 1).Split(',');
						str = str[index].Split(':');
						Token = str[1].Trim('"');
					}
				}
			}
			return Token;
		}
		catch (Exception)
		{
			throw;
		}
	}
	
	// Token.xml
	<?xml version="1.0" encoding="utf-8"?>
	<Tokens Token="" TokenTime=""></Tokens>
	
	// Ticket.xml
	<?xml version="1.0" encoding="utf-8"?>
	<Tokens Token="" TokenTime=""></Tokens>
	
	/// <summary>
	/// 签名算法
	///本代码来自开源微信SDK项目：https://github.com/night-king/weixinSDK
	/// </summary>
	/// <param name="jsapi_ticket">jsapi_ticket</param>
	/// <param name="noncestr">随机字符串(必须与wx.config中的nonceStr相同)</param>
	/// <param name="timestamp">时间戳(必须与wx.config中的timestamp相同)</param>
	/// <param name="url">当前网页的URL，不包含#及其后面部分(必须是调用JS接口页面的完整URL)</param>
	/// <returns></returns>
	public static string GetSignature(string jsapi_ticket, string noncestr, string timestamp, string url)
	{
		var string1Builder = new StringBuilder();
		string1Builder.Append("jsapi_ticket=").Append(jsapi_ticket).Append("&")
					  .Append("noncestr=").Append(noncestr).Append("&")
					  .Append("timestamp=").Append(timestamp).Append("&")
					  .Append("url=").Append(url.IndexOf("#") >= 0 ? url.Substring(0, url.IndexOf("#")) : url);
		var str = string1Builder.ToString();
		return System.Web.Security.FormsAuthentication.HashPasswordForStoringInConfigFile(str, "SHA1"); 
	}

特别提醒，这里的坑我碰到几个

签名算法一定要使用jsapi_ticket签名，因为这里是生成 wx.config签名， 也就是 `附录1-JS-SDK使用权限签名算法`,千万不要使用 
`附录4-卡券扩展字段及签名生成算法` 签名， 因为我就是在这里一直纠结

引入JS文件 

	<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>
    <script src="../RepairMaintain/js/zepto.min.js"></script>
	
	// 重新配置wx.config
	wx.config({
		debug: true,  
		appId: '<%=appid%>',
		timestamp: '<%=time%>',
		nonceStr: '<%=nonceStr%>',
		signature: '<%=signature%>',
		jsApiList: [
			'addCard'
		]
    });
	
做到这里，jssdk终于配置成功， Token 和 ticket 都缓存在xml文件中

#### 步骤三：拉取卡卷列表，供用户选择	
	
做到这里的时候就犯迷糊了，微信卡卷文档给出了3个接口 `addCard`,'chooseCard','openCard' , 拉取卡卷列表页面是哪个接口呢？

看来看去， 感觉只有'chooseCard' 这个接口最像， 可是现实是残酷的，等我费了九牛二虎之力实现了 'chooseCard'接口以后，发现这个

接口只能拉取已领取的卡卷，其实文档上面也特别提醒了：

>特别提醒
>拉取列表仅与用户本地卡券有关，拉起列表异常为空的情况通常有三种：签名错误、时间戳无效、筛选机制有误。请开发者依次排查定位原因。

如果使用 `addCard`批量添加卡券接口一次性添加多个卡卷呢，是不是就是卡卷列表了呢？

	wx.addCard({
		cardList: [{
			cardId: 'XXXXXX', cardExt: '{"timestamp": "123456789", "signature": "123456789"}',
			cardId: 'XXXXXX', cardExt: '{"timestamp": "123456789", "signature": "123456789"}',
			cardId: 'XXXXXX', cardExt: '{"timestamp": "123456789", "signature": "123456789"}',
			cardId: 'XXXXXX', cardExt: '{"timestamp": "123456789", "signature": "123456789"}',
			cardId: 'XXXXXX', cardExt: '{"timestamp": "123456789", "signature": "123456789"}'
		}],
	});

这里只是做一个示例， cardId 需要在你的公众号上卡卷管理里面去，如果没有创建卡卷，需要创建卡卷以及卡卷白名单，timestamp,signature 需要在后台生成

这么做了以后，发现了一个问题，这里是批量领取的，并且如果卡卷已经领取以后，会出现 `添加失败`的提示，不是我所要求的卡卷列表页面，`所以后面做过各种尝试，卡卷列表页面应该是自己写的`

#### 步骤四：领取卡卷

既然卡卷列表是自己写的页面，那么这里就不多说了，现在说说怎么到达卡卷领取页面。	

领取卡卷又是哪个接口呢？ 经过一系列尝试，发现领取页面是 `addCard`接口， 下面是我的实现代码

`html` 代码实现
	
	// html代码 toCardDetail('XXXXXXXXXXXXXXX') X表示 cardId
	<span style="float:right;font-size: 1.3rem;" onclick="toCardDetail('XXXXXXXXXXXXXXX')">代金券&nbsp;&nbsp;200元</span>

	// js代码,返回 timestamp时间轴,signature签名
	function toCardDetail(card_id) {
		$.getJSON("XXX.ashx?type=getCardsDetail", { "card_id": card_id }, function (d) {
			wx.addCard({
				cardList: [{
					cardId: d.card_id, cardExt: '{"timestamp": "'+d.timestamp+'", "signature": "'+d.signature+'"}'
				}],
			});
		});
	}
	
后台一般处理程序 代码实现，返回json数据

	private void getCardsDetail(HttpContext context)
	{
		try
		{
			string appid = System.Configuration.ConfigurationManager.AppSettings["AppID"];
			string card_id = context.Request.QueryString["card_id"];
			string secret = System.Configuration.ConfigurationManager.AppSettings["AppSecret"];appid, secret);
			long cardtime = CreatenTimestamp()/1000;
			string[] ArrTmp = { cardtime.ToString(), secret, card_id};
			Array.Sort(ArrTmp);
			string tmpStr = string.Join("", ArrTmp);
			string cardsignature = System.Web.Security.FormsAuthentication.HashPasswordForStoringInConfigFile(tmpStr, "SHA1").ToLower();
			string json = "{\"card_id\":\"" + card_id + "\",\"timestamp\": \"" + cardtime.ToString() + "\", \"signature\":\"" + cardsignature + "\"}";
			context.Response.ContentType = "application/json";
			context.Response.Write(json);
		}
		catch (Exception)
		{
			throw;
		}
	}

如此最简单的卡卷开发就完成了










	
	