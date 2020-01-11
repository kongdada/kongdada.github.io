---
title: 前端json传参，后端spring如何承接
date: 2020-01-11 15:27:55
tags: [Java, Spring]
categories: Spring
---
第一篇公众号就讲个很简单的问题吧。前些天重构中前端传过来的参数突然就接受不到了。究其根本就是前端同学统一换了参数的提交格式，从 application/x-www-form-urlencoded 更换成 application/json。一句话解释本文就是 application/json 需要搭配 @RequestBody 使用。
<!-- more -->

#### 一点点唠叨
一直在想第一篇文章应该写什么，写点最近踩得坑还是最近学的东西还是工作内容，生活感悟，一时间无从下手。同时距离上一篇博客过去了已经 8 个月了，上一篇还是在从老东家走了之后的总结和一些感想。现在想来自己还是不能跳出这个循环，被社会毒打，要奋发图强，然后再回归正常生活，再变成一个懒鬼。但是被毒打之后还是会留给你一点点的启发的，比如开始点源码的技能树，也比如更加有一些危机感。做新手程序员，最好的成长之路还是大量的写代码，大量的阅读业务代码，不懂就问问同事。努力承担更多的责任，干更多事情，必然会成长的。这叫干好自己的工作，理解自己的业务。然后再开始思考学点新东西。如果不知道学什么就从 JDK 源代码开始吧，然后学习缓存 Redis，再来一个中间件 kafka。如果这几个东西都学会怎么使用了，运行机制是怎样的，再看看源码是怎么实现的。这就比很多人都强了，也不着急一步一步来吧。

#### 正文
第一篇公众号就讲个很简单的问题吧。前些天重构中前端传过来的参数突然就接受不到了。究其根本就是前端同学统一换了参数的提交格式，从 application/x-www-form-urlencoded 更换成 application/json。一句话解释本文就是 application/json 需要搭配 @RequestBody 使用。
前端 json 传参，后端 spring 如何承接
前端使用 application/json 传参，分两部分 post 请求和 get 请求，因为这两个不太一样。

##### POST
针对 post 请求，后端必须使用@RequestBody 修饰你自定义的实体。
修饰自定义的一个实例来接受：例如 BaseDTO，即使只有一个字段也必须写成一个自定义对象；spring 才能将前端传来的参数转化进我们的对象。这儿强调一点，包装类例如：Long Integer  也必须再包一层，就是把这些包装类放在一个自定义实体中。
```
    @RequestMapping("/demo/c")
    public String cDemo(@RequestBody Demo demo) {
        return JSON.toJSONString(demo);
    }
备注：post请求，参数放在Request body中
```

修饰一个 MAP<String, Object>，这样也能正确接收到前端传来的参数，但是使用起来还要通过字段名来获取，比较麻烦。但是，有一些场景很好用，例如不确定前端要传几个参数时，这种写法就派上了用场，不论前端传多少参数，统统接收就好。
 ```
    @RequestMapping("/demo/a")
    public String aDemo(@RequestBody Map<String, Object> map) {
        return JSON.toJSONString(map);
    }
 备注：post请求，参数放在Request body中
 ```

##### GET
1.  针对 get 请求，一般来说 get 请求会将参数拼接在 URL 后面，这种直接用实体就能接受，@RequestParam 用也可以，不用也可以，只有一个字段，直接用包装类接受也可以
```   
    @RequestMapping("/demo/f")
    public String fDemo(@RequestParam Long demo) {
        return JSON.toJSONString(demo);
    }

    @RequestMapping("/demo/g")
    public String gDemo(Long demo) {
        return JSON.toJSONString(demo);
    }

    备注：GET请求，参数放在Request Params中
```

2. 但是也有同学不走寻常路，他使用的是 get 请求，但是把参数放在 requestBody 里面。这就必须要跟 POST 请求一样处理了，加@RequestBody 修饰自定义实体，包装类也需要再使用自定义对象包一层。
```
    @RequestMapping("/demo/c")
    public String cDemo(@RequestBody Demo demo) {
        return JSON.toJSONString(demo);
    }
备注：GET请求，参数放在Request body中
```

##### 所有代码
可以放在自己的 SpringBoot 项目中，然后拿 postman 测试一下。
```
@RestController
public class TestDemo {
    @RequestMapping("/demo/a")
    public String aDemo(@RequestBody Map<String, Object> map) {
        return JSON.toJSONString(map);
    }

    @RequestMapping("/demo/b")
    public String bDemo(Map<String, Object> map) {
        return JSON.toJSONString(map);
    }

    @RequestMapping("/demo/c")
    public String cDemo(@RequestBody Demo demo) {
        return JSON.toJSONString(demo);
    }

    @RequestMapping("/demo/d")
    public String dDemo(Demo demo) {
        return JSON.toJSONString(demo);
    }

    @RequestMapping("/demo/e")
    public String eDemo(@RequestBody Long demo) {
        return JSON.toJSONString(demo);
    }

    @RequestMapping("/demo/f")
    public String fDemo(@RequestParam Long demo) {
        return JSON.toJSONString(demo);
    }

    @RequestMapping("/demo/g")
    public String gDemo(Long demo) {
        return JSON.toJSONString(demo);
    }
}


@Data
public class Demo {
    private String demoName;
    private Integer num;
}
```

##### 给自己挖坑
下一篇是 AQS，力争写一篇看完就可以入门 AQS 源码的文章，并且让读者有冲动自己上手阅读。奥利给！！！
公众号一起交流：
![](\uploads\headpic.jpg)




