---
layout : post
title : "filter"
category : mvc
duoshuo: true
date : 2016-3-13

---

|Filter Type  |Interface | Default Implementation | Description 
|:------|:------|:------|:------
|Authorization  | IAuthorizationFilter| AuthorizeAttribute |Runs first, before any other filters or the action method 
|Action  | IActionFilter | ActionFilterAttribute |Runs before and after the action method 
|Result   | IResultFilter| ActionFilterAttribute  |Runs before and after the action result is executed + 
|Exception  | IExceptionFilter | HandleErrorAttribute  |Runs only if another filter, the action method, or the action result throws an exception 
	
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











	