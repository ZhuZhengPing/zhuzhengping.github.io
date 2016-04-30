---
layout : post
title : "mvc helper"
category : 'mvc'
duoshuo: true
date : 2016-3-28

---
Creating an Inline Helper Method

	@helper ListArrayItems(string[] items) { 
		<ul> 
			@foreach(string str in items) {             
				<li>@str</li>    
			} 
		</ul> 
	}
	// Render
	@ListArrayItem((string[])ViewBag.Fruits)
	
Creating an External Helper Method used C# 

	public static MvcHtmlString ListArrayItems(this HtmlHelper html, string[] list)
	{
		TagBuilder tag = new TagBuilder("ul");
		foreach (string str in list)
		{
			TagBuilder itemTag = new TagBuilder("li");
			itemTag.SetInnerText(str);
			tag.InnerHtml += itemTag.ToString();
		}
		return new MvcHtmlString(tag.ToString()); 
	}
	// rendered
	@using HelperMethods.Infrastructure 
	@Html.ListArrayItems((string[])ViewBag.Fruits);
	
Useful properties defined by the HtmlHelper class 

|Property  |Description
|:------|:------
|RouteCollection   | Returns the set of routes defined by the application 
|ViewBag   | Returns the view bag data passed from the action method to the view that has called the helper method 
|ViewContext   | Returns a ViewContext object, which provides access to details of the request 
	
Useful properties defined by the ViewContext class 

|Property  |Description
|:------|:------
|Controller   | Returns the controller processing the current request 
|HttpContext   | Returns the HttpContext object that describes the current request 
|IsChildAction    | Returns true if the view that has called the helper is being rendered by a child action (see Chapter 18 for details of child actions) 
|RouteData     | Returns the routing data for the request 
|View      | Returns the instance of the IView implementation that has called the helper method 

The most useful members of the TagBuilder class are described in Table

|Property  |Description
|:------|:------
|SetInnerText(string)    | Sets the text contents of the HTML element. The string parameter is encoded to make it safe to display (see the section on HTML string encoding earlier in the
|AddCssClass(string)   | Adds a CSS class to the HTML element. 
|MergeAttribute(string,     string, bool)    | Adds an attribute to the HTML element. The first parameter is the name of the attribute, and the second is the value. The bool parameter specifies if 	
	
defines an instance method called Encode, which solves our problem and encodes a string value so that it can be safely included in a view

	public static MvcHtmlString DisplayMessage(this HtmlHelper html, string msg) { 
		string encodedMessage = html.Encode(msg); 
		string result = String.Format("This is the message: <p>{0}</p>", encodedMessage);     
		return new MvcHtmlString(result); 
	}	

Creating a Self-Closing Form 

	@using(Html.BeginForm()) { 
		<div class="dataElem"> 
			<label>PersonId</label> 
			<input name="personId" value="@Model.PersonId"/> 
		</div> 
		<div class="dataElem"> 
			<label>First Name</label> 
			<input name="FirstName" value="@Model.FirstName"/> 
		</div> 
		<div class="dataElem"> 
			<label>Last Name</label> 
			<input name="lastName" value="@Model.LastName"/> 
		</div> 
		<input type="submit" value="Submit" /> 
	} 

The overloads of the BeginForm helper method 

	|Overload  |Description 
	|:------|:------
	|BeginForm()     | Creates a form which posts back to the action method it originated from 
	|BeginForm(action, controller)   | Creates a form which posts back to the action method and controller, specified as strings
	|BeginForm(action, controller,method)     | As for the previous overload, but allows you to specify the value for the method attribute using a value from the System.Web.Mvc.FormMethod enumeration. 
	|BeginForm(action, controller,method, attributes)     | As for the previous overload, but allows you to specify attributes for the form element an object whose properties are used as the attribute names. 
	|BeginForm(action, controller, routeValues, method, attributes)     | As for the previous overload, but allows you to specify values for the variable route segments in your application routing configuration as an object whose properties correspond to the routing variables. 

Specifying the Route Used by a Form 

	 public static void RegisterRoutes(RouteCollection routes) {             
		routes.IgnoreRoute("{resource}.axd/{*pathInfo}");
		routes.MapRoute(                 
			name: "FormRoute", 
			url: "app/forms/{controller}/{action}" 
		); 
	}
	
	// call the BeginForm method with this routing configuration
	@using(Html.BeginRouteForm("FormRoute", 
		new {}, FormMethod.Post,      
		new { @class = "personClass", data_formType="person"})) { 
		<div class="dataElem"> 
			<label>Last Name</label> 
			<input name="lastName" value="@Model.LastName"/> 
		</div> 
		<input type="submit" value="Submit" /> 
	} 

Basic Input HTML Helpers 

|HTML Element   |Example
|:------|:------
|Checkbox   | Html.CheckBox("myCheckbox", false) Output:  <input id="myCheckbox" name="myCheckbox" type="checkbox" value="true" /> <input name="myCheckbox" type="hidden" value="false" />  
|Hidden field   | Html.Hidden("myHidden", "val")  Output: <input id="myHidden" name="myHidden" type="hidden" value="val" />  
|Radio button   | Html.RadioButton("myRadiobutton", "val", true) Output: <input checked="checked" id="myRadiobutton" name="myRadiobutton" type="radio" value="val" />  	
|Password    | Html.Password("myPassword", "val")  Output: <input id="myPassword" name="myPassword" type="password" value="val" /> 
|Text area    | Html.TextArea("myTextarea", "val", 5, 20, null) Output:  <textarea cols="20" id="myTextarea" name="myTextarea" rows="5">val</textarea>  
|Drop-down list     | Html.DropDownList("myList", new SelectList(new [] {"A", "B"}), "Choose") Output: <select id="myList" name="myList"> <option value="">Choose</option> <option>A</option> <option>B</option> </select> 
|Drop-down list    |Html.DropDownListFor(x => x.Gender, new SelectList(new [] {"M", "F"}))Output: <select id="Gender" name="Gender"><option>M</option><option>F</option></select> 
|Multiple-select     |Html.ListBox("myList", new MultiSelectList(new [] {"A", "B"}))Output:<select id="myList" multiple="multiple" name="myList"><option>A</option><option>B</option></select>    
|Multiple-select     |Html.ListBoxFor(x => x.Vals, new MultiSelectList(new [] {"A", "B"})) Output:<select id="Vals" multiple="multiple" name="Vals"><option>A</option><option>B</option></select> 
 













	