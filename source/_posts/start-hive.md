---
title: Hive常用命令
date: 2017-12-01 16:03:21
tags: "Hive"
categories: Hive
---
Hive 常见命令，老大说学完就给我点权限。
你看看，这孩子又在写Bug了。
<!--more-->
#### Hive常见命令
- 显示所有数据库
`show databases;`
- 指定使用某个数据库
`use database_name;`
- 显示所有表
`show tables;`
- 查询表结构
`desc table_name;`
- 显示表的详细信息
`describe extended table_name;`
- 显示分区信息
`show partitions; `
- HIVEQL创建表```
create table if not exists test_klh (
name string comment 'person name', 
age int comment 'person age',
sex string comment 'person sex'
)comment 'person'
row format delimited
# 列分隔符（字段）
fields terminated by '|'
# 行分隔符
lines terminated by '\n'
# 本地文件的格式
stored as textfile;```
- 表结构复制，不会复制数据
`create table if not exists test_klh2 like test_klh;` 
- 加载数据(将本地数据加载到Hive表)
`load data local inpath '/kehuduan02/bonc_guanjianji/bonc_klh/test' overwrite[可省] into table test_klh;`
- 加载数据同时创建分区
`load data local inpath 'path/path' overwrite into table table_name partition (sex, age);`
- 导出数据
`insert overwrite local directory 'path' select * from table_name where **`
- 通过查询插入数据
`insert into/overwrite table test_klh select * from test_klh where name = "mike";`
- 单个查询语句中创建表并加载数据
`create table test_klh1 as select * from test_klh where name = "mike" ;`
- 删除表
`drop table if exitst table_name `
- case ... when ... then ...
```
select name, sex,
case 
when test_klh.sex < 22 then 'younger' 
when test_klh.sex > 20 and test_klh.sex < 23 then 'mid'
when test_klh.sex > 22 then 'bigger'
else 'bingo'
end as bracket from test_klh;```
上面这些学完真的就可以去练练手了。
#### 两个很实用的命令
下面介绍；两个很实用的命令
- hive -e: 在 linux 命令行中执行 hive语句，其实就是用hive来解析hive -e 后面的语句。```
[root@cloud1 hive-0.13.1]# bin/hive -e 'select *  from default.student'  
15/10/18 06:55:27 WARN conf.HiveConf: DEPRECATED: hive.metastore.ds.retry.* no longer has any effect.  Use hive.hmshandler.retry.* instead  
Logging initialized using configuration in jar:file:/opt/hive-0.13.1/lib/hive-common-0.13.1.jar!/hive-log4j.properties  
OK  
1   jhon 
2   mike  
3   jack  
Time taken: 21.298 seconds, Fetched: 3 row(s) ```
- hive -f：在linux 命令行中执行 hive的.sql文件，其实就是用hive解析一个.sql 文件。```
[root@cloud1 hive-0.13.1]# touch test.sql  
[root@cloud1 hive-0.13.1]# vi test.sql  
select * from default.student ;   
[root@cloud1 hive-0.13.1]# hive -f /opt/hive-0.13.1/test.sql  
15/10/18 07:00:12 WARN conf.HiveConf: DEPRECATED: hive.metastore.ds.retry.* no longer has any effect.  Use hive.hmshandler.retry.* instead  
Logging initialized using configuration in jar:file:/opt/hive-0.13.1/lib/hive-common-0.13.1.jar!/hive-log4j.properties  
OK  
1   jhon 
2   mike  
3   jack 
Time taken: 13.048 seconds, Fetched: 3 row(s) ```

注意：我一般都把注释写在代码的上一行。