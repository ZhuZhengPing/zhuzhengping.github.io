---
layout : post
title : "filter"
category : 'mvc'
duoshuo: true
date : 2016-3-13

---

|Filter Type  |Interface | Default Implementation | Description 
|:------|:------|:------|:------
|Authorization  | IAuthorizationFilter| AuthorizeAttribute |Runs first, before any other filters or the action method 
|Action  | IActionFilter | ActionFilterAttribute |Runs before and after the action method 
|Result   | IResultFilter| ActionFilterAttribute  |Runs before and after the action result is executed + 
|Exception  | IExceptionFilter | HandleErrorAttribute  |Runs only if another filter, the action method, or the action result throws an exception 
	
Exception filter

	public class RangeExceptionAttribute : FilterAttribute, IExceptionFilter { 
        public void OnException(ExceptionContext filterContext) { 
            if (!filterContext.ExceptionHandled && 
                filterContext.Exception is ArgumentOutOfRangeException) { 
                    filterContext.Result = new RedirectResult("~/Content/RangeErrorPage.html"); 
                    filterContext.ExceptionHandled = true; 
            } 
        } 
    } 

添加一个自定义错误

	<system.web> 
	  <httpRuntime targetFramework="4.5" /> 
	  <compilation debug="true" targetFramework="4.5" /> 
	  <pages> 
		<namespaces> 
		  <add namespace="System.Web.Helpers" /> 
		  <add namespace="System.Web.Mvc" /> 
		  <add namespace="System.Web.Mvc.Ajax" /> 
		  <add namespace="System.Web.Mvc.Html" /> 
		  <add namespace="System.Web.Routing" />       
		  <add namespace="System.Web.WebPages" />     
		  </namespaces> 
	  </pages>   
	  <customErrors mode="On" defaultRedirect="/Content/RangeErrorPage.html"/> 
	</system.web>

定义一个属性错误

	[HandleError(ExceptionType = typeof(ArgumentOutOfRangeException), View = "RangeError")] 
	public string RangeTest(int id) { 
		if (id > 100) { 
			return String.Format("The id value is: {0}", id); 
		} else { 
			throw new ArgumentOutOfRangeException("id", id, ""); 
		} 
	}

自定义ActionFilter

	public class CustomActionAttribute : FilterAttribute, IActionFilter { 
        public void OnActionExecuting(ActionExecutingContext filterContext) { 
            if (filterContext.HttpContext.Request.IsLocal) {                 
				filterContext.Result = new HttpNotFoundResult(); 
            } 
        } 
 
        public void OnActionExecuted(ActionExecutedContext filterContext) { 
            // not yet implemented 
        } 
    } 

	// 使用方法
	[CustomAction] 
	public string FilterTest() { 
		return "This is the FilterTest action"; 
	} 

使用ActionFilter 做计时器

	public class ProfileActionAttribute : FilterAttribute, IActionFilter { 
        private Stopwatch timer; 
  
        public void OnActionExecuting(ActionExecutingContext filterContext) { 
            timer = Stopwatch.StartNew(); 
        } 
 
        public void OnActionExecuted(ActionExecutedContext filterContext) { 
            timer.Stop(); 
            if (filterContext.Exception == null) {                 
			filterContext.HttpContext.Response.Write( 
                    string.Format("<div>Action method elapsed time: {0}</div>",timer.Elapsed.TotalSeconds)); 
            } 
        } 
    } 
	
	// 使用方法
	[ProfileAction] public string FilterTest() { 
		return "This is the ActionFilterTest action"; 
	}
	
Using Result Filters

	public class ProfileResultAttribute : FilterAttribute, IResultFilter { 
        private Stopwatch timer; 
 
        public void OnResultExecuting(ResultExecutingContext filterContext) { 
            timer = Stopwatch.StartNew(); 
        } 
 
        public void OnResultExecuted(ResultExecutedContext filterContext) { 
            timer.Stop(); 
            filterContext.HttpContext.Response.Write( 
                    string.Format("<div>Result elapsed time: {0}</div>", 
                        timer.Elapsed.TotalSeconds)); 
        } 
    } 

	// 使用方法
	[ProfileAction] [ProfileResult] 
	public string FilterTest() { 
		return "This is the ActionFilterTest action"; 
	}
	
使用ActionFilterAttribute 过滤器，ActionFilterAttribute 可以使用 ActionFilter,ResultFilter两种过滤器

	public class ProfileAllAttribute : ActionFilterAttribute { 
        private Stopwatch timer; 
 
        public override void OnActionExecuting(ActionExecutingContext filterContext) { 
            timer = Stopwatch.StartNew(); 
        } 
 
        public override void OnResultExecuted(ResultExecutedContext filterContext) { 
            timer.Stop(); 
            filterContext.HttpContext.Response.Write( 
                    string.Format("<div>Total elapsed time: {0}</div>", 
                        timer.Elapsed.TotalSeconds)); 
        } 
    } 
	
	// 使用方法
	[ProfileAction] 
	[ProfileResult] 
	[ProfileAll] 
	public string FilterTest() { 
		return "This is the FilterTest action"; 
	}
	
Using Global Filters

	public class FilterConfig { 
        public static void RegisterGlobalFilters(GlobalFilterCollection filters) {             
			filters.Add(new HandleErrorAttribute());             
			filters.Add(new ProfileAllAttribute()); 
        } 
    } 
	
另一个自定义的Filter

	[AttributeUsage(AttributeTargets.Method, AllowMultiple=true)]     
	public class SimpleMessageAttribute : FilterAttribute, IActionFilter { 
        public string Message { get; set; } 
        public void OnActionExecuting(ActionExecutingContext filterContext) { 
            filterContext.HttpContext.Response.Write( 
                string.Format("<div>[Before Action: {0}]<div>", Message)); 
        } 
 
        public void OnActionExecuted(ActionExecutedContext filterContext) { 
            filterContext.HttpContext.Response.Write( 
                string.Format("<div>[After Action: {0}]<div>", Message)); 
        } 
    } 
	
	// 使用方法
	public class CustomerController : Controller { 
        [SimpleMessage(Message="A")]         
		[SimpleMessage(Message="B")]         
		public string Index() { 
            return "This is the Customer controller"; 
        } 
    } 