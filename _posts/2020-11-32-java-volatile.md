---
layout: post
title:  "volatile"
date:   2020-11-29 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

如果一个线程方法操作一个方法外的变量，要在线程工作内存里先读取，取得数据副本，加载、使用、赋值、存储、写入，使用`volatile`关键字，直接操作主内存中的变量，这样省去中间大部分副本操作，达到提高性能的目的。


























```java
package VolatilePackage;
class MyThread implements Runnable{
	private volatile int ticket=5;
	@Override
	public  void run() {
		while(this.ticket>0) {
			try {
				Thread.sleep(100);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			System.out.println(Thread.currentThread() + " 买票处理，ticket = "+this.ticket--);
		}
	}
}

public class VolatileDemo {
	public static void main(String[] args) {
		MyThread mt = new MyThread();
		new Thread(mt,"票贩子A").start();
		new Thread(mt,"票贩子B").start();
		new Thread(mt,"票贩子C").start();
	}
}
```

`volatile`不能解决线程同步的问题，要解决线程同步的问题，还是可以使用`synchronized`关键字

```
Thread[票贩子A,5,main] 买票处理，ticket = 5
Thread[票贩子A,5,main] 买票处理，ticket = 4
Thread[票贩子A,5,main] 买票处理，ticket = 3
Thread[票贩子A,5,main] 买票处理，ticket = 2
Thread[票贩子A,5,main] 买票处理，ticket = 1
```








 



