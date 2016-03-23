---
layout : post
title : "control"
category : mvc
duoshuo: true
date : 2015-10-30

---

模拟`control`操作
	
	public interface IController { 
		void Execute(RequestContext requestContext); 
	} 
	
	public class BasicController : IController { 
        public void Execute(RequestContext requestContext) { 
            string controller = (string)requestContext.RouteData.Values["controller"];             
			string action = (string)requestContext.RouteData.Values["action"]; 
            requestContext.HttpContext.Response.Write( 
                string.Format("Controller: {0}, Action: {1}", controller, action)); 
        } 
    } 

`control` 接收参数
	
|Property  |类型 | 描述
|:------|:------|:------
|Request.QueryString  | NameValueCollection| GET variables sent with this request
|Request.Form| NameValueCollection | POST variables sent with this request 
|Request.Cookies | HttpCookieCollection | Cookies sent by the browser with this request 
|Request.HttpMethod | string  | The HTTP method (verb, such as GET or POST)  used for this request 	
|Request.Headers  | NameValueCollection  | The full set of HTTP headers sent with this request  	
|Request.Url  | Uri  | The URL requested 	
|Request.UserHostAddress  | string  | The IP address of the user making this request  	
|RouteData.Route | RouteBase  | The chosen RouteTable.Routes entry for this request 	
|RouteData.Values  | RouteValueDictionary  | Active route parameters (either extracted from the URL or default values) 	
|HttpContext.Application   | HttpApplicationStateBase   | Application state store 	
|HttpContext.Cache   | Cache   | Application cache store 	
|HttpContext.Items   | IDictionary   | State store for the current request 	
|HttpContext.Session  | HttpSessionStateBase   | State store for the visitor’s session 	
|User   | IPrincipal    | Authentication information about the loggedin user
|TempData   | TempDataDictionary    |Temporary data items stored for the current user 	
	
模拟`ActionResult`

	CustomRedirectResult : ActionResult { 
        public string Url { get; set; } 
        public override void ExecuteResult(ControllerContext context) {             
			string fullUrl = UrlHelper.GenerateContentUrl(Url, context.HttpContext); 
            context.HttpContext.Response.Redirect(fullUrl); 
        } 
    } 
	
Table 15-2. Built-in ActionResult Types	

|Type  |Description  | Helper Methods
|:------|:------|:------
|ViewResult   | Renders the specified or default view template | View 
|PartialViewResult | Renders the specified or default partial view template  | PartialView  
|RedirectToRouteResult | Issues an HTTP 301 or 302 redirection to an action method or specific route entry, generating a URL according to your routing configuration | RedirectToAction RedirectToActionPermanent RedirectToRoute RedirectToRoutePermanent  
|RedirectResult  | Issues an HTTP 301 or 302 redirection to a specific URL   | Redirect RedirectPermanent  	
|HttpUnauthorizedResult  | Sets the response HTTP status code to 401 (meaning “not authorized”), which causes the active authentication mechanism (forms authentication or Windows authentication) to ask the visitor to log in   | None  	
|HttpNotFoundResult  | Returns a HTTP 404—Not found error   | HttpNotFound 	
|HttpStatusCodeResult   | Returns a specified HTTP code   | None  	
|EmptyResult  | Does nothing   | None 	

Redirect

|Type  |Description  | Helper Methods
|:------|:------|:------
|RedirectToRoute   | Redirect To Route | RedirectToRoute(new {controller = "Example",action = "Index",ID = "MyID"});
|RedirectToAction | Redirect To Action | RedirectToAction("Index", "Basic"); }  

`TempData` 和ViewBag不同，使用后即移除,需要强制转换

	@(((DateTime)TempData["Date"]).DayOfWeek) 
	
	// You can get a value from TempData without marking it for removal by using the Peek method
	DateTime time = (DateTime)TempData.Peek("Date"); 
	
	// You can preserve a value that would otherwise be deleted by using the Keep method, like this: 
	TempData.Keep("Date");

throw exception

	// 404
	public HttpStatusCodeResult StatusCode() { 
		return HttpNotFound(); 
	} 
	
	// 401
	public HttpStatusCodeResult StatusCode() {     
		return new HttpUnauthorizedResult(); 
	}

SessionState 
	
	|Value  |Description 
	|:------|:------
	|Default    | Use the default ASP.NET behavior, which is to determine the session state configuration from the HttpContext. 
	|Required | Full read-write session state is enabled. 
	|ReadOnly  | Read-only session state is enabled. 
	|Disabled  | Session state is disabled entirely. 

Asynchronous Controller

	// Action代码
	public class RemoteDataController : AsyncController { 
        public async Task<ActionResult> Data() { 
            string data = await Task<string>.Factory.StartNew(() => {                 
				return new RemoteService().GetRemoteData(); 
            });  
            return View((object)data); 
        } 
    } 
	
	// 服务代码
	 public class RemoteService { 
        public string GetRemoteData() { 
            Thread.Sleep(2000); 
            return "Hello from the other side of the world"; 
        } 
        public async Task<string> GetRemoteDataAsync() {             
			return await Task<string>.Factory.StartNew(() => { 
                Thread.Sleep(2000); 
                return "Hello from the other side of the world"; 
            }); 
        } 
    } 






	