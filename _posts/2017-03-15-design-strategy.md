---
layout: post
title:  "策略模式"
date:   2017-03-15 16:32:18 +0800
categories: .net
tags: design
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在策略模式（Strategy Pattern）中，一个类的行为或其算法可以在运行时更改。这种类型的设计模式属于行为型模式。
在策略模式中，我们创建表示各种策略的对象和一个行为随着策略对象改变而改变的 context 对象。策略对象改变 context 对象的执行算法。











#### 实现

我们将创建一个定义活动的 Strategy 接口和实现了 Strategy 接口的实体策略类。Context 是一个使用了某种策略的类。
StrategyPatternDemo，我们的演示类使用 Context 和策略对象来演示 Context 在它所配置或使用的策略改变时的行为变化。

<img src="http://www.runoob.com/wp-content/uploads/2014/08/strategy_pattern_uml_diagram.jpg" />

#### 步骤 1

创建一个接口。

```java
public interface Strategy {
   public int doOperation(int num1, int num2);
}
```

#### 步骤 2

创建实现接口的实体类。

*OperationAdd.java*

```java
public class OperationAdd implements Strategy{
   @Override
   public int doOperation(int num1, int num2) {
      return num1 + num2;
   }
}
```

*OperationSubstract.java*

```java
public class OperationSubstract implements Strategy{
   @Override
   public int doOperation(int num1, int num2) {
      return num1 - num2;
   }
}
```

*OperationMultiply.java*

```java
public class OperationMultiply implements Strategy{
   @Override
   public int doOperation(int num1, int num2) {
      return num1 * num2;
   }
}
```

#### 步骤 3

创建 Context 类。

*Context.java*

```java
public class Context {
   private Strategy strategy;

   public Context(Strategy strategy){
      this.strategy = strategy;
   }

   public int executeStrategy(int num1, int num2){
      return strategy.doOperation(num1, num2);
   }
}
```

#### 步骤 4

使用 Context 来查看当它改变策略 Strategy 时的行为变化

*StrategyPatternDemo.java*

```java
public class StrategyPatternDemo {
   public static void main(String[] args) {
      Context context = new Context(new OperationAdd());		
      System.out.println("10 + 5 = " + context.executeStrategy(10, 5));

      context = new Context(new OperationSubstract());		
      System.out.println("10 - 5 = " + context.executeStrategy(10, 5));

      context = new Context(new OperationMultiply());		
      System.out.println("10 * 5 = " + context.executeStrategy(10, 5));
   }
}
```

#### 步骤 5

验证输出

```
10 + 5 = 15
10 - 5 = 5
10 * 5 = 50
```


















