---
layout: post
title:  "synchronized"
date:   2020-11-29 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在进行多线程开发的过程中，多个线程抢占同一资源，经常会出现串数据的情况，使用`synchronized`能有效进行数据同步

























```java
package SynchronizedPackage;
class Message{
	private String title;
	private String content;
	public synchronized void set(String title,String content) {
		this.title = title;
		try {
			Thread.sleep(100);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		this.content = content;
	}
	public synchronized String get() {
		try {
			Thread.sleep(10);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		return this.title + " - " + this.content;
	}
}
public class SynchronizedDemo {
	public static void main(String[] args) throws Exception{
		Message msg = new Message();
		new Thread(new Producer(msg)).start();
		new Thread(new Consumer(msg)).start();
	}
}
class Producer implements Runnable{
	private Message msg;
	public Producer(Message msg) {
		this.msg=msg;
	}
	@Override
	public void run() {
		for(int i=0;i<100;i++) {
			if(i%2==0) {
				msg.set("王建","宇宙大帅哥");
			}else {
				msg.set("小高", "猥琐第一人");
			}
		} 
	}
}
class Consumer implements Runnable{
	private Message msg;
	public Consumer(Message msg) {
		this.msg=msg;
	}
	@Override
	public void run() {
		for(int i=0;i<100;i++) {
			System.out.println(msg.get());	
		}
	}
}
```

`Producer`类为生产者，产生`Message`类的数据，`Consumer`为消费者，输出`Message`的数据，当我们在`Message`类的get方法和set方法使用synchronized修饰时，才不会串数据，输出如下
```
王建 - 宇宙大帅哥
小高 - 猥琐第一人
小高 - 猥琐第一人
王建 - 宇宙大帅哥
小高 - 猥琐第一人
```












