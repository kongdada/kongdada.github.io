---
title: Hadoop Streamig 和 Hadoop Distcp的简单介绍
date: 2018-08-14 10:38:12
tags: [hadoop, Streaming, Distcp]
categories: Hadoop
---
今天总结一下经手的一个项目中用到的Hadoop工具；
距离上一篇文章不知不觉快4个月过去了，期间经历了毕业，入职这些事儿。一直想写个求职总结，错过了当初那份激情，现在已经有点淡忘那种真真切切的朝不保夕的感受。看后来有没有心情在更吧。我毕设也挺好玩，挺简单的一个东西，有时间也可以写写。这都是后话。
<!--more-->
#### Hadoop Streaming
##### 概述与基本使用：
Hadoop streaming是Hadoop的一个工具， 它帮助用户创建和运行一类特殊的map/reduce作业， 这些特殊的map/reduce作业是由一些可执行文件或脚本文件充当mapper或者reducer。例如：
```
$HADOOP_HOME/bin/hadoop  jar $HADOOP_HOME/hadoop-streaming.jar \
    -input myInputDirs \
    -output myOutputDir \
    -mapper /bin/cat \
    -reducer /bin/wc
    -file /home/Waterkong/test.sh
```
##### 个人理解
- -mapper与-reducer都可以指定一个可执行文件（可以是脚本，也可以是class文件），如果不需要map/reduce任务则可以省略对应的这个选项。
- -file 任何可执行文件都可以被指定为mapper/reducer。这些可执行文件不需要事先存放在集群上； 如果在集群上还没有，则需要用-file选项让framework把可执行文件作为作业的一部分，一起打包提交。
- 一个说明图，说明这些作为Map或者Reduce的脚本与hadoop起的进程之间是怎么协作的。最重要的就是这些可执行文件是另起进程的。
![](https://ws1.sinaimg.cn/large/005Owz0qly1fxqblwzuplj30qi0q0gn9.jpg)
- 以上就是一个简单的介绍，Hadoop Streaming具体介绍可以点击下面的链接
[点击查看Hadoop Streaming的详细介绍](https://hadoop.apache.org/docs/r1.0.4/cn/streaming.html#Hadoop+Streaming)

#### Hadoop Distcp
##### 概述：
DistCp（分布式拷贝）是用于大规模集群内部和集群之间拷贝的工具。 它使用Map/Reduce实现文件分发，错误处理和恢复，以及报告生成。 它把文件和目录的列表作为map任务的输入，每个任务会完成源列表中部分文件的拷贝。 由于使用了Map/Reduce方法，这个工具在语义和执行上都会有特殊的地方。 这篇文档会为常用DistCp操作提供指南并阐述它的工作模型。
##### 基本使用方法：
DistCp最常用在集群之间的拷贝：
```
bash$ hadoop distcp hdfs://nn1:8020/foo/bar \ 
                    hdfs://nn2:8020/bar/foo
```
这条命令会把nn1集群的/foo/bar目录下的所有文件或目录名展开并存储到一个临时文件中，这些文件内容的拷贝工作被分配给多个map任务， 然后每个TaskTracker分别执行从nn1到nn2的拷贝操作。注意DistCp使用绝对路径进行操作。
命令行中可以指定多个源目录：
```
bash$ hadoop distcp hdfs://nn1:8020/foo/a \ 
                    hdfs://nn1:8020/foo/b \ 
                    hdfs://nn2:8020/bar/foo
```
或者使用-f选项，从文件里获得多个源：
```
bash$ hadoop distcp -f hdfs://nn1:8020/srclist \ 
                       hdfs://nn2:8020/bar/foo 
```
其中srclist 的内容是
```
    hdfs://nn1:8020/foo/a 
    hdfs://nn1:8020/foo/b
```
##### 一个问题 
问题：源目录之前的hdfs://是可以省略的，但是省略后他默认的HDFS的地址是怎么找到的？
因为是Hadoop的工具所以去默认的Hadoop环境找,在core-site.xml发现了默认的文件系统(HDFS)的地址:
```
<property>
<name>fs.defaultFS</name>
<value>hdfs://Waterkong</value>
</property>
```
但后面的这个hdfs://Waterkong是ping不通的。
因为配置了高可用，真正投入使用的namenode的地址还指不定是哪一个，所以这个真正的地址还要去hdfs-site.xml中查找现在正在使用的namanode的地址。
```
<property>
<name>dfs.namenode.http-address.Waterkong.nn1</name>
<value>rsync.nn1.Waterkong.zw.ted:50070</value>
</property>
<property>
<name>dfs.namenode.http-address.Waterkong.nn2</name>
<value>rsync.nn2.Waterkong.sjs.ted:50070</value>
</property>
```
以上是HA节点真正的地址，至此客户端与服务端交互地址被找到。（这儿的nn1与nn2分别代表主备namenode，与上面的例子中的nn1,nn2没有关系。）
以上就是一个简单的介绍，Hadoop Distcp具体介绍可以点击下面的链接
[点击查看Hadoop Distcp的详细介绍](https://hadoop.apache.org/docs/r1.0.4/cn/distcp.html)
如有错误，敬请指导。
