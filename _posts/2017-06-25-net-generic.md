---
layout: post
title:  "深入理解 C# 协变和逆变"
date:   2017-06-25 16:32:18 +0800
categories: .net
tags: .net 泛型
author: Zhengping Zhu
---

* content
{:toc}

## 概念

msdn 解释如下：

“协变”是指能够使用与原始指定的派生类型相比，派生程度更大的类型。

“逆变”则是指能够使用派生程度更小的类型。

解释的很正确，大致就是这样，不过不够直白。

直白的理解：

“协变”->”和谐的变”->”很自然的变化”->string->object :协变。

“逆变”->”逆常的变”->”不正常的变化”->object->string 逆变。






上面是个人对协变和逆变的理解，比起记住那些派生，类型，原始指定,更大，更小之类的词语，个人认为要容易点。

为了演示协变和逆变，以及之间的区别，请创建控制台程序CAStudy，手动添加两个类：

```c#
public abstract class Animal{}

public class Dog:Animal{}
```

因为是演示，所以都是个空类，

只是有一点记住Dog 继承自Animal,

所以Dog变成Animal 就是和谐的变化(协变),而如果Animal 变成Dog就是不正常的变化(逆变)

在Main函数中输入：

```c#
public static void Main()
{
	Dog aDog = new Dog();
	Animal aAnimal = aDog;
	
	List<Dog> lstDogs = new List<Dog>();
	List<Animal> lstAnimal = lstDogs;
}
```

因为Dog继承自Animal，所以Animal aAnimal = aDog; aDog 会隐式的转变为Animal.

但是List<Dog> 不继承List<Animal> 

如果想要转换的话，应该使用下面的代码：

```c#
List<Animal> lstAnimal2 = lstDogs.Select(d => (Animal)d).ToList();
```

可以看到一个lstDogs 变成lstAnimal 是多么复杂的操作了。

正因如此，所以微软新增了两个关键字：Out,In,

协变的英文是：“covariant”，逆变的英文是：“Contravariant”

为什么Microsoft选择的是”Out” 和”In” 作为特性而不是它们呢？

我个人的理解：

因为协变和逆变的英文太复杂了，并没有体现协变和逆变的不同，但是out 和 in 却很直白。

out: 输出(作为结果),in:输入(作为参数)

所以如果有一个泛型参数标记为out,则代表它是用来输出的，只能作为结果返回，而如果有一个泛型参数标记为in,则代表它是用来输入的，也就是它只能作为参数。

目前out 和in 关键字只能在接口和委托中使用，微软使用out 和 in 

和刚开始说的一样，T 用out 标记，所以T代表了输出，也就是只能作为结果返回。

```c#
public static void Main()
{
    Dog aDog = new Dog();
    Animal aAnimal = aDog;

    List<Dog> lstDogs = new List<Dog>();
    //List<Animal> lstAnimal = lstDogs;
    List<Animal> lstAnimal2 = lstDogs.Select(d => (Animal)d).ToList();
    IEnumerable<Dog> someDogs = new List<Dog>();
    IEnumerable<Animal> someAnimals = someDogs;
}
```

因为T只能做结果返回，所以T不会被修改， 编译器就可以推断下面的语句强制转换合法，所以`IEnumerable<Animal> someAnimals = someDogs;`可以通过编译器的检查，

虽然通过了C#编译器的检查，但是il 并不知道协变和逆变，还是得乖乖的强制转换。

在这里我看到了这句话：

`IEnumerable<Animal> enumerable2 = (IEnumerable<Animal>) enumerable1;`

那么是不是可以`List<Animal> lstAnimal3 = (List<Animal>)lstDogs;` 呢？

想要回答这个问题需要在回头看看Clr via C# 关于泛型和接口的章节了，我就不解释了，

答案是不可以。

上面演示的是协变，接下来要演示下逆变。

为了演示逆变，那么就要找个in标记的接口或者委托了，最简单的就是：

```c#
public delegate void Action<int T>(T obj);
```

在Main函数中添加：

```c#
Action<Animal> actionAnimal = new Action<Animal>(a => {/*让动物叫*/ });
Action<Dog> actionDog = actionAnimal;
actionDog(aDog);
```

很明显actionAnimal 是让动物叫，因为Dog是Animal，那么既然Animal 都能叫，Dog肯定也能叫。

In 关键字：逆变，代表输入，代表着只能被使用，不能作为返回值，所以C#编译器可以根据in关键字推断这个泛型类型只能被使用，所以`Action<Dog> actionDog = actionAnimal;`可以通过编译器的检查。

再次演示Out关键字：

添加两个类：

```c#
public interface IMyList<out T>
{
    T GetElement();
}

public class MyList<T> : IMyList<T>
{
    public T GetElement()
    {
        return default(T);
    }
}
```

因为out 关键字，所以下面的代码可以通过编译

```c#
IMyList<Dog> myDogs = new MyList<Dog>();

IMyList<Animal> myAnimals = myDogs;
```

将上面的两个类修改为：

```c#
public interface IMyList<out T>
{
    T GetElement();
    void ChangeT(T t);
}

public class MyList<T> : IMyList<T>
{
    public T GetElement()
    {
        return default(T);
    }
 
    public void ChangeT(T t)
    {
        //Change T
    }
}
```

因为T被out修饰，所以T只能作为参数。

同样修改两个类如下：

```c#
public interface IMyList<in T>
{
    T GetElement();
    void ChangeT(T t);
}

public class MyList<T> : IMyList<T>
{
    public T GetElement()
    {
        return default(T);
    }

    public void ChangeT(T t)
    {
        //Change T
    }
}
```

这一次使用in关键字。

因为用in关键字标记，所以T只能被使用，不能作为返回值。
 
最后修改代码为：

```c#
public interface IMyList<in T>
{
    void ChangeT(T t);
}

public class MyList<T> : IMyList<T>
{
    public void ChangeT(T t)
    {
        //Change T
    }
}
```

编译成功，因为in代表了逆变，所以

```c#
IMyList<Animal> myAnimals = new MyList<Animal>();

IMyList<Dog> myDogs = myAnimals;
```







