---
title: 单例到底要怎么实现
date: 2020-01-12 16:00:20
tags: [Java]
categories: java
---
#### 前情提要
隔壁男神听说我开了个公众号，他迫不及待要来装逼了，给我投了个稿，深入浅出单例模式，你就看这名儿起的就不咋滴，深深浅浅得真义？
话不多说，先说说背景吧，生产当中如果我们缺对象就直接在内存里new一个对吧，那么这个new可就有点学问了，有时候我们希望从一而终，这个对象不用太多，一个就够，多了身体也吃不消，比如某xxxFactory，某xxxContext等等。
要让内存里仅仅只存在一个对象，没有并发的情况下，这事儿好办，但它难就难在多线程场景下要如何去保证单例，即多个线程同时创建对象时的竞态问题(指令重排序)如何解决。

##### Singleton1 懒汉式
直接上代码Singleton1：
```
public class Singleton1 {

    private static Singleton1 uniqueInstance;

    private Singleton1(){}

    public static synchronized Singleton1 getInstance() {
        if(uniqueInstance == null)
         uniqueInstance = new Singleton1();
        return uniqueInstance;
    }

}

```
这是大家比较熟悉的懒汉式单例，先判断内存里有没有这么个对象已经存在，把new的过程拖到最后一步才进行，中间再通过synchronized关键字保证线程独占getInstance()方法。这种方式的缺点是：
- 每次调用这个方法去实例化对象时，都需要用到synchronized关键字，而这个关键字需要线程调度、上下文切换等等操作，比较耗费CPU和时间资源；

##### Singleton2 饿汉式
```
public class Singleton2 {

    private static Singleton2 uniqueInstance = new Singleton2();

    private Singleton2(){}

    public static Singleton2 getInstance(){
        return uniqueInstance;
    }

}

```
这种方式在一开始就new出一个对象，getInstance()方法直接返回就行了。其实第一种方式的synchronized仅仅是为了防止多条线程“第一次”执行getInstance()方法时多创建实例的情况，第二次就可以直接用if(uniqueInstance == null)的判断来保证单例。这种方式使得JVM在加载这个类时马上创建此唯一的单例，保证在任何线程访问uniqueInstance静态变量之前，一定先创建此实例，避免了synchronized进行线程调度的过程，不失为一种好方法。但有一点不好的是，如果我把对象创建出来了，但我要用的不是它，而是类里的另一个static方法的话，这样岂不是白白创建了一个对象独守空房？空虚寂寞冷相比不太好受吧。

##### Singleton3 双重校验锁
我们再来看对第一种方法的另一个变种双重校验锁机制Singleton3
```
public class Singleton3 {

    private volatile static Singleton3 uniqueInstance;

    private Singleton3(){}

    public static Singleton3 getInstance(){
        if(uniqueInstance == null){
            synchronized (Singleton3.class){
                if(uniqueInstance == null){
                    uniqueInstance = new Singleton3();
                }
            }
        }
        return uniqueInstance;
    }

}

```
- 解决第一种懒汉式中提到的问题，先通过if(uniqueInstance == null)判断内存中有无uniqueInstance对象，如果没有，再通过synchronized关键字确保线程独占该Singleton3类完成new的工作。这种方式既避免了方法一的synchronized一直影响效率的问题，也避免了方法二中对象独守空房的囧态，单例模式的上上之选非他莫属。

- 这种方法还加入了一个volatile关键字，这个关键字的作用在于，当被修饰的变量发生变化时，它会被第一时间刷入内存中(保证工作缓存和内存的一致性)，确保了uniqueInstance在同一时刻只能被一个线程修改。假设我们没有使用volatile，当有并发情况，线程A跟线程B，各自持有的是uniqueInstance的一个副本，就会发生连个线程同时修改这个变量，这当然是不安全的做法。所以要使用volatile

##### Singleton4
我们说双重校验是上上之选，你以为这就完事儿了？其实并没有，且看方法四Singleton4：

```
public enum Singleton4 {

    INSTANCE;

    public Singleton4 getInstance(){
        return INSTANCE;
    }

}

```
众所周知，Java是一个以其安全性著称的语言，那我们就把话题再拔高一个层次上升到安全性方面。对于前三种方式我们可以发现他们都有一个private的构造方法SingletonX(){}，对于这种有构造方法的大家闺秀对象，可是人人都跃跃欲试想得到呀！那么只要通过反射攻击拿到其构造方法，人人都可以造一个这样的对象了，哈哈！那么且看代码：

