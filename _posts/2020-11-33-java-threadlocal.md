---
layout: post
title:  "ThreadLocal"
date:   2020-11-33 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

`ThreadLocal` 个人理解，有一个独立的空间，在线程之外的，它是线程安全的集合，可以解决多线程并发的问题，例如下面的例子


























```java
package ThreadLocal;

class Message{
	private String info;
	public void setInfo(String info) {
		this.info = info;
	}
	public String getInfo() {
		return info;
	}
}
class Channel{
	private static final ThreadLocal<Message> THREADLOCAL = new ThreadLocal<Message>();
	public static void setMessage(Message m) {
		THREADLOCAL.set(m);  // 向ThreadLocal中保存数据
	}
	public static void send() {
		System.out.println("["+Thread.currentThread().getName()+"消息发送]"+THREADLOCAL.get().getInfo());
	}
}
public class ThreadLocalDemo {
	public static void main(String[]args) throws Exception{
		Message msg = new Message();

		new Thread(()->{
			msg.setInfo("AAAAAAAAAA");
			Channel.setMessage(msg);	
			Channel.send();
		},"消息A").start();  
		
		new Thread(()->{
			msg.setInfo("BBBBBBBBBBB");
			Channel.setMessage(msg);
			Channel.send();
		},"消息B").start();

		new Thread(()->{
			msg.setInfo("CCCCCCCCCCCC");
			Channel.setMessage(msg);	
			Channel.send();
		},"消息C").start();
	}
}
```

输出如下

```
[消息B消息发送]BBBBBBBBBBB
[消息A消息发送]BBBBBBBBBBB
[消息C消息发送]CCCCCCCCCCC
```








 



