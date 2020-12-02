---
layout: post
title:  "守护线程"
date:   2020-11-29 16:32:18 +0800
categories: java
tags: 线程
author: Zhengping Zhu
---

* content
{:toc}

## 概念

守护线程用的地方可能比较少，例如垃圾回收器GC，程序结束前都需要判定是否有可回收的垃圾

























```java
public class ThreadDemo {
	public static boolean flag = true;
	public static void main(String[] args) throws InterruptedException{
		Thread userThread = new Thread(()->{
			for(int i=0;i<10;i++) {
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println(Thread.currentThread().getName() + " 正在运行 、i="+i);
			}
		},"用户线程");
		
		Thread daemonThread = new Thread(()->{
			for(int i=0;i<Integer.MAX_VALUE;i++) {
				try {
					Thread.sleep(100);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				System.out.println(Thread.currentThread().getName() + " 正在运行 、i="+i);
			}
		},"守护线程");
		daemonThread.setDaemon(true);
		userThread.start();
		daemonThread.start();
	}
}
```

上面的代码执行结果如下，用户线程和守护线程同时开始，几乎同时结束。

```
用户线程 正在运行 、i=0
守护线程 正在运行 、i=0
用户线程 正在运行 、i=1
守护线程 正在运行 、i=1
用户线程 正在运行 、i=2
守护线程 正在运行 、i=2
用户线程 正在运行 、i=3
守护线程 正在运行 、i=3
用户线程 正在运行 、i=4
守护线程 正在运行 、i=4
用户线程 正在运行 、i=5
守护线程 正在运行 、i=5
用户线程 正在运行 、i=6
守护线程 正在运行 、i=6
用户线程 正在运行 、i=7
守护线程 正在运行 、i=7
用户线程 正在运行 、i=8
守护线程 正在运行 、i=8
用户线程 正在运行 、i=9

```












