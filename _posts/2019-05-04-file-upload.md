---
layout: post
title:  "文件上传"
date:   2018-05-04 16:32:18 +0800
categories: .net
tags: file
author: Zhengping Zhu
---

* content
{:toc}

## 概念

前些时候，做项目的时候需要用到文件上传，并且在上传图片时，需要分不同尺寸压缩图片

举例来说，现在上传一张图片为 `test.png`，存2份图片到服务器，1份为原图，一份为压缩图，如果上传的是视频或者excel文档等其他类型，则只存当前文件

此示例代码可直接运行，默认文件存在 `E:/Files/`，示例代码请点击这里下载

<a href='http://47.112.115.26/file/fileUpload.rar'>示例代码下载</a>















### 文件上传服务

文件上传服务是一个一般处理文件  `Receiver.ashx`，接收文件上传的一些基本信息

```c#
public void ProcessRequest(HttpContext context)
{
	// 类型，save:上传文件，delete:删除文件
	string method = Function.Request("method");
	// 文件上传地址
	string pathList = Function.Request("pathList");
	// 文件名
	string fileName = HttpUtility.UrlDecode(Function.Request("fileName"));
	// 是否图片
	string isImage = Function.Request("isImage");
	// md5加密
	string md5 = Function.Request("md5");
	// 文件类型
	string fileType = Function.Request("fileType");
	
	// 验证加密字符串
	if (!Config.CheckSecret(md5, isImage, pathList, fileName))
	{
		WriteBack(context, false, fileName);
		ErrorLog("身份验证", pathList + fileName + ";身份验证错误！");
		return;
	}

	bool re = false;
	if (method == "save")
	{
		re = SaveFile(context, isImage == "1", pathList, fileName, fileType);
	}
	else if (method == "delete")
	{
		re = DeleteFile(context, pathList, fileName);
		ErrorLog("删除文件", pathList + fileName + "身份验证错误！");
	}

	WriteBack(context, re, fileName);
}
```

保存文件时，先取到传递过来的文件夹，然后判定是否为图片，如果是图片，需要压缩分文件夹存储，否则直接存储

```c#
private bool SaveFile(HttpContext context, bool isImage, string pathList, string fileName, string fileType)
{
	HttpPostedFile file = this.GetFile();
	IDictionary<string, int> folders = SubFolders(pathList);
	if (file == null || file.ContentLength == 0 || folders == null || folders.Count == 0)
	{
		ErrorLog("添加图片", pathList + fileName + "：文件夹为空！");
		return false;
	}

	string error;
	Stream s = file.InputStream;
	if (isImage)
	{
		foreach (var item in folders)
		{
			Directory.CreateDirectory(item.Key);
			if (!this.SaveAsImage(s, item.Key, fileName, item.Value, fileType, out error))
			{
				ErrorLog("添加图片", item.Key + fileName + "：" + error);
				return false;
			}
		}
	}
	else
	{
		foreach (var item in folders)
		{
			Directory.CreateDirectory(item.Key);
			if (!this.SaveAsFile(s, item.Key, fileName, out error))
			{
				ErrorLog("添加图片", item.Key + fileName + "：" + error);
				return false;
			}
		}
	}

	return true;
}
```

`SaveAsImage`方法是图片存储方法，此方法根据传递过来的文件夹大小来生成图片大小

```c#
/// <summary>
/// 保存图片
/// </summary>
/// <param name="input">图片流</param>
/// <param name="path">路径</param>
/// <param name="fileName">文件名</param>
/// <param name="width">大小</param>
/// <param name="fileType">类型</param>
/// <param name="error">错误信息</param>
/// <returns>是否成功</returns>
private bool SaveAsImage(Stream input, string path, string fileName, int width, string fileType, out string error)
{
	return MyImage.SaveAs(input, path + fileName, width, 0, fileType, out error);

}
```

另存为当前的图片，根据原图复制新图

```c#
/// <summary>
/// 图片另存为
/// </summary>
/// <param name="sourcePath">原图片路径</param>
/// <param name="newPath">新图路径</param>
/// <param name="white">新图宽</param>
/// <param name="height">新图高</param>
public static bool SaveAs(Stream sourceStream, string newPath, int newWidth, int newHeight, string fileType, out string error)
{
	using (Image image = Image.FromStream(sourceStream))
	{
		return SaveAs(image, newPath, newWidth, newHeight, fileType, out error);
	}
}
```

图片另存为的具体实现

```c#
/// <summary>
/// 图片另存为
/// </summary>
/// <param name="sourcePath">原图片路径</param>
/// <param name="newPath">新图路径</param>
/// <param name="white">新图宽</param>
/// <param name="height">新图高</param>
private static bool SaveAs(Image image, string newPath, int newWidth, int newHeight, string fileType, out string error)
{
	error = null;

	try
	{
		//获取原图高度和宽度
		int oldh = image.Height;
		int oldw = image.Width;
		int neww, newh;


		if (newPath.Contains("Source") || (newWidth <= 0 && newHeight <= 0) || newWidth >= oldw || newHeight >= oldh)
		{
			ImageSave(newPath, image, image, fileType);

			//image.Save(newPath, image.RawFormat);
			//ImageSave(newPath, image, image);
			return true;
		}
		else if (newWidth <= 0 && newHeight > 0)
		{
			newWidth = newHeight * oldw / oldh;
		}
		else if (newWidth > 0 && newHeight <= 0)
		{
			newHeight = newWidth * oldh / oldw;
		}

		neww = newWidth;
		newh = newHeight;   //直接设定新图的高宽,,
		using (Bitmap bt = new Bitmap(neww, newh))
		{
			using (Graphics gr = GetGraphics(bt))
			{
				gr.Clear(Color.White);
				gr.DrawImage(image, new Rectangle(0, 0, neww, newh), 0, 0, oldw, oldh, GraphicsUnit.Pixel);

				if (File.Exists(newPath))
				{
					File.Delete(newPath);
				}
				ImageSave(newPath, image, bt, fileType);
			}
		}
		return true;
	}
	catch (Exception e)
	{
		error = e.Message;
		return false;
	}
}
```

