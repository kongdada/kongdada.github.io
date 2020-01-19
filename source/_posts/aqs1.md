---
title: AQS前传
date: 2020-01-16 17:57:26
tags: [Java]
categories: Java
---
我来填坑，第一篇先不讲AQS,打算先说清楚AQS的一些相关知识。这样后续再看AQS会比较容易理解；
<!-- more -->

#### volatile 关键字
我们都知道volatile关键字，是通过内存屏障实现了两个特性：
- 可见性：假设两个线程A和B同时从主内存中读取了同一个变量c，线程A修改了变量c，会及时写回主内存，并且使线程B持有的变量c失效，然后线程B从主内存读取到被线程A修改过的变量。这样就保证了可见性；
- 避免指令重排序，这个就是在volatile变量前后加了内存屏障，可以当成一个标识，在这个标识前后的指令，不能进行重排序。

##### 可见性
来看第一段代码，证明一下可见性：
```
public class VolatileTest2 {
    private static volatile Integer c = 0;

    public static void main(String[] args) throws Exception {
        new Thread(() -> {
            while (true) {
                if (c == 0) {
                    System.out.println("ac = " + c);
                } else {
                    System.out.println("bc = " + c);
                    break;
                }
            }

        }).start();

        new Thread(() -> {
            c = 1;
        }).start();
        
    }
}
```
运行结果：
```
ac = 0
ac = 0
ac = 0
ac = 0
ac = 0
ac = 0
ac = 0
ac = 0
bc = 1
```
同时起了两个线程，一个线程对volatile变量的修改，对于另一个线程来说是可见的。

##### 避免重排序
第二段代码，想说明的是volatile修饰的变量不仅影响变量自身，而且会影响他前后变量。这个也就是volatile会避免指令重排序这个特性的解释：
```
public class VolatileTest4 {
    // a不使用volatile修饰
    public static long a = 0;
    // 消除缓存行的影响
    public static long p1, p2, p3, p4, p5, p6, p7;
    // b使用volatile修饰
    public static volatile long b = 0;
    // 消除缓存行的影响
    public static long q1, q2, q3, q4, q5, q6, q7;
    // c不使用volatile修饰
    public static long c = 0;

    public static void main(String[] args) throws Exception {
        new Thread(() -> {
            while (a == 0) {
                try {
//                    long x = b;
                } catch (Exception ex) {
                }
            }
            System.out.println("a=" + a);
        }).start();

        new Thread(() -> {
            while (c == 0) {
                try {
                    long x = b;
                } catch (Exception ex) {
                }
            }
            System.out.println("c=" + c);
        }).start();
        Thread.sleep(100);
        a = 1;
        b = 1;
        c = 1;
        System.out.println("main end");
    }
}

```
运行结果：
```
main end
c=1
```
上面提到的消除缓存行的影响，如果感兴趣可以搜索关键词“伪共享”去了解。
再说回这段代码：
1. 同时启动两个线程，然后主线程休眠100毫秒，这个主要为了保证两个子线程都已经启动了。
2. 主线程分别修改abc三个变量的值，b是volatile修饰的，所以两个子线程是可见这个这个变量的改变的。但是ac两个变量对于子线程来说，是不可见的，两个子线程分别持有的a和c的值目前还是0；
3. 但是当子线程再次访问了变量b( long x = b;)，我们发现子线程持有的变量c居然是1了。这就证明了volatile变量不但对自己本身有影响并且对执行到的上下行也有影响；

我们来看张图，是volatile变量对前后执行行的影响：
![](\uploads\volatile01.png)

4. 由此，个人理解是第一项是读取volatile变量b，第二项是读取一般变量c，此时要避免重排序，在这两个指令之间必然会有内存屏障；
5. 内存屏障的作用：不管读还是写，都会吧当前缓冲区给刷新，刷新了缓冲区自然拿到了变量c的最新值1；
TIPS: 在这一类跟高速缓冲区有关的测试代码中，要仔细思考 System.out.println 的使用时机，因为println方法的底层使用了synchronized关键字，这个关键字也会刷新当前缓冲区，这样会对你的实验造成影响：
```
    public void println(String x) {
        synchronized (this) {
            print(x);
            newLine();
        }
    }

```

