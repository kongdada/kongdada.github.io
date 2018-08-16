---
title: mapreduce进程ruduce端内存溢出，解决方法和探索
date: 2018-08-16 10:42:18
tags: [pig, mapreduce, OOM]
categories: Hadoop
---
昨天碰到一个pig任务执行过程中发生了内存溢出。写点文字记录一下解决过程，顺便整理一下自己的思路。
<!--more-->
#### 一 错误信息
```
2018-08-15 05:20:24,102 [main] INFO  org.apache.pig.backend.hadoop.executionengine.mapReduceLayer.MapReduceLauncher - 75% complete
2018-08-15 05:20:58,720 [main] WARN  org.apache.pig.backend.hadoop.executionengine.mapReduceLayer.MapReduceLauncher - Ooops! Some job has failed! Specify -stop_on_failure if you want Pig to stop immediately on failure.
2018-08-15 05:20:58,721 [main] INFO  org.apache.pig.backend.hadoop.executionengine.mapReduceLayer.MapReduceLauncher - job job_1534254968444_0056 has failed! Stop running all dependent jobs
2018-08-15 05:20:58,721 [main] INFO  org.apache.pig.backend.hadoop.executionengine.mapReduceLayer.MapReduceLauncher - 100% complete
2018-08-15 05:20:59,123 [main] ERROR org.apache.pig.tools.pigstats.SimplePigStats - ERROR 2997: Unable to recreate exception from backed error: AttemptID:attempt_1534254968444_0056_r_000000_3 Info:Error: org.apache.hadoop.mapreduce.task.reduce.Shuffle$ShuffleError: error in shuffle in fetcher#12
	at org.apache.hadoop.mapreduce.task.reduce.Shuffle.run(Shuffle.java:134)
	at org.apache.hadoop.mapred.ReduceTask.run(ReduceTask.java:376)
	at org.apache.hadoop.mapred.YarnChild$2.run(YarnChild.java:164)
	at java.security.AccessController.doPrivileged(Native Method)
	at javax.security.auth.Subject.doAs(Subject.java:415)
	at org.apache.hadoop.security.UserGroupInformation.doAs(UserGroupInformation.java:1917)
	at org.apache.hadoop.mapred.YarnChild.main(YarnChild.java:158)
Caused by: java.lang.OutOfMemoryError: Java heap space
	at org.apache.hadoop.io.BoundedByteArrayOutputStream.<init>(BoundedByteArrayOutputStream.java:56)
	at org.apache.hadoop.io.BoundedByteArrayOutputStream.<init>(BoundedByteArrayOutputStream.java:46)
	at org.apache.hadoop.mapreduce.task.reduce.InMemoryMapOutput.<init>(InMemoryMapOutput.java:63)
	at org.apache.hadoop.mapreduce.task.reduce.MergeManagerImpl.unconditionalReserve(MergeManagerImpl.java:309)
	at org.apache.hadoop.mapreduce.task.reduce.MergeManagerImpl.reserve(MergeManagerImpl.java:299)
	at org.apache.hadoop.mapreduce.task.reduce.Fetcher.copyMapOutput(Fetcher.java:539)
	at org.apache.hadoop.mapreduce.task.reduce.Fetcher.copyFromHost(Fetcher.java:348)
	at org.apache.hadoop.mapreduce.task.reduce.Fetcher.run(Fetcher.java:198)

2018-08-15 05:20:59,123 [main] ERROR org.apache.pig.tools.pigstats.PigStatsUtil - 1 map reduce job(s) failed!
2018-08-15 05:20:59,125 [main] INFO  org.apache.pig.tools.pigstats.SimplePigStats - Script Statistics: 
```

