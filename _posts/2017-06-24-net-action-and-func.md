---
layout: post
title:  "泛型委托使用变体"
date:   2016-04-30 16:32:18 +0800
categories: .net
tags: .net 委托
author: Zhengping Zhu
---

* content
{:toc}

## 概念

下例演示如何在 Func 和 Action 泛型委托中使用协变和逆变，以便能够在代码中重用方法及提供更大的灵活性。









#### 使用具有协变类型参数的委托

下例展示了 Func 泛型委托中的协变支持带来的益处。 FindByTitle 方法获取 String 类型的参数，返回 Employee 类型的对象。 但是，您可以将此方法指派给 `Func<String, Person>` 委托（在 Visual Basic 中为 Func(Of String, Person)），因为 Employee 继承 Person。

```c#
// Simple hierarchy of classes.
public class Person { }
public class Employee : Person { }
class Program
{
    static Employee FindByTitle(String title)
    {
        // This is a stub for a method that returns
        // an employee that has the specified title.
        return new Employee();
    }

    static void Test()
    {
        // Create an instance of the delegate without using variance.
        Func<String, Employee> findEmployee = FindByTitle;

        // The delegate expects a method to return Person,
        // but you can assign it a method that returns Employee.
        Func<String, Person> findPerson = FindByTitle;

        // You can also assign a delegate 
        // that returns a more derived type 
        // to a delegate that returns a less derived type.
        findPerson = findEmployee;

    }
}
```

#### 使用具有逆变类型参数的委托

下例展示了 Action 泛型委托中的逆变支持带来的益处。 AddToContacts 方法获取 Person 类型的参数。 但是，您可以将此方法指派给 `Action<Employee>` 委托（在 Visual Basic 中为 (Action(Of Employee)），因为 Employee 继承 Person。

```c#
public class Person { }
public class Employee : Person { }
class Program
{
    static void AddToContacts(Person person)
    {
        // This method adds a Person object
        // to a contact list.
    }

    static void Test()
    {
        // Create an instance of the delegate without using variance.
        Action<Person> addPersonToContacts = AddToContacts;

        // The Action delegate expects 
        // a method that has an Employee parameter,
        // but you can assign it a method that has a Person parameter
        // because Employee derives from Person.
        Action<Employee> addEmployeeToContacts = AddToContacts;

        // You can also assign a delegate 
        // that accepts a less derived parameter to a delegate 
        // that accepts a more derived parameter.
        addEmployeeToContacts = addPersonToContacts;
    }
}
```












