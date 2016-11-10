---
layout: post
title:  "ASP.NET MVC的Model绑定机制：数组"
date:   2016-11-10 16:32:18 +0800
categories: mvc
tags: mvc model
author: Zhengping Zhu
---

* content
{:toc}

## 概念

[续《通过实例模拟ASP.NET MVC的Model绑定机制：简单类型+复杂类型]》](http://www.cnblogs.com/artech/archive/2012/05/23/default-model-binding-01.html)基于数组和集合类型的Model绑定机制比较类似，对于绑定参数类型或者参数类型的某个属性为数组或者集合，如果ValueProvider根据对应的Key能够匹配多条数据，那么这些数据最终将会转换为绑定的数组/集合的元素。此外，针对数组/集合的Model绑定还支持基于索引的方式。[源代码从这里下载](http://files.cnblogs.com/artech/S520.rar)[本文已经同步到《How ASP.NET MVC Works?》中](http://www.cnblogs.com/artech/archive/2012/04/10/how-mvc-works.html)










### 一、基于名称的数组绑定

对于针对NameValueConllectionProvider来说，通过GetValue方法得到的ValueProviderResult的RawValue总是一个字符串数组（不论是否具有多条数据于指定的Key相匹配，如果只有一条匹配的数据，RawValue就是一个具有一个元素的字符串数组）。当我们调用ValueProviderResult的ConvertTo方法将提供的值转换成某种类型时，如果目标类型是数组或者集合，那么RawValue代表的字符串数组元素将会转换成目标对象的元素；如果目标类型不属于集合，那么参与数据转换的仅仅是RawValue数组的第1个元素。

如下面的代码片断所示，在默认的HomeController的默认Action方法Index中，我们创建了一个NameValueCollectionValueProvider对象，作为数据源的NameValueCollection中包含了三个同名（foo）数据条目。我们调用它的GetValue方法得到一个ValueProviderResult对象，然后我们将该对象的RawValue呈现出来。最后我们调用该ValueProviderResult对象的ConvertTo对象将提供的值转换为int[]和int，并将转换后的值呈现出来。

```c#
 public class HomeController : Controller
 {
   public void Index()
   {        
		NameValueCollection dataSource = new NameValueCollection();
		dataSource.Add("foo", "123");
        dataSource.Add("foo", "456");
        dataSource.Add("foo", "789");
        NameValueCollectionValueProvider valueProvider = new NameValueCollectionValueProvider(dataSource, CultureInfo.InvariantCulture);

        ValueProviderResult result = valueProvider.GetValue("foo");
        Response.Write(string.Format("RawValue: {0}<br/>", result.RawValue));
        Response.Write(string.Format("ConvertTo(typeof(int[])): {0}<br/>", result.ConvertTo(typeof(int[]))));
        Response.Write(string.Format("ConvertTo(typeof(int)): {0}<br/>", result.ConvertTo(typeof(int))));
     }
}
```

运行这个程序之后，我们会在浏览器中得到如下的输出结果，上面针对NameValueConllectionProvider的论述可以从输出结果中得到印证。

```c#
RawValue: System.String[]
ConvertTo(typeof(int[])): System.Int32[]
ConvertTo(typeof(int)): 123
```

NameValueConllectionProvider（FormValueProvider和QueryStringValueProvider）的数据值提供机制决定了Model绑定的默认行为。如果绑定的目标对象是一个数组或者集合，匹配的同名数据项将会作为目标对象的元素。实际上HttpFileCollectionValueProvider的数据值提供机制也类似，如果绑定的目标对象类型是一个HttpPostedFileBase数组，那么匹配的同名文件输入元素都将作为其数据源。

```c#
<input name="Foo" type="text" ... />
<input name="Foo" type="text" ... />
<input name="Foo" type="text" ... />
<input name="Bar" type="file" ... /> 
<input name="Bar" type="file" ... />
<input name="Bar" type="file" ... />
```

假设针对具有如下定义的Action方法ActionMethod提交的标单具有如上的输入元素，在三个文本框中输入的字符串将绑定到foo参数，而通过三个文件输入元素上传得文件将会绑定给bar参数。

```c#
Public void ActionMethod(string[] foo, HttpPostedFileBase[] bar)
```

现在我们对用于模拟默认Model绑定的自定义DefaultModelBinder进行进一步完善，使之对基于名称的数组绑定提供支持。如下面的代码片断所示，我们在BindModel方法中添加了针对数组类型的Model绑定代码，而具体的实现定义在BindArrayModel方法中。

```c#
public class DefaultModelBinder
 {
     //其他成员    
     public object BindModel(Type parameterType, string prefix)
     {
         if (!this.ValueProvider.ContainsPrefix(prefix))
         {
             return null;
         }
  
         ModelMetadata modelMetadata = ModelMetadataProviders.Current.GetMetadataForType(() => null, parameterType);
         if (!modelMetadata.IsComplexType)
         {
             return this.ValueProvider.GetValue(prefix).ConvertTo(parameterType);
         }
         if (parameterType.IsArray)
         {
             return BindArrayModel(parameterType, prefix);
         }
         object model = CreateModel(parameterType);
             
         foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(parameterType))
         {                
             string key = string.IsNullOrEmpty(prefix) ? property.Name : prefix + "." + property.Name;
             property.SetValue(model, BindModel(property.PropertyType, key));
         }
         return model;
     }
     private object BindArrayModel(Type parameterType, string prefix)
     {
         IList list = new List<object>();
         if (this.ValueProvider.ContainsPrefix(prefix))
         {
             IEnumerable enumerable = this.ValueProvider.GetValue(prefix).ConvertTo(parameterType) as IEnumerable;
             if (null != enumerable)
             {
                 foreach (var value in enumerable)
                 {
                     list.Add(value);
                 }
             }
         }           
         Array array = Array.CreateInstance(parameterType.GetElementType(), list.Count);
         list.CopyTo(array,0);
         return array;
     }
 }
```

定义在BindArrayModel方法中针对数组的Model绑定逻辑很简单，我们直接通过ValueProvider将通过指定前缀得到的数据值转换为IEnumerable类型，并进一步添加到一个List<object>对象中，最终我们将该List<object>对象的元素拷贝到一个创建的数组对象并将其作为Model对象返回。

为了演示针对数组的Model绑定，我们按照如下的方式修改了Action方法。该方法具有两个参数foo和bar，前者是一个字符串数组，后者的类型Bar的Baz属性是一个整型数组。在Action方法中，我们将foo参数和bar参数的Baz属性代表数组元素呈现出来。

```c#
public class HomeController : Controller
 {
    //其他成员
     private IValueProvider GetValueProvider()
     {
         NameValueCollection requestData = new NameValueCollection();
  
         requestData.Add("foo", "abc");
         requestData.Add("foo", "xyz");
  
         requestData.Add("bar.baz", "123");
         requestData.Add("bar.baz", "456");
  
         return new NameValueCollectionValueProvider(requestData, CultureInfo.InvariantCulture);
     }
  
     public void Action(string[] foo, Bar bar)
     {
         Response.Write("foo: <br/>");
         Array.ForEach(foo,item=> Response.Write("&nbsp;&nbsp;&nbsp;&nbsp;"+ item + "<br/>"));
         Response.Write("bar.Baz: <br/>");
         Array.ForEach(bar.Baz, item => Response.Write("&nbsp;&nbsp;&nbsp;&nbsp;" + item + "<br/>"));
     }
 }
  
 public class Bar
 {
	 public int[] Baz { get; set; }
 }
```

通过GetValueProvider方法提供的NameValueCollectionValueProvider具有针对这两个参数的数据源，从上面的代码片断所示，针对参数foo和bar的数据项具有相同的名称（foo和bar.baz）。该程序运行之后会在浏览器中得到如下所示的输出结果。

```
 foo: 
     abc
     xyz
 bar.Baz: 
     123
     456
```

### 二、基于索引的数组绑定

对于存在于作为ValueProvider数据源的NameValueCollection/Dictionary<string, object>中的数据项来说，如果它们绑定的对象是一个数组，可以采用相同的名称。这样的Model绑定方式仅仅是用于元素为简单类型的数组。除此之外，也可以采用格式为“[index]”的基于索引的前缀来表示。

ValueProvider基于索引的匹配策略也可以通过HtmlHelper<TModel>的模板方法EditorFor来体现。如下面的代码片断所示，在一个Model类型为Contact数组的强类型View中，我们调用HtmlHelper<TModel>的扩展方法EditorFor将数组的前两个元素的相关信息以编辑模式呈现出来。

```c#
@model Contact[]
@Html.EditorFor(m => m[0].Name)
@Html.EditorFor(m => m[0].PhoneNo)
@Html.EditorFor(m => m[0].EmailAddress)
 
@Html.EditorFor(m => m[1].Name)
@Html.EditorFor(m => m[1].PhoneNo)
@Html.EditorFor(m => m[1].EmailAddress)
```

下面的XML片断代表了上面这段代码在最终生成的HTML中对应的6个类型为“text”的<input>元素，我们可以清楚地看到它们的名称被添加了[0]和[1]这样的索引前缀。如果这些元素存在于一个提交的标单中，并且目标Action方法包含一个匹配的Contact数组类型的参数，Model绑定系统将最终生成两个元素的Contact数组作为其参数值，数组中元素的顺序与索引数值保持一致。

```c#
<input  name="[0].Name" type="text" value="" .../> 
<input  name="[0].PhoneNo" type="text" value="" .../> 
<input  name="[0].EmailAddress" type="text" value="" .../> 
 
<input  name="[1].Name" type="text" value="" .../> 
<input  name="[1].PhoneNo" type="text" value="" .../> 
<input  name="[1].EmailAddress" type="text" value="" .../> 
```

基于数组的Model绑定采用“基零索引”，即将作为数组下边界的索引前缀必须是“[0]”。此外，还要求索引在数值上必须是连续的。举个简单的例子，假设提交的标单中具有如下6个类型为“hidden”的<input>元素，它们采用了基于索引的命名，并且从数字上看索引不是连续的（缺了一个[3]）。

```c#
<input name="[0]" type="hidden" value="foo" />
<input name="[1]" type="hidden" value="bar" />
<input name="[2]" type="hidden" value="baz" />
 
<input name="[4]" type="hidden" value="123" />
<input name="[5]" type="hidden" value="456" />
<input name="[6]" type="hidden" value="789" />   
```

如果提供的标单对应如下所示的Action方法，上述的<input>元素值将会绑定到字符串数组类型的参数array上。由于索引值不具有连续性，会导致后面的三个<input>元素值（“123”、“456”和“789”）会被丢弃，也就是说绑定后的array参数值仅仅具有三个元素（“foo”、“bar”和“baz”）。

```c#
public ActionResult Index(string[] array);
```

除了采用基零整数作为数组索引之外，我们还可以采用任意字符串作为其索引，但是作为索引的字符串需要和数组元素值一样存在于ValueProvider的数据源中。索引数据项名称为“index”，并且与数组元素数据项具有相同的前缀。同样以上面这个参数类型为字符串数组的Action方法为例，我们可以通过提交具有如下内容的表单来调用这个Action方法并为之提供相应的参数值。

```c#
<input name="index" type="hidden" value="first" />
<input name="index" type="hidden" value="second" />
<input name="index" type="hidden" value="third" />
 
<input name="[first]" type="text" value="foo" />
<input name="[second]" type="text" value="bar" />
<input name="[third]" type="text" value="baz" />
```

被提交标单中三个类型为“text”的<input>元素值将会绑定到目标Action方法的字符串参数array。它们通过基于字符串的索引进行命名，而作为索引的字符串通过类型为“hidden”的<input>元素和作为参数绑定的数据一并提交。这些用于定义索引字符串的<input>元素一并命名为“index”。

现在我们对用于模拟默认Model绑定的自定义DefaultModelBinder进行进一步完善，使之支持基于索引的数组绑定。如下的代码片断所示，我们在用于进行数组绑定的BindArrayModel方法中添加了额外的代码用于提取索引值（整型和字符串类型）列表，并且根据这行索引值生成相应的前缀和对应的Key通过ValueProvider得到针对数组元素的值。得到的值被添加到预先创建的对象列表中并最终成为作为参数值的数组对象的元素。

```c#
public class DefaultModelBinder
{
    //其他成员
    public object BindModel(Type parameterType, string prefix)
    {
        if (!this.ValueProvider.ContainsPrefix(prefix))
        {
            return null;
        }
 
        ModelMetadata modelMetadata = ModelMetadataProviders.Current.GetMetadataForType(() => null, parameterType);
        if (!modelMetadata.IsComplexType)
        {
            return this.ValueProvider.GetValue(prefix).ConvertTo(parameterType);
        }
        if (parameterType.IsArray)
        {
            return BindArrayModel(parameterType, prefix);
        }
        object model = CreateModel(parameterType);            
        foreach (PropertyDescriptor property in TypeDescriptor.GetProperties(parameterType))
        {                
            string key = string.IsNullOrEmpty(prefix) ? property.Name : prefix + "." + property.Name;
            property.SetValue(model, BindModel(property.PropertyType, key));
        }
        return model;
    }
 
    private object BindArrayModel(Type parameterType, string prefix)
    {
        List<object> list = new List<object>();
        if (!string.IsNullOrEmpty(prefix) && this.ValueProvider.ContainsPrefix(prefix))
        {
            IEnumerable enumerable = this.ValueProvider.GetValue(prefix).ConvertTo(parameterType) as IEnumerable;
            if (null != enumerable)
            {
                foreach (var value in enumerable)
                {
                    list.Add(value);
                }
            }
        }      
 
        bool numericIndex;
        IEnumerable<string> indexes = GetIndexes(prefix, out numericIndex);
        foreach (var index in indexes)
        {
            string indexPrefix = prefix + "[" + index + "]";
            if (!this.ValueProvider.ContainsPrefix(indexPrefix) && numericIndex)
            {
                break;
            }
            list.Add(BindModel(parameterType.GetElementType(), indexPrefix));
        }
        object[] array = (object[])Array.CreateInstance(parameterType.GetElementType(), list.Count);
        list.CopyTo(array);
        return array;
    }
    private IEnumerable<string> GetIndexes(string prefix, out bool numericIndex)
    { 
        string key = string.IsNullOrEmpty(prefix)?"index": prefix+"."+"index";
        ValueProviderResult result = this.ValueProvider.GetValue(key);
        if (null != result)
        {
            string[] indexes = result.ConvertTo(typeof(string[])) as string[];
            if (null != indexes)
            {
                numericIndex = false;
                return indexes;
            }
        }
        numericIndex = true;
        return GetZeroBasedIndexes();
    }
    private static IEnumerable<string> GetZeroBasedIndexes()
    {
        int iteratorVariable0 = 0;
        while (true)
        {
            yield return iteratorVariable0.ToString();
            iteratorVariable0++;
        }
    }    
}
```

索引列表的获取通过方法GetIndexes实现。由于作为索引值的数据项以“index”命名，所以该方法在此基础上加上传入的前缀作为key调用ValueProvider的GetValue方法可以直接得到针对指定前缀的所有字符串类型的索引值。而针对基零整数的索引列表则通过GetZeroBasedIndexes方法返回。

我们现在将自定义的DefaultModelBinder用于进行基于数组的Model绑定，在之前演示实例的基础上我们对Action方法作了如下的修改，使之具有一个Contact数组类型的参数。在该Action方法中，我们将作为数组元素的Contact对象相关信息呈现出来。对于通过GetValueProvider方法提供的NameValueCollectionValueProvider来说，我们以基零整数的方式提供了两个Contact对象的数据。

```c#
public class HomeController : Controller
{    
    //其他成员
    private IValueProvider GetValueProvider()
    {
        NameValueCollection requestData = new NameValueCollection();
 
        requestData.Add("[0].Name", "Foo");
        requestData.Add("[0].PhoneNo", "123456789");
        requestData.Add("[0].EmailAddress", "Foo@gmail.com");
 
        requestData.Add("[1].Name", "Bar");
        requestData.Add("[1].PhoneNo", "987654321");
        requestData.Add("[1].EmailAddress", "Bar@gmail.com");
 
        return new NameValueCollectionValueProvider(requestData, CultureInfo.InvariantCulture);
    }           
 
    public void Action(Contact[] contacts)
    {
        foreach (Contact contact in contacts)
        {
            Response.Write(string.Format("{0}: {1}<br/>", "Name", contact.Name));
            Response.Write(string.Format("{0}: {1}<br/>", "PhoneNo", contact.PhoneNo));
            Response.Write(string.Format("{0}: {1}<br/><br/>", "EmailAddress", contact.EmailAddress));
        }
    }
}
```

运行我们的程序之后会在浏览器中得到如下所示的输出结果，可见目标Action的数组参数通过我们自定义的DefaultModelBinder得到了正确地绑定。（S517）

```c#
Name: Foo
PhoneNo: 123456789
EmailAddress: Foo@gmail.com
 
Name: Bar
PhoneNo: 987654321
EmailAddress: Bar@gmail.com
```

上面这个例子演示了针对基零整数作为索引的数组绑定，DefaultModelBinder同样支持针对任意字符串作为索引的数组绑定。在下面的代码片断中，我们修改了GetValueProvider方法使创建的NameValueCollectionValueProvider以字符串索引的方式为Contact数组提供数据。程序运行之后，我们可以在浏览器中得到相同的输出结果。

```c#
public class HomeController : Controller
{
    //其他成员
    private IValueProvider GetValueProvider()
    {
        NameValueCollection requestData = new NameValueCollection();
        requestData.Add("index", "first");
        requestData.Add("index", "second");
 
        requestData.Add("[first].Name", "Foo");
        requestData.Add("[first].PhoneNo", "123456789");
        requestData.Add("[first].EmailAddress", "Foo@gmail.com");
 
        requestData.Add("[second].Name", "Bar");
        requestData.Add("[second].PhoneNo", "987654321");
        requestData.Add("[second].EmailAddress", "Bar@gmail.com");
 
        return new NameValueCollectionValueProvider(requestData, CultureInfo.InvariantCulture);
    }
}
```