#### 二 解决方法
看到`mapreduce.task.reduce.Shuffle$ShuffleError: error in shuffle in fetcher#12`和`Caused by: java.lang.OutOfMemoryError: Java heap space`；
就可以断定是在Reduce端的shuffer过程中内存不足，简单粗暴的做法就是加大MR过程中reduce端的内存。具体涉及到的参数如下：
1. `mapreduce.reduce.memory.mb` // 这个是为reduce端分配的内存大小，一般来说是1024的倍数。如果你分配了2000m，系统也会为你分配2048m.
2. `mapreduce.reduce.java.opts` // 这个是指定reduce端的JVM参数，这个的大小一般是上一个参数的0.75倍，因为要剩一些内存给非JVM进程。
##### 具体做法
因为在项目中是在一个shell脚本中用命令行调用了一个pig脚本。
`$PIG_HOME/bin/pig -param YESTERDAY=$YESTERDAY -param FUNCTION=$FUNCTION/$TASK_PROGRAM_DIR/example.pig`
那么就会产生一个问题，我们解决方法中提到的两个配置参数，插入那个脚本合适？
经过测试以上两个参数配置在shell脚本中是不起作用的。只能配置在pig脚本中。
pig中使用set语法如下：
```
SET mapreduce.reduce.memory.mb 3072;
SET mapreduce.reduce.java.opts '-Xms3000m -Xmx3000m';
```
具体配置参数的大小要结合上一次运行时内存分配的大小和数据量的大小，然后自己预估一个合适的值。不行就继续调整。直到问题解决。

#### 三 探讨
我们以上给出的方法是一种土财主的做法，基于我们有充足的内存。
再看报错信息` error in shuffle in fetcher#12`，发现是在下载map输出时内存不够了。
Reduce在shuffle阶段对下载来的map数据，并不是立刻就写入磁盘的，而是会先缓存在内存中，然后当使用内存达到一定量的时候才刷入磁盘。
那么就有可能是某个map输出过大，下载过来直接撑爆了内存。引入两个参数：
1. 参数: `mapred.job.shuffle.input.buffer.percent（default 0.7）`
说明: 用来缓存shuffle数据的reduce task heap百分比
这个参数其实是一个百分比，意思是说，shuffile在reduce内存中的数据最多使用内存量为：0.7 × maxHeap of reduce task。
缓存的数据量超过了这个值，便开始将缓存数据写入磁盘。
2. 参数：`mapred.job.shuffle.merge.percent（default 0.66）`
说明:缓存的内存中多少百分比后开始做merge操作
假设`mapred.job.shuffle.input.buffer.percent`为0.7，reduce task的max heapsize为1G，那么用来做下载数据缓存的内存就为大概700MB左右，这700M的内存，也不是要等到全部写满才会往磁盘刷的，而是当这700M中被使用到了一定的限度（通常是一个百分比），就会开始往磁盘刷。
假设`mapred.job.shuffle.merge.percent（default 0.66）`为0.66，那么当下载过来的map的输出在缓存中达到 0.7 * maxHeap * 0.66这个值，缓存的数据就开始往磁盘中写。
个人理解这就是两个关卡，前者决定用内存的百分之多少来做数据缓存，后者决定缓存使用到多少就开始往磁盘写数据。

##### 探讨结果
当我们机器本身的内存有限，或者我们追求内存的利用率。就可以放弃从整体上扩大内存的做法，转而调整任务各个阶段使用内存的比例。
在这次报错中我们就可以尝试将下面两个参数调小一点，
`mapred.job.shuffle.input.buffer.percent` // 这个调小，是将reduce端用来做数据缓存的内存减少。防止下载一个过大的map输出直接撑爆内存，导致任务失败。
`mapred.job.shuffle.merge.percent` // 这个调小是在上一个的基础上，进一步提前了将缓存的数据写入磁盘的时间。

如有错误，欢迎指出，十分感谢。
参考文章：
[MapReduce优化----参数的解释以及设置](https://blog.csdn.net/ruidongliu/article/details/11689459)
[Yarn下Mapreduce的内存参数理解](https://segmentfault.com/a/1190000003777237)