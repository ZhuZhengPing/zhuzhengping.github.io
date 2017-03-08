---
layout: post
title:  "jQuery插件之ajaxFileUpload"
date:   2017-03-04 16:32:18 +0800
categories: jquery
tags: jquery
author: Zhengping Zhu
---

* content
{:toc}

## 概念

ajaxFileUpload.js 很多同名的，因为做出来一个很容易。

我用的是这个:https://github.com/carlcarl/AjaxFileUpload 

下载地址在这里：http://files.cnblogs.com/files/kissdodog/ajaxfileupload_JS_File.rar

AjaxFileUpload.js并不是一个很出名的插件，只是别人写好的放出来供大家用，原理都是创建隐藏的表单和iframe然后用JS去提交，获得返回值。

当初做了个异步上传的功能，选择它因为它的配置方式比较像jQuery的AJAX，我很喜欢。

评论里面说到的不行。那是因为我们用的不是同一个js。我上github搜AjaxFileUpload出来很多类似js。

ajaxFileUpload是一个异步上传文件的jQuery插件

传一个不知道什么版本的上来，以后不用到处找了。











语法：$.ajaxFileUpload([options])

options参数说明：

|  url　　　　　　　　　|　  上传处理程序地址。　　
|  fileElementId　　　　|　  需要上传的文件域的ID，即`<input type="file">`的ID。
|  secureuri　　　　　　|　 是否启用安全提交，默认为false。 
|  dataType　　　　　　 |　 服务器返回的数据类型。可以为xml,script,json,html。如果不填写，jQuery会自动判断。
|  success　　　　　　　|　提交成功后自动执行的处理函数，参数data就是服务器返回的数据。
|  error　　　　　　　　|　 提交失败自动执行的处理函数。
|  data	　　　　　　　　|　 自定义参数。这个东西比较有用，当有数据是与上传的图片相关的时候，这个东西就要用到了。
|  type	　　　　　　　　|　  当要提交自定义参数时，这个参数要设置成post

错误提示:

1，SyntaxError: missing ; before statement错误
　　如果出现这个错误就需要检查url路径是否可以访问
2，SyntaxError: syntax error错误
　　如果出现这个错误就需要检查处理提交操作的服务器后台处理程序是否存在语法错误
3，SyntaxError: invalid property id错误
　　如果出现这个错误就需要检查文本域属性ID是否存在
4，SyntaxError: missing } in XML expression错误
　　如果出现这个错误就需要检查文件name是否一致或不存在
5，其它自定义错误
　　大家可使用变量$error直接打印的方法检查各参数是否正确，比起上面这些无效的错误提示还是方便很多。

使用方法：

　　第一步：先引入jQuery与ajaxFileUpload插件。注意先后顺序，这个不用说了，所有的插件都是这样。

```js
<script src="jquery-1.7.1.js" type="text/javascript"></script>
<script src="ajaxfileupload.js" type="text/javascript"></script>
```

第二步：HTML代码：
```js
<body>
    <p><input type="file" id="file1" name="file" /></p>
    <input type="button" value="上传" />
    <p><img id="img1" alt="上传成功啦" src="" /></p>
</body>
```

第三步：JS代码

```js
<script src="jquery-1.7.1.js" type="text/javascript"></script>
<script src="ajaxfileupload.js" type="text/javascript"></script>
<script type="text/javascript">
	$(function () {
		$(":button").click(function () {
			ajaxFileUpload();
		})
	})
	function ajaxFileUpload() {
		$.ajaxFileUpload
		(
			{
				url: '/upload.aspx', //用于文件上传的服务器端请求地址
				secureuri: false, //是否需要安全协议，一般设置为false
				fileElementId: 'file1', //文件上传域的ID
				dataType: 'json', //返回值类型 一般设置为json
				success: function (data, status)  //服务器成功响应处理函数
				{
					$("#img1").attr("src", data.imgurl);
					if (typeof (data.error) != 'undefined') {
						if (data.error != '') {
							alert(data.error);
						} else {
							alert(data.msg);
						}
					}
				},
				error: function (data, status, e)//服务器响应失败处理函数
				{
					alert(e);
				}
			}
		)
		return false;
	}
</script>
```

第四步：后台页面upload.aspx代码：

```c#
protected void Page_Load(object sender, EventArgs e)
{
	HttpFileCollection files = Request.Files;
	string msg = string.Empty;
	string error = string.Empty;
	string imgurl;
	if (files.Count > 0)
	{
		files[0].SaveAs(Server.MapPath("/") + System.IO.Path.GetFileName(files[0].FileName));
		msg = " 成功! 文件大小为:" + files[0].ContentLength;
		imgurl = "/" + files[0].FileName;
		string res = "{ error:'" + error + "', msg:'" + msg + "',imgurl:'" + imgurl + "'}";
		Response.Write(res);
		Response.End();
	}
}
```

