---
layout: post
title:  "死锁"
date:   2020-11-28 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在进行多线程开发的过程中，使用`synchronized`处理线程同步，如果过多使用此关键字，会导致线程死锁，当然实际开发中，线程死锁可能是偶发性的，下面我们使用一个简单的例子来稍微说明一下这个问题。



























```java
package Dead;

public class DeadLock implements Runnable{
	private Jian jj = new Jian();
	private XiaoQiang xq = new XiaoQiang();
	@Override
	public void run() {
		jj.say(xq);
	}
	public DeadLock() {
		new Thread(this).start();
		xq.say(jj);
	}
	public static void main(String[] args) {
		new DeadLock();
	}
}
class Jian{
	public synchronized void say(XiaoQiang xq) {
		System.out.println("阿键说：此路是我开，要想从此过，留下10块钱");
		xq.get();
	}
	public synchronized void get() {
		System.out.println("阿键说：得到了10块钱，可以买饭吃了，于是让出路");
	}
}
class XiaoQiang{
	public synchronized void say(Jian jj) {
		System.out.println("小强说：让我先跑，我在给你钱");
		jj.get();
	}
	public synchronized void get() {
		System.out.println("小强说：逃过一劫，可以继续送快餐");
	}
}

```

输出如下
```
小强说：让我先跑，我在给你钱
阿键说：此路是我开，要想从此过，留下10块钱
```

此线程死锁的原因，是因为都在等待，`XiaoQiang`类中的方法say等着`Jian`类中的get释放资源，同样的对方也在等待释放资源，所以造成死锁。此时，如果吧`XiaoQiang`的方法get去掉`synchronized`，或者把`Jian`的方法say去掉`synchronized`，都不会有死锁了












