---
title: 搜狗技术面总结
date: 2018-04-18 16:08:01
tags: Interview hadoop HashMap
categories: Interview
---
感谢搜狗给的面试机会，感谢技术面大佬；
基本按着简历问的，这篇整理以前面试中提到的不在赘述；
记录一些新的或者没注意到得细节；
<!--more-->
#### Hive
##### HQL中的join与MR的转换
map阶段整体上来说就是将表中的每一条记录，转换为key-value形式；
一般都是on后的条件字段做key，其他字段做value，但是value中要加一个字段就是当前记录来自那张表；
shuffle阶段：将相同key的记录整理到一起；
reduce阶段： 将拥有相同key，但来自不同表，的字段进行整合，做成一条记录；

##### 分区的认识
Hive中的join操作会扫描全表，当表比较大时，这样扫描耗时长，效率低；
引进分区，可以理解为是将表进行了划分，我们可以在join操作是指定分区，这样就只扫描指定的分区，不做全表扫描，节约时间，提高效率；

#### hadoop
##### 客户端向HDFS写操作中间如果发生了失败，后续是怎么处理的；
整个写流程如下：
- 第一步，客户端调用DistributedFileSystem的create()方法，开始创建新文件：DistributedFileSystem创建DFSOutputStream，产生一个RPC调用，让NameNode在文件系统的命名空间中创建这一新文件；
- 第二步，NameNode接收到用户的写文件的RPC请求后，谁偶先要执行各种检查，如客户是否有相关的创佳权限和该文件是否已存在等，检查都通过后才会创建一个新文件，并将操作记录到编辑日志，然后DistributedFileSystem会将DFSOutputStream对象包装在FSDataOutStream实例中，返回客户端；否则文件创建失败并且给客户端抛IOException。
- 第三步，客户端开始写文件：DFSOutputStream会将文件分割成packets数据包，然后将这些packets写到其内部的一个叫做data queue(数据队列)。data queue会向NameNode节点请求适合存储数据副本的DataNode节点的列表，然后这些DataNode之前生成一个Pipeline数据流管道，我们假设副本集参数被设置为3，那么这个数据流管道中就有三个DataNode节点。
- 第四步，首先DFSOutputStream会将packets向Pipeline数据流管道中的第一个DataNode节点写数据，第一个DataNode接收packets然后把packets写向Pipeline中的第二个节点，同理，第二个节点保存接收到的数据然后将数据写向Pipeline中的第三个DataNode节点。
- 第五步，DFSOutputStream内部同样维护另外一个内部的写数据确认队列——ack queue。当Pipeline中的第三个DataNode节点将packets成功保存后，该节点回向第二个DataNode返回一个确认数据写成功的信息，第二个DataNode接收到该确认信息后在当前节点数据写成功后也会向Pipeline中第一个DataNode节点发送一个确认数据写成功的信息，然后第一个节点在收到该信息后如果该节点的数据也写成功后，会将packets从ack queue中将数据删除。
**在写数据的过程中，如果Pipeline数据流管道中的一个DataNode节点写失败了会发生什问题、需要做哪些内部处理呢？如果这种情况发生，那么就会执行一些操作：
首先，Pipeline数据流管道会被关闭，ack queue中的packets会被添加到data queue的前面以确保不会发生packets数据包的丢失；
接着，在正常的DataNode节点上的以保存好的block的ID版本会升级——这样发生故障的DataNode节点上的block数据会在节点恢复正常后被删除，失效节点也会被从Pipeline中删除；
最后，剩下的数据会被写入到Pipeline数据流管道中的其他两个节点中。
如果Pipeline中的多个节点在写数据是发生失败，那么只要写成功的block的数量达到dfs.replication.min(默认为1)，那么就任务是写成功的，然后NameNode后通过一步的方式将block复制到其他节点，最后事数据副本达到dfs.replication参数配置的个数。**
- 第六步，，完成写操作后，客户端调用close()关闭写操作，刷新数据；
- 第七步，，在数据刷新完后NameNode后关闭写操作流。到此，整个写操作完成。

##### HDFS的HA（高可用）实现中采用了QJM，详细介绍一下；
一句话：通过共享存储，共享了编辑日志；
怎么保证了高可用，活动的NN写编辑日志需要写入大多数JN节点，才能完成写操作；
这样就可以保证编辑日志是同步的，所以备用NN只要拿到编辑日志，然后根据编辑日志，重做元数据，就能到的最新的元数据，保证了高可用；
- 比较详细的解释：
在高可用配置下，editlog不再存放在名称节点，而是存放在一个共享存储的地方，这个共享存储由奇数个Journal Node组成，一般是3个节点(JN小集群)， **每个JN专门用于存放来自NN的编辑日志**，编辑日志由活跃状态的名称节点写入JN小集群。
那么要有2个NN，而且二者之中只能有一个NN处于活跃状态（active），另一个是待命状态（standby），只有active的NN节点才能对外提供读写HDFS服务，也只有active态的NN才能向JN写入编辑日志；standby状态的NN负责从JN小集群中拷贝数据（这个数据就是编辑日志）到本地。另外，各个DATA NODE也要同时向两个名称节点报告状态(心跳信息、块信息)

#### JAVA
##### HashMap为什么线程不安全，或者说hashMap的线程不安全表现在哪；
- 多线程下Resize操作，可能会形成链表环
Hashmap在插入元素过多的时候需要进行Resize，Resize的条件是
HashMap.Size   >=  Capacity * LoadFactor。
Hashmap的Resize包含扩容和ReHash两个步骤，ReHash在并发的情况下可能会形成链表环
[点击查看形成链表环的详细解释](http://mp.weixin.qq.com/s/dzNq50zBQ4iDrOAhM4a70A)
- 同时addEntry
两个线程同时获得了数组的一个位置，对一个Entry进行put操作，两个线程都有可能先执行，那么一个线程必然覆盖另一个线程的写入结果。安全的方式是不能同时获得同一个节点，写操作不能相互覆盖；

##### 将M个长度为N的有序数组进行Merge，这个过程的时间复杂度；
要将M个有序数组合并，我的想法是一直两两合并，直到最后合并成一个，
一对（两个）有序数组合并，他们要执行比较语句2N次，
第一步：有M/2对，要比较2N次，`M/2 * 2N = MN;`
第二步：有M/4对，要比较4N次（合并后长度是上一次的两倍），`M/4 * 4N = MN;`
...
直到合并成一个，这是一个分步计算，所以最终比较次数是以上每一步相加的和；
又因为大O表示法只取最高次项，所以最终这个时间复杂度为：O(MN)
##### java 的IO流如果不关闭会造成什么后果；
占用资源，内存溢出；