```
public class test {

    public static void main(String[] args) throws Exception{

        Class cla = Singleton3.class;
        Constructor c = cla.getDeclaredConstructor();
        c.setAccessible(true);
        Singleton3 singleton = (Singleton3) c.newInstance();
        System.out.println(singleton.getInstance());

    }

}

```
执行结果：
```
com.justme.sometool.java.Singleton3@246b179d

Process finished with exit code 0
```

通过上面这段反射攻击，我们顺利地拿到了心仪的对象，并哈哈大笑了起来，“哈哈哈，花姑娘~”。
可如果对方法四故技重施的话......

```
Exception in thread "main" java.lang.NoSuchMethodException: com.justme.sometool.java.Singleton4.<init>()
	at java.lang.Class.getConstructor0(Class.java:3082)
	at java.lang.Class.getDeclaredConstructor(Class.java:2178)
	at com.justme.sometool.java.test.main(test.java:10)

Process finished with exit code 1
```
“呜呜呜，花姑娘！”
可见对于枚举的单例模式，反射攻击是起不到任何作用的。
还有一方面安全性保障就是序列化了，如果我们new出来的单例对象要放在信道上进行网络传输的话，就免不了要进行序列化，如果在传输过程中被猥琐之徒盯上了，“逮，哪里跑，瞅你这串0101的顺序，你就是我要找的对象，抓回去做压寨夫人，哈哈哈~”不过对于枚举的对象来说，对她进行序列化时少不了要用到一个叫readObject()的方法，这时枚举类每次都会返回一个新建的实例对象，那么序列化之后也就会成为不同的0101序列，彼时可就是“多兔傍地走，安能辨我是雄雌”了。“想抓我？您知道哪个是我么？嘻嘻！”
那么总结一下，使用枚举来实现单例模式，既可以防止反射攻击，又可以避免序列化后走道被认出来，可谓一举两得呀！关于更多枚举的特性，朋友们可以自行探究，这里也就不再赘述了，总之是个好玩意儿。这里贴一张Singleton4编译后的字节码指令：

```
public final class com.justme.sometool.java.Singleton4 extends java.lang.Enum<com.justme.sometool.java.Singleton4> {
  public static final com.justme.sometool.java.Singleton4 INSTANCE;

  public static com.justme.sometool.java.Singleton4[] values();
    Code:
       0: getstatic     #1                  // Field $VALUES:[Lcom/justme/sometool/java/Singleton4;
       3: invokevirtual #2                  // Method "[Lcom/justme/sometool/java/Singleton4;".clone:()Ljava/lang/Object;
       6: checkcast     #3                  // class "[Lcom/justme/sometool/java/Singleton4;"
       9: areturn

  public static com.justme.sometool.java.Singleton4 valueOf(java.lang.String);
    Code:
       0: ldc           #4                  // class com/justme/sometool/java/Singleton4
       2: aload_0
       3: invokestatic  #5                  // Method java/lang/Enum.valueOf:(Ljava/lang/Class;Ljava/lang/String;)Ljava/lang/Enum;
       6: checkcast     #4                  // class com/justme/sometool/java/Singleton4
       9: areturn

  public com.justme.sometool.java.Singleton4 getInstance();
    Code:
       0: getstatic     #7                  // Field INSTANCE:Lcom/justme/sometool/java/Singleton4;
       3: areturn

  static {};
    Code:
       0: new           #4                  // class com/justme/sometool/java/Singleton4
       3: dup
       4: ldc           #8                  // String INSTANCE
       6: iconst_0
       7: invokespecial #9                  // Method "<init>":(Ljava/lang/String;I)V
      10: putstatic     #7                  // Field INSTANCE:Lcom/justme/sometool/java/Singleton4;
      13: iconst_1
      14: anewarray     #4                  // class com/justme/sometool/java/Singleton4
      17: dup
      18: iconst_0
      19: getstatic     #7                  // Field INSTANCE:Lcom/justme/sometool/java/Singleton4;
      22: aastore
      23: putstatic     #1                  // Field $VALUES:[Lcom/justme/sometool/java/Singleton4;
      26: return
}
```
文末，引用Joshua Bioch大神的一句话：“单元素的枚举类型已经成为实现Singleton单例的最佳方法！”作为旁门佐证，证明我此言非虚！