本实例 [完整代码下载](http://files.cnblogs.com/kissdodog/ajaxFileUpload.zip)

来一个MVC版本的实例：

控制器代码

```c#
public class HomeController : Controller
{
	public ActionResult Index()
	{
		return View();
	}

	public ActionResult Upload()
	{
		HttpFileCollection hfc = System.Web.HttpContext.Current.Request.Files;
		string imgPath = "";
		if (hfc.Count > 0)
		{
			imgPath = "/testUpload" + hfc[0].FileName;
			string PhysicalPath = Server.MapPath(imgPath);
			hfc[0].SaveAs(PhysicalPath);
		}
		return Content(imgPath);
	}
}
```

前端视图，HTML与JS代码，成功上传后，返回图片真实地址并绑定到<img>的SRC地址

```html
<html>
<head>
    <script src="/jquery-1.7.1.js" type="text/javascript"></script>
    <script src="/ajaxfileupload.js" type="text/javascript"></script>
    <script type="text/javascript">
        $(function () {
            $(":button").click(function () {
                if ($("#file1").val().length > 0) {
                    ajaxFileUpload();
                }
                else {
                    alert("请选择图片");
                }
            })
        })
        function ajaxFileUpload() {
            $.ajaxFileUpload
            (
                {
                    url: '/Home/Upload', //用于文件上传的服务器端请求地址
                    secureuri: false, //一般设置为false
                    fileElementId: 'file1', //文件上传空间的id属性  <input type="file" id="file" name="file" />
                    dataType: 'HTML', //返回值类型 一般设置为json
                    success: function (data, status)  //服务器成功响应处理函数
                    {
                        alert(data);
                        $("#img1").attr("src", data);
                        if (typeof (data.error) != 'undefined') {
                            if (data.error != '') {
                                alert(data.error);
                            } else {
                                alert(data.msg);
                            }
                        }
                    },
                    error: function (data, status, e)//服务器响应失败处理函数
                    {
                        alert(e);
                    }
                }
            )
            return false;
        }
    </script>
</head>
<body>
    <p><input type="file" id="file1" name="file" /></p>
    <input type="button" value="上传" />
    <p><img id="img1" alt="上传成功啦" src="" /></p>
</body>
</html>
```

 最后再来一个上传图片且附带参数的实例：控制器代码：

```c#
public class HomeController : Controller
{
	public ActionResult Index()
	{
		return View();
	}

	public ActionResult Upload()
	{
		NameValueCollection nvc = System.Web.HttpContext.Current.Request.Form;

		HttpFileCollection hfc = System.Web.HttpContext.Current.Request.Files;
		string imgPath = "";
		if (hfc.Count > 0)
		{
			imgPath = "/testUpload" + hfc[0].FileName;
			string PhysicalPath = Server.MapPath(imgPath);
			hfc[0].SaveAs(PhysicalPath);
		}
		//注意要写好后面的第二第三个参数
		return Json(new { Id = nvc.Get("Id"), name = nvc.Get("name"), imgPath1 = imgPath },"text/html", JsonRequestBehavior.AllowGet);
	}
}
```

Index视图代码:

```html
<html>
<head>
    <script src="/jquery-1.7.1.js" type="text/javascript"></script>
    <script src="/ajaxfileupload.js" type="text/javascript"></script>
    <script type="text/javascript">
        $(function () {
            $(":button").click(function () {
                if ($("#file1").val().length > 0) {
                    ajaxFileUpload();
                }
                else {
                    alert("请选择图片");
                }
            })
        })
        function ajaxFileUpload() {
            $.ajaxFileUpload
            (
                {
                    url: '/Home/Upload', //用于文件上传的服务器端请求地址
                    type: 'post',
                    data: { Id: '123', name: 'lunis' }, //此参数非常严谨，写错一个引号都不行
                    secureuri: false, //一般设置为false
                    fileElementId: 'file1', //文件上传空间的id属性  <input type="file" id="file" name="file" />
                    dataType: 'json', //返回值类型 一般设置为json
                    success: function (data, status)  //服务器成功响应处理函数
                    {
                        alert(data);
                        $("#img1").attr("src", data.imgPath1);
                        alert("你请求的Id是" + data.Id + "     " + "你请求的名字是:" + data.name);
                        if (typeof (data.error) != 'undefined') {
                            if (data.error != '') {
                                alert(data.error);
                            } else {
                                alert(data.msg);
                            }
                        }
                    },
                    error: function (data, status, e)//服务器响应失败处理函数
                    {
                        alert(e);
                    }
                }
            )
            return false;
        }
    </script>
</head>
<body>
    <p><input type="file" id="file1" name="file" /></p>
    <input type="button" value="上传" />
    <p><img id="img1" alt="上传成功啦" src="" /></p>
</body>
</html>
```

此实例在显示出异步上传图片的同时并弹出自定义传输的参数。本实例[下载地址](http://files.cnblogs.com/kissdodog/MVCAJAXUpload.zip)

2013年1月28日，今天调试过程中发现一个问题，就是作为文件域(<input type="file">)必须要有name属性，如果没有name属性，上传之后服务器是获取不到图片的。如：正确的写法是<input type="file" id="file1" name="file1" />

2013年1月28日，最经典的错误终于找到原因所在了。Object function (a,b){return new e.fn.init(a,b,h)} has no method 'handleError'，这个是google浏览器报的错误，非常经典， 不知道是我的版本问题还是真正存在的问题。这个问题的根源经过N次上传才找到问题的根本所在。答案是：dataType参数一定要大写。如：dataType: 'HTML'。

2016-07-28，评论中的一个错误：TypeError: $.ajaxFileUpload is not a function   我们用的不是同一个JS，你下了别的AJAXFileUpload去了。




