---
layout: post
title:  "Object线程同步"
date:   2020-11-30 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

使用`synchronized`也能解决线程同步的问题，但是容易造成死锁，使用Object的wait方法以及notify方法能很好的解决线程同步的问题。
>* wait:在其他线程调用此对象的 notify() 方法或 notifyAll() 方法前，导致当前线程等待。
>* notify:唤醒在此对象监视器上等待的单个线程。












































```java
package ttt;

public class mydemo {
	public static void main(String[] args) throws Exception {
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
		for(int x=0;x<100;x++) {
			if(x%2==0) {
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
		for(int x=0;x<100;x++) {
			try {
				Thread.sleep(10);
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
			System.out.println(this.msg.get());
		}
	}
}
class Message{
	private String title;
	private String content;
	private boolean flag=true;   // 表示生产或消费的形式
	
	public synchronized void set(String title,String content) {
		if(this.flag == false) {
			try {
				super.wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		this.title=title;
		this.content=content;
		this.flag=false;	  // 已经生产过了
		super.notify();       // 唤醒等待的线程
	}
	public synchronized String get() {
		if(this.flag == true) {    // 还未生产 需要等待
			try {
				super.wait();
			} catch (InterruptedException e) {
				e.printStackTrace();
			}
		}
		
		try {
			Thread.sleep(10);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
		
		try {
			return this.title + " - " + this.content;
		}finally {
			this.flag=true;		// 继续生产
			super.notify();		// 唤醒等待线程
		}
	}
}
```

这里生产者每生产一项数据，则停止线程并等待消费者唤醒，消费者唤醒后，生产者再次生产一项数据，继续等待消费者唤醒，如此循环，则解决了线程同步的问题，输出如下

```
王建 - 宇宙大帅哥
小高 - 猥琐第一人
王建 - 宇宙大帅哥
小高 - 猥琐第一人
王建 - 宇宙大帅哥
```












