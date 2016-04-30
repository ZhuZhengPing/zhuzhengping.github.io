---
layout: post
title:  "MVC helper用法大全"
date:   2016-04-30 16:32:18 +0800
categories: mvc
tags: mvc
author: Zhengping Zhu
---

* content
{:toc}

##概念

`HtmlHelper`用来在视图中呈现 `HTML` 控件。以下列表显示了当前可用的一些 `HTML` 帮助器。 本主题演示所列出的带有星号 (*) 的帮助器。

Helper    		|Example    						|Description
Display    		|Html.Display("FirstName")   		|Renders a read-only view of the specified model property, choosing an HTML element according to the property’s type and metadata 
DisplayFor 		|Html.DisplayFor(x => x.FirstName) 	|Strongly typed version of the previous helper
Editor     		|Html.Editor("FirstName") 			|Renders an editor for the specified model property, choosing an HTML element according to the property’s type and metadata 
EditorFor		|Html.EditorFor(x => x.FirstName) 	|Strongly typed version of the previous helper
Label 			|Html.Label("FirstName") 		  	|Renders an HTML `<label>` element referring to the specified model property 
LabelFor		|Html.LabelFor(x => x.FirstName)  	|Strongly typed version of the previous 
DisplayForModel	|Html.DisplayForModel()				|Renders a read-only view of the entire model object
EditorForModel	|Html.EditorForModel() 				|Renders editor elements for the entire model object
LabelForModel 	|Html.LabelForModel() 				|Renders an HTML <label> element referring to the

The Values of the `DataType` Enumeration 

Value			|Description 
DateTime 		|Displays a date and time (this is the default behavior for System.DateTime values)
Date 			|Displays the date portion of a DateTime 
Time 			|Displays the time portion of a DateTime
Text 			|Displays a single line of text 
PhoneNumber		|Displays a phone number 
MultilineText 	|Renders the value in a textarea element
Password 		|Displays the data so that individual characters are masked from view 
Url 			|Displays the data as a URL (using an HTML a element) 
EmailAddress	|Displays the data as an e-mail address (using an a element with a  mailto href) 

The Built-In MVC Framework View Templates

Value 			|Effect (Editor) 					|Effect (Display) 
Boolean			|Renders a checkbox for bool values. For nullable bool? values, a select element is created with options for True, False, and Not Set. 					|As for the editor helpers, but with the addition of the disabled attribute, which renders read-only HTML controls. 
Collection		|Renders the appropriate template for each of the elements in an IEnumerable  sequence. The items in the sequence do not have to be of the same type. 	|As for the editor helpers. 
Decimal 		|Renders a single-line textbox input  element and formats the data value to display two decimal places. |Renders the data value formatted to two decimal places. 
DateTime		|Renders an input element whose type attribute is datetime and which contains the complete date and time. |Renders the complete value of a DateTime variable. 
Date 			|Renders an input element whose type attribute is dateand that contains the date component (but not the time). |Renders the date component of a DateTime variable 
EmailAddress 	|Renders the value in a single-line textbox input element. |Renders a link using an HTML a element and an href attribute that is formatted as a mailto URL. 
HiddenInput		|Creates a hidden input element. |Renders the data value and creates a hidden input element. 
Html 			|Renders the value in a single-line textbox input element. |Renders a link using an HTML a element. 
MultilineText 	|Renders an HTML textarea element that contains the data value. |Renders the data value. 
Number			|Renders an input element whose type attribute is set to number. |Renders the data value 
Object			|See explanation after this table. |See explanation after this table. 
Password		|Renders the value in a single-line textbox input element so that the characters are not displayed but can be edited. |Renders the data value—the characters are not obscured. 
String 			|Renders the value in a single-line textbox input element. |Renders the data value. 
Text 			|Identical to the String template. |Identical to the String template
Tel 			|Renders an input element whose type attribute is set to tel. |Renders the data value 
Time 			|Renders an input element whose type attribute is time and which contains the time component (but not the date). |Renders the time component of a DateTime variable 

Creating a Custom Editor Template

>1. The template passed to the helper—for example, Html.EditorFor(m => m.SomeProperty, "MyTemplate") would lead to MyTemplate being used.
>2. Any template that is specified by metadata attributes, such as UIHint. 
>3. The template associated with any data type specified by metadata, such as the DataType attribute.
>4. Any template that corresponds to the.NET class name of the data type being processed.
>5. The built-in String template if the data type being processed is a simple type.
>6. Any template that corresponds to the base classes of the data type.
>7. If the data type implements IEnumerable, then the built-in Collection template will be used.If all else fails, the Object template will be used—subject to the rule that scaffolding is not recursive.







