---
title: 在Spring中使用注解创建切面，通过注解引入新功能
date: 2018-11-13 16:34:21
tags: [Java, Spring, 注解]
categories: Spring
---
最近在看《Spring实战》，在这儿使用注解完整的实现一个切面的例子，也实现通过注解引入新功能；
<!-- more -->
#### 实现切面

关于切面相关概念这篇不提，可以大致理解成，只要调用某个特定的方法，这个调用信息会被切面拦截，然后执行切面定义的逻辑，之后才能顺利的调用该方法。
我这个是一个maven项目所有代码写在同一个包下面，测试类除外。关于切面这个部分可能需要导入一些包。
pom.xml
```
        <dependency>
            <groupId>org.aspectj</groupId>
            <artifactId>aspectjweaver</artifactId>
            <version>1.8.9</version>
        </dependency>
        <dependency>
            <groupId>cglib</groupId>
            <artifactId>cglib</artifactId>
            <version>3.2.4</version>
        </dependency>
```

##### 定义特定的方法
- 首先定一个接口
```
package aopJavaConfig;

public interface Performance {
    public void perform();
}
```
- 实现这个接口，定义一个叫演出的方法
```
package aopJavaConfig;
import org.springframework.stereotype.Component;

@Component
public class PerformanceImpl implements Performance {
    @Override
    public void perform(){
        System.out.println("演出～～～");
    }
}
```

##### 定义一个切面，同时定义了切点和通知
```
package aopJavaConfig;
import org.aspectj.lang.annotation.*;

@Aspect
public class Audience {

    @Pointcut("execution(* aopJavaConfig.Performance.perform(..))")
    public void performance(){}

    @Before("performance()")
     public void silencePhone(){
        System.out.println("手机静音！");
    }

    @Before("performance()")
    public void takeSeats(){
        System.out.println("请坐！");
    }

    @AfterReturning("performance()")
    public void applause(){
        System.out.println("表演结束，鼓掌！！！");
    }

    @AfterThrowing("performance()")
    public void demanRefund(){
        System.out.println("表演失败，退票！！！");
    }
}

```
- @Aspect修饰的这个类是切面，我们可以在切面中定义切点和通知；
- @Pointcut修饰的是切点，可以看到切点就是我们之前定义的那个特定的方法；
- @Before修饰的方法会在定义的特定方法之前被调用；
- @AfterReturning修饰的方法会在特定方法被成功调用后执行；
- @AfterThrowing修饰的方法会在特定方法执行异常时被执行；

##### 定义一个配置类
这个配置类负责开启自动代理，并且将我们定义好的切面声明成Bean；
```
package aopJavaConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@EnableAspectJAutoProxy
@ComponentScan
public class ConcertConfig {

    @Bean
    public Audience audience(){
        return new Audience();
    }
}
```
至此，我们有两个bean，一个是那个特定的方法，一个是声明好的切面，那么我们就有一个很朴素的冲动，这样定义是否成功了呢，所以写一个测试类；
##### 测试切面定义是否成功
预期的结果：调用演出方法，在控制台打印出来演出之前要干嘛，演出成功后要干嘛；
具体的输出请查看代码本身；
```
package aopJavaConfig;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = ConcertConfig.class)
public class PerformanceTest {
    @Autowired
    private Performance performance;

    @Test
    public void test() {
        performance.perform();
    }
}
```
至此，使用java注解方式定义一个切面结束；

#### 引入新功能（DeclareParents）
接上文代码，当我们接受老代码，期望在原来的特定方法的基础上加一个功能，很朴素的想法就是修改原来的方法，加一段功能代码，但是假设现在老代码很复杂不得修改；那么为了增加这个功能，Spring提供了一个另一个实现方式。
##### 新功能代码
- 定义新接口
```
package aopJavaConfig;

public interface Encoreable {
    void performEncore();
}
```
- 实现这个接口
```
package aopJavaConfig;
import org.springframework.stereotype.Component;

@Component
public class EncoreableImpl implements Encoreable{
    @Override
    public void performEncore(){
        System.out.println("返场表演～～～");
    }
}
```
##### 将新功能引入原来特定方法形成的bean中
可以将bean看作一个对象，就是将这个新的方法加到特定的这个对象中，也就是让这个对象可以直接调用新加的方法；
```
package aopJavaConfig;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.DeclareParents;

@Aspect
public class EncoreableIntroducer {
    /**
     * 此注解可以将新加的接口引入到原来调用目标函数的bean中
     */
    @DeclareParents(value = "aopJavaConfig.Performance+", defaultImpl = EncoreableImpl.class)
    public static Encoreable encoreable;
}
```
##### 新加方法要告知Spring容器
修改配置类如下：
```
package aopJavaConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

@Configuration
@EnableAspectJAutoProxy
@ComponentScan
public class ConcertConfig {

    @Bean
    public Audience audience(){
        return new Audience();
    }

    @Bean
    public EncoreableIntroducer encoreableIntroducer(){
        return new EncoreableIntroducer();
    }
}

```
##### 测试类
预期结果：能够使用特定类的对象成功调用新加的方法；
```
package aopJavaConfig;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(classes = ConcertConfig.class)
public class PerformanceTest {
    @Autowired
    private Performance performance;

    @Test
    public void test() {
        performance.perform();
        System.out.println("+++++++++++++++++++++++++++++++++++");
        Encoreable encoreable = (Encoreable)performance;
        encoreable.performEncore();
    }
}
```
测试结果如下：
```
手机静音！
请坐！
演出～～～
表演结束，鼓掌！！！
+++++++++++++++++++++++++++++++++++
返场表演～～～
```
至此使用注解方式开发切面，切点，通知，新加方法都已经完成。代码经过了验证；
如有错误，还请指正。欢迎交流。