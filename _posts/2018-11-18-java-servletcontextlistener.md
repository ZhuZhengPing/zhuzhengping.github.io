---
layout: post
title:  "ServletContextListener使用详解"
date:   2018-11-18 16:32:18 +0800
categories: ServletContextListener
tags: java
author: Zhengping Zhu
---

* content
{:toc}

## 概念

在 Servlet API 中有一个 ServletContextListener 接口，它能够监听 ServletContext 对象的生命周期，实际上就是监听 Web 应用的生命周期。





















当Servlet 容器启动或终止Web 应用时，会触发ServletContextEvent 事件，该事件由ServletContextListener 来处理。在 ServletContextListener 接口中定义了处理ServletContextEvent 事件的两个方法。

```java
/**
 * 当Servlet 容器启动Web 应用时调用该方法。在调用完该方法之后，容器再对Filter 初始化，
 * 并且对那些在Web 应用启动时就需要被初始化的Servlet 进行初始化。
 */
contextInitialized(ServletContextEvent sce) 


/**
 * 当Servlet 容器终止Web 应用时调用该方法。在调用该方法之前，容器会先销毁所有的Servlet 和Filter 过滤器。
 */
contextDestroyed(ServletContextEvent sce)
```

下面通过两个具体的例子来介绍 ServletContextListener 的用法。

### 例一：在服务启动时，将数据库中的数据加载进内存，并将其赋值给一个属性名，其它的 Servlet 就可以通过 getAttribute 进行属性值的访问。


有如下两个步骤：

1.ServletContext 对象是一个为整个 web 应用提供共享的内存，任何请求都可以访问里面的内容

2.如何实现在服务启动的时候就动态的加入到里面的内容：我们需要做的有：  

1) 实现 servletContextListerner 接口 并将要共享的通过 setAttribute （ name,data ）方法提交到内存中去  
2) 应用项目通过 getAttribute(name) 将数据取到 。

```java
public class ServletContextLTest implements ServletContextListener{ 

    // 实现其中的销毁函数
    
    public void contextDestroyed(ServletContextEvent sce) { 

        System.out.println("this is last destroyeed");    

    } 

    // 实现其中的初始化函数，当有事件发生时即触发

    public void contextInitialized(ServletContextEvent sce) { 

        ServletContext sct=sce.getServletContext(); 

        Map<Integer,String> depts=new HashMap<Integer,String>(); 

        Connection connection=null; 

        PreparedStatement pstm=null; 

        ResultSet rs=null; 

         

        try{ 

            connection=ConnectTool.getConnection(); 

            String sql="select deptNo,dname from dept"; 

            pstm=connection.prepareStatement(sql); 

            rs=pstm.executeQuery(); 

            while(rs.next()){ 

                depts.put(rs.getInt(1), rs.getString(2)); 

            } 

            // 将所取到的值存放到一个属性键值对中

            sct.setAttribute("dept", depts); 

            System.out.println("======listener test is beginning========="); 

        }catch(Exception e){ 

            e.printStackTrace(); 

        }finally{ 

            ConnectTool.releasersc(rs, pstm, connection); 
        } 
    } 
}
```

在完成上述编码后，仍需在 web.xml 中进行如下配置，以使得该监听器可以起作用。

```xml
<listener> 
    <listener-class>ServletContextTest.ServletContextLTest</listener-class>  
</listener>  
```

在完成上述配置后， web 服务器在启动时，会直接加载该监听器，通过以下的应用程序就可以进行数据的访问。

```java
public class CreateEmployee extends HttpServlet{ 

    @Override 

    protected void service(HttpServletRequest request, HttpServletResponse response) 

            throws ServletException, IOException { 

        ServletContext sct=getServletConfig().getServletContext(); 

        // 从上下文环境中通过属性名获取属性值

        Map<Integer,String> dept=(Map<Integer,String>)sct.getAttribute("dept"); 

        Set<Integer> key=dept.keySet(); 

        response.setContentType("text/html;charset=utf-8"); 

        PrintWriter out=response.getWriter(); 

        out.println("<html>"); 

        out.println("<body>"); 

        out.println("<form action='/register' action='post'>"); 

        out.println("<table alignb='center'>"); 

        out.println("<tr>"); 

        out.println("<td>"); 

        out.println("username:"); 

        out.println("</td>"); 

        out.println("<td>"); 

        out.println("<input type='text' name='username'"); 

        out.println("</tr>"); 

        out.println("<tr>"); 

        out.println("<td>"); 

        out.println("city:"); 

        out.println("</td>"); 

        out.println("<td>"); 

        out.println("<select name='dept'"); 

        for(Integer i:key){ 

            out.println("<option value='"+i+"'>"+dept.get(i)+"</option>"); 

        } 

        out.println("</select>"); 

        out.println("</td>"); 

        out.println("<tr>"); 

        out.println("</table>"); 

        out.println("</form>"); 

        out.println("</body>"); 

        out.println("</html>"); 

        out.flush(); 

    } 

}
```

