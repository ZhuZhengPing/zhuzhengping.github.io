---
layout : post
title : "url routing"
category : 'mvc'
duoshuo: true
date : 2015-4-27

---

`routing` 取值操作,例如有一个url为 `www.xxx.com/Admin/Index?id=1` 可以从Route中获取到id值

	ViewBag.CustomVariable = RouteData.Values["id"]; 

路由命名空间的设置
	
	routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}", 
    new { controller = "Home", action = "Index", 
        id = UrlParameter.Optional 
    }, 
    new[] { "URLsAndRoutes.AdditionalControllers", "UrlsAndRoutes.Controllers" }); 

使用正则表达式的路由设置

	public static void RegisterRoutes(RouteCollection routes) { 
		 routes.MapRoute("MyRoute", "{controller}/{action}/{id}/{*catchall}",         
		 new { controller = "Home", action = "Index", id = UrlParameter.Optional }, 
		 new { controller = "^H.*"}, 
		 new[] { "URLsAndRoutes.Controllers"}); 
	 }

创建一个自定义的路由器
	
	1. 创建类`UserAgentConstraint`继承`IRouteConstraint`
	2. 实现抽象方法
	3. 路由中指定该自定义的类
	
	using System.Web; 
	using System.Web.Routing; 
	namespace UrlsAndRoutes.Infrastructure {
		public class UserAgentConstraint : IRouteConstraint {
			private string requiredUserAgent; 
			public UserAgentConstraint(string agentParam) { 
				requiredUserAgent = agentParam; 
			}
			public UserAgentConstraint(string agentParam) { 
				requiredUserAgent = agentParam; 
			}
		}
	}
	
	// 路由配置
	routes.MapRoute("ChromeRoute", "{*catchall}",                 
		new { controller = "Home", action = "Index" },                 
		new { customConstraint = new UserAgentConstraint("Chrome")}, 
        new[] { "UrlsAndRoutes.AdditionalControllers" }
	);
	
忽略路由匹配

	outes.IgnoreRoute("Content/{filename}.html");   

路由跳转
		
	@Html.ActionLink("This is an outgoing URL", "CustomVariable") 
	@Html.ActionLink("Click me", "List", "Catalog", new {page=789}, null) 
	
	// ID Class
	@Html.ActionLink("This is an outgoing URL","Index", "Home", null, new {id = "myAnchorID",@class = "myCSSClass"})
	<a class="myCSSClass" href="/" id="myAnchorID">This is an outgoing URL</a> 
	
	@Html.ActionLink("This is an outgoing URL", "Index", "Home",
			"https", 
			"myserver.mydomain.com", 
			" myFragmentName",
			new { id = "MyId"}, 
            new { id = "myAnchorID", @class = "myCSSClass"}) 
	<a class="myCSSClass"  
    href="https://myserver.mydomain.com/Home/Index/MyId#myFragmentName" id="myAnchorID">This is an outgoing URL</a>
	
从后台获得URL

	string myActionUrl = Url.Action("Index", new { id = "MyID" }); 
    string myRouteUrl = Url.RouteUrl(new { controller = "Home", action = "Index" });  

RouteLink 

	@Html.RouteLink("Click me", "MyOtherRoute","Index", "Customer") 

自定义Route处理
	
	public class CustomRouteHandler : IRouteHandler
    {
        public IHttpHandler GetHttpHandler(RequestContext requestContext)
        {
            return new CustomHttpHandler(); 
        }
        public class CustomHttpHandler : IHttpHandler
        {
            public bool IsReusable
            {
                get { return false; }
            }
            public void ProcessRequest(HttpContext context)
            {
                context.Response.Write("Hello");
            }
        } 
    }
	
	
	
	
	
	
	
	
	
	
	
	
	