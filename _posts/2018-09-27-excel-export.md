---
layout: post
title:  "excel导入导出"
date:   2018-09-27 16:32:18 +0800
categories: .net
tags: excel
author: Zhengping Zhu
---

* content
{:toc}

## 概念

做项目时经常会用到 excel 导入导出，今天花了点时间整理了一下代码，亲测是可用的，excel没有增加任何样式，看起来比较丑，
如果你也有同样的项目需求，或者是想参考一下代码，请点击下面的链接下载

<a href='http://47.112.115.26/file/excelImportExport.rar' style='display:block'>示例代码下载</a>

注意事项1：此示例代码需要安装 AccessDatabaseEngine 组件来读取 excel数据，不安装的话会出现错误，AccessDatabaseEngine 已经放到示例代码中。

注意事项2：此示例代码需要部署到iis上才能成功运行，否则会出现错误




























### 导出

导出使用的 <a href='https://github.com/ZhuZhengPing/js-xlsx'>js-xlsx</a> , 你可以去 github 上找到此项目代码 <a href='https://github.com/ZhuZhengPing/js-xlsx'>https://github.com/ZhuZhengPing/js-xlsx</a> ，下面是我写的导出功能

首先需要添加 js-xlsx 引用

```js
<script src="js/shim.min.js"></script>
<script src="js/xlsx.full.min.js"></script>
```

然后导出方法是这样的

```js
 var options = {
	url: "/myHandler.ashx?method=getExportExcel",
	columnsTitle: ["姓名", "年龄","身高"],
	columnsField: ["Name", "Age","Height"],
	Name: "测试excel.xlsx"
}

function exportExcel() {
	$.getJSON(options.url, function (data) {
		// 内容
		var gridContent = "";
		
		// 默认会导出json数据的所有元素，下面是删除掉不需要的列
		for (var i = 0; i < data.length; i++) {
			for (var item in data[i]) {
				if (options.columnsField.indexOf(item) == -1) {
					delete data[i][item];
				}
			}
		}

		// 第一行添加标题
		for (var i = 0, row = {}; i < options.columnsTitle.length; i++) {
			row[options.columnsField[i]] = options.columnsTitle[i];
		}
		data.unshift(row);

		var ws = XLSX.utils.json_to_sheet(data, {
			header: options.columnsField,
			skipHeader: true,
			dateNF: "yyyy/MM/dd",
			cellDates: "d"
		});
		var wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "sheet1");
		XLSX.writeFile(wb, options.Name);
	});
}
```

后台模拟了3条数据
```c#
// 获得导出excel数据
private void getExportExcel(HttpContext context)
{
	List<People> list = new List<People>();
	list.Add(new People() { 
		Name="张三",
		Age=19,
		Height=170
	});
	list.Add(new People()
	{
		Name = "李四",
		Age = 22,
		Height = 100
	});
	list.Add(new People()
	{
		Name = "王五",
		Age = 39,
		Height = 180
	});
	string json = JsonConvert.SerializeObject(list);
	context.Response.Write(json);
}
```

如此最简单的导出功能就完成了

### 导入

导入功能要使用 jquery 插件 ajaxfileupload，文件类型的文本框导入时，每次都需要清空文件文本框，否则的话无法第二次导入。js代码为

```js
var file = document.getElementById("txtImport");
file.outerHTML = file.outerHTML
```

html代码只放了一个导出按钮和一个导入文本框

```html
<input type="button" value="导出excel" onclick="exportExcel();" />
<p><input type="file" id="txtImport" name="txtImport" value="" onchange="importExcel();" /></p>
```

导入方法如下

```js
function importExcel() {
	$.ajaxFileUpload({
		url: '/myHandler.ashx?method=setImportExcel', //用于文件上传的服务器端请求地址
		secureuri: false, //是否需要安全协议，一般设置为false
		fileElementId: 'txtImport', //文件上传域的ID
		dataType: 'json', //返回值类型 一般设置为json
		success: function (data, status) {
			alert(data);
			var file = document.getElementById("txtImport");0
			file.outerHTML = file.outerHTML
		}, error: function (data, status, e) {
			alert("导入失败！");
			var file = document.getElementById("txtImport");
			file.outerHTML = file.outerHTML
		}
	})
}
```

后台一般处理程序接收到导入文件，并解析excel数据，代码如下

```c#
// 后台方法接收文件
private void setImportExcel(HttpContext context)
{
	var files = context.Request.Files;
	HttpPostedFile file = files[0];
	ExportHelper helper = new ExportHelper();
	var actionMsg = helper.ExportIn(file, p =>
	{
		string message = string.Empty;
		List<People> list = new List<People>();
		if (p != null && p.Rows.Count >= 0)
		{
			for (var i = 0; i < p.Rows.Count; i++)
			{
				People people = new People();
				people.Name = p.Rows[i]["姓名"].ToString();
				people.Age =int.Parse( p.Rows[i]["年龄"].ToString());
				people.Height = int.Parse(p.Rows[i]["身高"].ToString());
				list.Add(people);
			}
		}

		return JsonConvert.SerializeObject(list);
	});
	context.Response.Write(actionMsg);
}

// 导入通用方法
/// <summary>
/// 导入
/// </summary>
/// <param name="ImportClass">数据流</param>
/// <param name="action">回调函数</param>
public string ExportIn(HttpPostedFile ImportClass, Func<DataTable, string> action)
{
	int FileLen = ImportClass.ContentLength;
	byte[] FileData = new byte[FileLen];
	Stream sr = ImportClass.InputStream;//创建数据流对象 
	sr.Read(FileData, 0, FileLen);
	sr.Close();

	string path = AppDomain.CurrentDomain.SetupInformation.ApplicationBase + "ExportOutput";
	if (!System.IO.Directory.Exists(path))
		System.IO.Directory.CreateDirectory(path);

	path += "\\" + Guid.NewGuid().ToString() + ".xlsx";
	File.WriteAllBytes(path, FileData);

	string strConn = string.Format("Provider=Microsoft.ACE.OLEDB.12.0;Data Source={0};Extended Properties='Excel 8.0;HDR=Yes;IMEX=1;'", path);
	OleDbConnection conn = new OleDbConnection(strConn);
	conn.Open();
	string strExcel = "";
	OleDbDataAdapter myCommand = null;
	DataSet ds = null;
	strExcel = "select * from [sheet1$]";
	myCommand = new OleDbDataAdapter(strExcel, strConn);
	ds = new DataSet();
	myCommand.Fill(ds, "table1");

	conn.Close();
	myCommand = null;

	// 删除
	try
	{
		File.Delete(path);
	}
	catch
	{
	}

	return action(ds.Tables[0]);
}
```

方法ExportIn接收一个委托作为参数，用于回调处理excel数据，这里代码要部署到iis,否则 无法读取excel里面的数据时报错，因为这里只是示例方法，所以读取数据后直接返回出去，并没有做任何处理。