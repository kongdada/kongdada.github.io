---
title: 在Spring中创建切面，通过切面引入新功能-使用配置XML
date: 2018-11-14 10:58:37
tags: [Java, Spring, XML]
categories: Spring
---
上一篇博客中记录了使用Java注解方式开发一个切面的小例子，这一篇记录使用XML配置的方式开发一个切面的例子，同时也完成通过配置XML新增功能。
<!-- more -->

#### 实现切面
##### 定义特定的方法
- 首先定一个接口
```
package aopXML;

public interface Performance {
    void perform();
}
```
- 实现这个接口，定义一个叫演出的方法
```
package aopXML;

public class PerformanceImpl implements Performance {
    @Override
    public void perform() {
        System.out.println("演出～～～");
    }
}
```
##### 定义一个切面
```
package aopXML;

public class Audience {
    public void silencePhone() {
        System.out.println("手机静音！");
    }

    public void takeSeats() {
        System.out.println("请坐！");
    }

    public void applause() {
        System.out.println("表演结束，鼓掌！！！");
    }

    public void demanRefund() {
        System.out.println("表演失败，退票！！！");
    }
}
```
##### 将切面跟特定方法联系起来
这一次采用配置XML的方式来开发；这个文件叫SpringAOP.xml
定义切点，其实就是指定那个特定方法
定义通知，其实就是通知对应的方法在特定方法前还是后调用，或者是特定方法调用成功或者出现异常
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
        http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop-4.2.xsd">

    <bean id="audience" class="aopXML.Audience" />
    <bean id="Performance" class="aopXML.PerformanceImpl" />

    <aop:config>
        <!-- 这是定义一个切面，切面是切点和通知的集合-->
        <aop:aspect id="do" ref="audience">
            <!-- 定义切点 ，后面是expression语言，表示包括该接口中定义的所有方法都会被执行-->
            <aop:pointcut id="point" expression="execution(* aopXML.Performance.perform(..)))" />
            <!-- 定义通知 -->
            <aop:before method="silencePhone" pointcut-ref="point" />
            <aop:before method="takeSeats" pointcut-ref="point" />
            <aop:after-returning method="applause" pointcut-ref="point" />
            <aop:after-throwing method="demanRefund" pointcut-ref="point" />
        </aop:aspect>
    </aop:config>

</beans>
```
##### 单元测试
```
package aopXML;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:SpringAOP.xml")
public class PerformanceTest {

    @Autowired
    private Performance performance;

    @Test
    public void test() {
        performance.perform();
    }
}
```
输出结果：
```
手机静音！
请坐！
演出～～～
表演结束，鼓掌！！！
```
#### 新加功能
##### 定义新加功能
- 定义功能接口
```
package aopXML;

public interface Encoreable {
    void performEncore();
}
```
- 实现功能
```
package aopXML;

public class EncoreableImpl implements Encoreable {
    @Override
    public void performEncore() {
        System.out.println("返场表演～～～");
    }
}
```
##### 将新加的功能与特定方法联系起来
修改SpringAOP.xml
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xmlns:aop="http://www.springframework.org/schema/aop" xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans-4.2.xsd
        http://www.springframework.org/schema/aop
        http://www.springframework.org/schema/aop/spring-aop-4.2.xsd">

    <bean id="audience" class="aopXML.Audience" />
    <bean id="Performance" class="aopXML.PerformanceImpl" />
    <bean id="Encoreable" class="aopXML.EncoreableImpl" />

    <aop:config>
        <!-- 这是定义一个切面，切面是切点和通知的集合-->
        <aop:aspect id="do" ref="audience">
            <!-- 定义切点 ，后面是expression语言，表示包括该接口中定义的所有方法都会被执行-->
            <aop:pointcut id="point" expression="execution(* aopXML.Performance.perform(..)))" />
            <!-- 定义通知 -->
            <aop:before method="silencePhone" pointcut-ref="point" />
            <aop:before method="takeSeats" pointcut-ref="point" />
            <aop:after-returning method="applause" pointcut-ref="point" />
            <aop:after-throwing method="demanRefund" pointcut-ref="point" />
            <aop:declare-parents types-matching="aopXML.Performance+" implement-interface="aopXML.Encoreable" default-impl="aopXML.EncoreableImpl"/>
        </aop:aspect>
    </aop:config>

</beans>
```
- aop:declare-parents 使用这个标签将新加功能与特定方法联系在一起；
- types-matching="aopXML.Performance+" 为所有实现Performance接口的类的父类增加新功能；
- implement-interface 新加功能对应着的接口；
- default-impl 新加功能接口的实现；

##### 单元测试
```
package aopXML;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:SpringAOP.xml")
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
输出结果：
```
手机静音！
请坐！
演出～～～
表演结束，鼓掌！！！
+++++++++++++++++++++++++++++++++++
返场表演～～～
```