如此，简单的图片上传就完成了，下面看看具体实现

### 调用图片上传服务

我写了一个的mvc项目来实现文件上传功能，前台页面只有一个文件上传按钮和文件文本框

```html

<script src="~/Content/jquery-1.10.2.min.js"></script>

<input type="file" id="FileUpload" /><br />
<input type="button" value="提交" onclick="tt();" />


<script type="text/javascript">
    function tt() {
        var fileObj = document.getElementById("FileUpload").files[0]; // js 获取文件对象
        if (typeof (fileObj) == "undefined" || fileObj.size <= 0) {
            alert("请选择图片");
            return;
        }
        var formFile = new FormData();
        formFile.append("action", "/api/File/UploadFile");
        formFile.append("fileName", "");
        formFile.append("file1", fileObj); //加入文件对象
        

        var data = formFile;
        $.ajax({
            url: "/Home/TestFileUpload",
            data: formFile,
            type: "Post",
            dataType: "json",
            cache: false,//上传文件无需缓存
            processData: false,//用于对data参数进行序列化处理 这里必须false
            contentType: false, //必须
            success: function (result) {
                alert(result.path);
            },
        })
    }
</script>
```

后台接受文件参数，根据参数后缀名判定是图片还是其他文件，如果是图片的话，需要传递多个文件夹来存储不同尺寸的图片，具体实现如下

```c#
public ActionResult TestFileUpload()
{
	Hashtable hash = new Hashtable();

	FileType fileType;

	// 路径
	string path = GetLocalPath(FileType.Image);

	HttpPostedFileBase fs = Request.Files["file1"];

	if (fs == null)
	{
		hash["error"] = "1";
		hash["message"] = "没有任何文件";
	}

	// 原文件名
	string oldFileName = fs.FileName;

	// 后缀
	string extension = Path.GetExtension(fs.FileName).ToLower();

	string isImage = "0";

	string pathList = string.Empty;

	// 确定上传类型  
	if (FileExtensionImage.IndexOf(extension) != -1)        // 图片
	{
		fileType = FileType.Image;
		isImage = "1";
		pathList = GetPathList(fileType, path);
	}
	else if (FileExtensionVideo.IndexOf(extension) != -1)  // 视频     
	{
		fileType = FileType.Video;
		pathList = GetLocalPath(fileType);
	}
	else                                                   // 其他
	{
		fileType = FileType.Other;
		pathList = GetLocalPath(fileType);
	}

	// 上传后的文件名
	string hookFileName = System.Guid.NewGuid().ToString().Replace("-", null);

	// 改名后的文件名
	string fileName = Request.Form["fileName"];

	if (!string.IsNullOrWhiteSpace(fileName))
	{
		hookFileName = hookFileName + "_" + fileName;
	}
	hookFileName = hookFileName + extension;

	Stream file = fs.InputStream;

	string url = ConfigurationManager.AppSettings["FilesServiceList"];

	string method = "delete";

	IDictionary<string, Stream> fileParams = null;
	if (file != null)
	{
		method = "save";
		fileParams = new Dictionary<string, Stream>();
		fileParams.Add(hookFileName, file);
	}

	IDictionary<string, string> textParams = new Dictionary<string, string>();
	textParams.Add("method", method);
	textParams.Add("isImage", isImage);
	textParams.Add("pathList", pathList);
	textParams.Add("fileName", HttpUtility.UrlEncode(hookFileName));
	textParams.Add("md5", Encrypt(isImage, pathList, hookFileName));//用文件名 及路径 签名
	textParams.Add("fileType", ((int)fileType).ToString());//文件类型，如果是汽车图片，需要添加水印 2017-08-17 wuf

	string error = null;

	//只要有一个服务器上传成功就返回成功！，剩下的丢后台自行了断
	string temp = new MyHttp(url).Submit(fileParams, textParams, out error);
	if (string.IsNullOrEmpty(error))
	{
		this.CheckServerBack(temp, hookFileName, out error);
	}

	if (!string.IsNullOrEmpty(error))
	{
		hash["error"] = 1;
		hash["message"] = hookFileName + "到文件服务器：" + error;
		return Json(hash, JsonRequestBehavior.AllowGet);
	}

	string paramImgPath = ConfigurationManager.AppSettings["ParamImgPath"].Trim();

	string responsePath = string.Empty;
	if (fileType == FileType.Image)
	{
		responsePath = GetImageLocalPath(ImageType.ImageSource);

		string slightlyPath = GetImageLocalPath(ImageType.Image220);
		hash["slightlyPath"] = paramImgPath + slightlyPath + hookFileName;
	}
	else
	{
		responsePath = GetLocalPath(fileType);
	}
	string sourcePath = paramImgPath + responsePath + hookFileName;

	hash["error"] = 0;
	hash["message"] = "上传成功！";
	hash["path"] = sourcePath;

	return Json(hash,JsonRequestBehavior.AllowGet);
}
```






