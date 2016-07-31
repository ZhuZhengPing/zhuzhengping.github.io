---
layout: post
title:  "对象序列化"
date:   2016-07-31 16:32:18 +0800
categories: .net
tags: .net 序列化
author: Zhengping Zhu
---

* content
{:toc}

## 概念

序列化描述了持久化一个对象的状态到流的过程。被持久化的数据次序包括所有以后需要来重建对象状态所必须的信息。使用这种技术，可以用最小花费保存海量的数据。





创建一个新的控制台程序,其中的 Radio 类被标记为 [Serializable]，除了一个成员变量(radioID)例外，它被标记为[NonSerialized]，因此 radioID 类将不会被持久化到指定的数据流中

```c#
[Serializable]
public class Radio
{
	public bool hasTweeters;
	public bool hasSubWoofers;
	public double[] stationPresets;

	[NonSerialized]
	public string radioID = "XF-552RR5";
}
```

接下来，添加另外两个类类型来表示 JamesBondCar 和 Car 基类。JamesBondCar 类和 Car 基类