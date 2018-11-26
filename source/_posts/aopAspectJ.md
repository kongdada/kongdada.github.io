---
title: 在Spring中创建切面，使用AspectJ
date: 2018-11-19 15:45:47
tags: [Java, Spring, AspectJ]
categories: Spring
---
看了网上一些AspectJ的例子，大多一塌糊涂。说完这句话有点慌张，如果后续在学习中发现是我错了，再来打脸也不迟。
说说我的理解，目前我所学习到的实现AOP(切面)的方式大致可以分为两类，SpringAOP与AspectJ.关于SpringAOP的实现前两篇文章已经写过小例子了，欢迎查看。这篇用AspectJ实现AOP的小例子。代码配置都很细节，新手记录文。
<!-- more -->
#### 定义一个表演方法
- 定义接口
```
package aopAspectJ;

public interface Performance {
    String perform();
}
```
- 实现具体方法
```
package aopAspectJ;

public class PerformanceImpl implements Performance {
    @Override
    public String perform() {
        try {
            System.out.println("演出～～～");
        } catch (Exception e) {
            throw e;
        }
        return new String("嗒嗒嗒");
    }
}
```
#### 定义一个切面，实现各种通知
```
package aopAspectJ;

public aspect Audience {

    pointcut perFormance(): execution(* aopAspectJ.Performance.perform(..));

    before(): perFormance(){
        System.out.println("表演前：手机静音！");
    }

    before(): perFormance(){
        System.out.println("表演前：请坐！");
    }

    after(): perFormance(){
        System.out.println("表演后：鼓掌！！！");
    }

    after()returning(String str): perFormance(){
        System.out.println("调用成功，表演很精彩，鼓掌！！！");
    }

    after()throwing(Exception e): perFormance(){
        System.out.println("调用失败，表演失败，退票！！！");
    }
}
```
#### 需要一些特殊的配置
##### 运行时的上下文:SpringAopAspectJ.xml
```
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.springframework.org/schema/beans http://www.springframework.org/schema/beans/spring-beans.xsd">

    <bean id="performance" class="aopAspectJ.PerformanceImpl" />
</beans>
```
##### pom.xml要添加的依赖
```
        <!--learnAOP-->
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

        <!--AspectJ-->
            <dependency>
                <groupId>org.aspectj</groupId>
                <artifactId>aspectjrt</artifactId>
                <version>1.8.6</version>
            </dependency>
            <dependency>
                <groupId>org.aspectj</groupId>
                <artifactId>aspectjtools</artifactId>
                <version>1.8.6</version>
            </dependency>

```
##### 设置IDEA的编译方式
- 将编译方式修改为Ajc
- 在你的本地仓库中找到aspectjtools-1.8.6.jar这个包，路径配置：Path to Ajc compiler
![](/images/aopAspectJ.png)
#### 单元测试
- 代码：
```
package aopAspectJ;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;

@RunWith(SpringJUnit4ClassRunner.class)
@ContextConfiguration(locations = "classpath:SpringAopAspectJ.xml")
public class PerformanceImplTest {

    @Autowired
    private Performance performance;
    @Test
    public void perform() {
        performance.perform();
    }
}
```
- 结果：
```
表演前：手机静音！
表演前：请坐！
演出～～～
表演后：鼓掌！！！
调用成功，表演很精彩，鼓掌！！！
```
#### 后记
##### 我的理解
关于AOP的小例子写了三个，关于切面，切点，通知的定义，这个网上已经很多了不赘述。希望通过三个小例子，可以为你理清一点头绪，确定一下几点：
- AOP的实现分两大类SpringAOP和AspectJ;
- SpringAOP的代码实现可以使用注解方式，也可以使用配置XML的方式；
- 注解与XML方式，其实可以理解成利用不同的写法把这个特定的方法和这些通知组织起来，联系起来。
##### 看过的好文章
最后一部分提供两篇我看过的，很好的文章，希望对你也有所启迪。
- AOP1
[这篇很简明的说明了SpringAOP与AspectJ的区别](https://www.jianshu.com/p/fe8d1e8bd63e)
- AOP2
[这是一篇从AOP起源讲到不同实现的文章，几乎覆盖了我这篇，但我这是个完整例子。](https://blog.csdn.net/javazejian/article/details/56267036)

##### 我的代码
- 整个工程代码在下面的链接中，如果需要可以下载看一看。
- [点击跳转到我的GitHub](https://github.com/kongdada/learnSpring)