### 例二：书写一个类用于统计当Web 应用启动后，网页被客户端访问的次数。如果重新启动Web 应用，计数器不会重新从1 开始统计访问次数，而是从上次统计的结果上进行累加。

在实际应用中，往往需要统计自Web 应用被发布后网页被客户端访问的次数，这就要求当Web 应用被终止时，计数器的数值被永久存储在一个文件中或者数据库中，等到Web 应用重新启动时，先从文件或数据库中读取计数器的初始值，然后在此基础上继续计数。

向文件中写入或读取计数器的数值的功能可以由自定义的 MyServletContextListener 类来完成，它具有以下功能：

1) 在 Web 应用启动时从文件中读取计数器的数值，并把表示计数器的 Counter 对象存放到 Web应用范围内。存放计数器的文件的路径为helloapp/count/count.txt 。

2) 在Web 应用终止时把Web 应用范围内的计数器的数值保存到count.txt 文件中。

```java
public class MyServletContextListener implements ServletContextListener{

  public void contextInitialized(ServletContextEvent sce){

    System.out.println("helloapp application is Initialized.");

    // 获取 ServletContext 对象

    ServletContext context=sce.getServletContext();

    try{

       // 从文件中读取计数器的数值

       BufferedReader reader=new BufferedReader(

           new InputStreamReader(context.

           getResourceAsStream("/count/count.txt")));

       int count=Integer.parseInt(reader.readLine());

       reader.close();

       // 创建计数器对象

       Counter counter=new Counter(count);

       // 把计数器对象保存到 Web 应用范围

       context.setAttribute("counter",counter);

       } catch(IOException e) {

          e.printStackTrace();

       }

   }

   public void contextDestroyed(ServletContextEvent sce){

       System.out.println("helloapp application is Destroyed.");

       // 获取 ServletContext 对象

       ServletContext context=sce.getServletContext();

       // 从 Web 应用范围获得计数器对象

       Counter counter=(Counter)context.getAttribute("counter");

       if(counter!=null){

       try{

          // 把计数器的数值写到 count.txt 文件中

          String filepath=context.getRealPath("/count");

          filepath=filepath+"/count.txt";

          PrintWriter pw=new PrintWriter(filepath);

          pw.println(counter.getCount());

          pw.close();

         } catch(IOException e) {

             e.printStackTrace();

         }
     }
   }
}
```

将用户自定义的 MyServletContextListener 监听器在 Servlet 容器进行注册， Servlet 容器会在启动或终止 Web 应用时，会调用该监听器的相关方法。在 web.xml 文件中， <listener> 元素用于向容器注册监听器：

```xml
<listener>
     <listenerclass>
         ServletContextTest.MyServletContextListener
     <listener-class/>
</listener>     
```

通过上述两个例子，即可以非常清楚的了解到 ServletContextListener 接口的使用方法及技巧。

在Container 加载Web 应用程序时（例如启动 Container 之后），会呼叫contextInitialized() ，而当容器移除Web 应用程序时，会呼叫contextDestroyed () 方法。

通过 Tomcat 控制台的打印结果的先后顺序，会发现当 Web 应用启动时，Servlet 容器先调用contextInitialized() 方法，再调用lifeInit 的init() 方法；

当Web 应用终止时，Servlet 容器先调用lifeInit 的destroy() 方法，再调用contextDestroyed() 方法。

由此可见，在Web 应用的生命周期中，ServletContext 对象最早被创建，最晚被销毁。

### 启动线程

```java
public class DSAction extends Thread implements ServletContextListener {

    public void contextInitialized(ServletContextEvent arg0) {
        
        super.start();// 启动一个线程
    }
    public void zdfs() throws IOException {

        Huoquzhuye u = new Huoquzhuye();// 爬虫方法类
        Htmlneirong h = new Htmlneirong();// 存入数据库类
        List<String> list = u.seturl("http://xxxxxxx");
        for (int i = 0; i < list.size(); i++) {
            String txt = list.get(i).substring(0, 22);
            String start = list.get(i).substring(4, 14);
            String end = list.get(i).substring(22, list.get(i).length());
            try {
                h.seturl(txt, start, end);
            } catch (ClassNotFoundException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (SQLException e) {

                e.printStackTrace();
            }
        }

    }

    @Override
    public void run() {
        while (true) {
            try {
                this.zdfs();
                super.sleep(1000 * 60 * 10);
            } catch (IOException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            } catch (InterruptedException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }
        }
    }

    /*
     * (non-Javadoc)
     * 
     * @see javax.servlet.ServletContextListener#contextDestroyed(javax.servlet.
     * ServletContextEvent)
     */


    /*
     * (non-Javadoc)
     * 
     * @see
     * javax.servlet.ServletContextListener#contextInitialized(javax.servlet
     * .ServletContextEvent)
     */

    public void contextDestroyed(ServletContextEvent arg0) {
        super.stop();// 停止线程

    }
}
```

```xml
<listener>
   <listener-class>bj.hbj.dingshi.DSAction</listener-class>
</listener>
```

1、调用super.start()开启线程。

2、最后关闭线程super.stop()。