#### Unsafe类
这个类在AQS中起到了很大的作用,我们要使用他的CAS和挂起线程唤醒线程；

##### CAS
他提供了现成的CAS方法：先比较再重置，比如对变量a的更新，分三步：
1. 从主内存读取a；
2. 将读取到的a改变;
3. 将改变后的a写回主内存之前，先判断主内存中的a跟自己一开始读取到的a是相等的。确认这个条件后，将改变后的a写入主内存；
CAS能够保证在并发环境下，我们正确的更新变量：
```
public class Counter {
    private volatile int count = 0;
    private static long offset;
    private static Unsafe unsafe;

    static {
        try {
            Field f = Unsafe.class.getDeclaredField("theUnsafe");
            f.setAccessible(true);
            unsafe = (Unsafe) f.get(null);
            // 获得count的存储位置
            offset = unsafe.objectFieldOffset(Counter.class.getDeclaredField("count"));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public void increment() {
        int before = count;
        while (!unsafe.compareAndSwapInt(this, offset, before, before + 1)) {
            System.out.println("increment " + count);
            before = count;
        }
    }

    public int getCount() {
        return count;
    }

    public static void main(String[] args) throws Exception{
        Counter counter = new Counter();
        ExecutorService threadPool = new ThreadPoolExecutor(12, 20, 5,
                TimeUnit.SECONDS, new ArrayBlockingQueue(100));
        // 起100个线程，每个线程自增1000次
        IntStream.range(0, 100).forEach(i -> {
            threadPool.submit(() -> IntStream.range(0, 1000).forEach(j -> {
                System.out.println(Thread.currentThread().getName() + "-----" + j);
                counter.increment();
            }));
        });
        Thread.sleep(5000);
        threadPool.shutdown();
        // 打印100000
        System.out.println("count " + counter.getCount());
    }
}
```
CAS操作包含三个操作数 -- 内存位置、预期原值及新值。执行CAS操作的时候，将内存位置(offset)的值(count)与预期原值(before)比较，如果相匹配，那么处理器会将该位置值更新为新值，否则，处理器不做任何操作，该方法返回false;
测试代码是起了100个线程，每个线程对count自增1000次，如果每一次自增都是正确的，最终count是100*1000。可以自己跑一下，测试；
tip: 这一段代码要注意的是我们是通过Unsafe类的theUnsafe字段，通过反射获取到一个unsafe对象；其次就是这个unsafe.compareAndSwapInt()方法；注意参数代表的意义；

##### park和unpark
阻塞和唤醒当前线程
```
    private static void finallyTest() throws Exception {
        Field f = Unsafe.class.getDeclaredField("theUnsafe");
        f.setAccessible(true);
        Unsafe unsafe = (Unsafe) f.get(null);

        Thread thread = new Thread(() -> {
            try {
                System.out.println("try me");
                unsafe.park(false,0L);
            } catch (Exception ex) {
                ex.printStackTrace();
            } finally {
                System.out.println("finally");
            }
        });
        thread.start();
        Thread.sleep(10);
        System.out.println("main end");
        unsafe.unpark(thread);
    }
```
结果：
```
try me
main end
```
这段代码中:
1. 我们启动一个线程打印“try me”之后挂起。
2. 主线程休眠10毫秒，这是为了保证子线程能够执行到挂起那一段代码；主线程打印“main end”之后再唤醒子线程;
3. 子线程唤醒后继续执行打印“finally”;

#### 写一个锁
看明白了以上两个神器，我们就可以尝试写一个锁；
想想看我们的锁需要什么？
1. 我们需要一个变量state作为标识，标识我这个锁有没有被占用；这个变量还必须声明成volatile的，这个变量的改变要保证所有线程可见；
2. 我们需要一个队列，当有并发获取锁的时候，只有一个线程能获取到，其他线程要被阻塞在这个队列中，等待唤醒；
3. 并发更新我们的标识变量我们要使用CAS来保证一个正确性，我们还要使用线程的挂起与唤醒，所以我们得有一个unsafe对象；

