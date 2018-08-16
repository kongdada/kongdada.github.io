---
title: Hbase ImportTSV
date: 2018-08-14 15:16:46
tags: [Hbase, import]
categories: Hbase
---
这个也是最近经手的一个项目中涉及到的一个可以将HDFS上的数据直接导入HBASE表中的命令行工具。这个属于HBASE所以与上一篇Hadoop中的工具分开来写。
<!--more-->
#### Hbase importTsv 
##### 概述和使用步骤：
ImportTsv是Hbase提供的一个命令行工具，可以将存储在HDFS上的自定义分隔符（默认\t）的数据文件，通过一条命令方便的导入到HBase表中，对于大数据量导入非常实用，其中包含两种方式将数据导入到HBase表中：
stepA: 生成HFile格式的文件
stepB: 执行一个叫做CompleteBulkLoad的命令，将文件move到HBase表空间目录
##### 一个例子：
- 第一步，生成Hfile
```
$ bin/hbase org.apache.hadoop.hbase.mapreduce.ImportTsv 
-Dimporttsv.columns=HBASE_ROW_KEY,f:accountID,f:time,f:crownCommonKeyID	//格式
-Dimporttsv.bulk.output=hdfs://storefile-outputdir 	//输出目录
<tablename> 	//输出后保存文件名
<hdfs-data-inputdir>	//输入目录
```
- 第二步，完成导入
```
$ bin/hbase org.apache.hadoop.hbase.mapreduce.LoadIncrementalHFiles 
<hdfs://storefileoutput> 	//这是上文的输出目录，也是这一步的输入目录
<tablename>	//导入hbase的表名
```
基本使用便是以上这样子。