我们的代码如下：
```
public class MyLock {
    /**
     * 用来标识锁有没有被占用
     */
    private volatile int state;
    /**
     * 用它实现CAS操作和操作线程
     */
    private static Unsafe unsafe;
    private static long stateOffset;

    /**
     * 链表头
     */
    private volatile Node head;
    /**
     * 链表尾
     */
    private volatile Node tail;
    private static long tailOffset;
    static final Node EMPTY = new Node();

    static {
        try {
            Field f = Unsafe.class.getDeclaredField("theUnsafe");
            f.setAccessible(true);
            unsafe = (Unsafe) f.get(null);
            stateOffset = unsafe.objectFieldOffset(MyLock.class.getDeclaredField("state"));
            tailOffset = unsafe.objectFieldOffset(MyLock.class.getDeclaredField("tail"));
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public MyLock() {
        head = tail = EMPTY;
    }

    /**
     * 原子更新锁状态
     *
     * @param expect
     * @param update
     * @return
     */
    private boolean compareAndSetState(int expect, int update) {
        return unsafe.compareAndSwapInt(this, stateOffset, expect, update);
    }

    /**
     * 对队尾的原子操作
     *
     * @param expect
     * @param update
     * @return
     */
    private boolean compareAndSetTail(Node expect, Node update) {
        return unsafe.compareAndSwapObject(this, tailOffset, expect, update);
    }

    private synchronized void printQueue() {
        Node temp = head;
        while (Objects.nonNull(temp.next)) {
            System.out.print(temp.next.thread.getName() + "##");
            temp = temp.next;
        }
        System.out.println();
    }

    /**
     * 入队
     *
     * @return
     */
    private Node enqueue() {
        while (true) {
            // 获取尾节点
            Node t = tail;
            // 构造新节点
            Node node = new Node(Thread.currentThread(), t);
            // 不断尝试原子更新尾节点
            if (compareAndSetTail(t, node)) {
                // 更新尾节点成功了，让原尾节点的next指针指向当前节点
                t.next = node;

//                printQueue();

                return node;
            }
        }
    }

    /**
     * 加锁
     */
    public void lock() {
        // 尝试更新state字段，更新成功说明占有了锁
        if (compareAndSetState(0, 1)) {
            System.out.println(Thread.currentThread().getName() + "lock");
            return;
        }
        /**
         *  未更新成功则入队，所有没获得锁的线程都会重复执行入队，直到成功入队
         *  也就是所有没获得锁的线程，都会阻塞在入队操作
         */
        Node node = enqueue();
        Node prev = node.prev;
        // 再次尝试获取锁，需要检测上一个节点是不是head，按入队顺序加锁
        while (node.prev != head || !compareAndSetState(0, 1)) {
            // 未获取到锁，阻塞
            unsafe.park(false, 0L);
        }
        /**下面不需要原子更新，因为同时只有一个线程访问到这里
         * 到这里的条件是：上一个节点是head，并且获得了锁
         * head后移一位，其实就是head要出队
         */
        head = node;
        // 清空当前节点的内容，协助GC
        node.thread = null;
        node.prev = null;
        prev.next = null;
    }


    /**
     * 解锁
     */
    public void unlock() {
        // 把state更新成0，这里不需要原子更新，因为同时只有一个线程访问到这里
        state = 0;
        System.out.println(Thread.currentThread().getName() + "unlock");
        // 下一个待唤醒的节点
        Node next = head.next;
        // 下一个节点不为空，就唤醒它
        if (next != null) {
            unsafe.unpark(next.thread);
        }
    }

    private static int count = 0;

    public static void main(String[] args) throws InterruptedException {

        testTong();

    }

    private static void testTong() throws InterruptedException {
        MyLock myLock = new MyLock();
        CountDownLatch countDownLatch = new CountDownLatch(1000);
        IntStream.range(0, 1000).forEach(i -> new Thread(() -> {
            myLock.lock();
            try {
                IntStream.range(0, 10000).forEach(j -> {
                    count++;
                });
            } finally {
                myLock.unlock();
            }
            countDownLatch.countDown();
        }, "tt-" + i).start());
        countDownLatch.await();
        System.out.println(count);
    }
}
```
- 加锁：
假设有三个线程一起执行加锁：
1. 只有一个线程A成功将state更新成了1，占有了锁，线程B跟线程C只好去阻塞在队列中；
2. 线程B和线程C都将自己包装成一个Node挂载在队列的尾结点上

