---
title: shell中嵌入SQL查询
date: 2018-08-29 10:08:48
tags: [shell sql]
categories: shell
---
这两天在做一个hadoop升级的事情。分配到我的任务就是在新的集群测试项目中的脚本，保证能够在新集群跑得通，并产生正确的数据。那么数据正不正确怎么个比较法呢，因为暂时是新旧集群一起运行此项目，项目最后产出的数据量也不大，十万过一点，四五个文件。干脆down下来用beyond Compare这个软件比较一下算了。但在down下来的过程中踩坑了。
<!--more-->
#### 问题复述
因为种种限制，我不能直接将两个数据库中的数据导出来做比较，但是任何查询都是可以的，那么最简单的想法就是写个脚本，根据不同的传参，配置不同的数据库信息，导出数据。
脚本中最重要的就是怎么把SQL嵌入脚本。说来简单，我是这样写的：
```
sql="select * from test.info;"
mysql="mysql -h$HOST -p$PORT -u$USER -p$PASSWD"
echo ${sql} | ${mysql}
```
第一行查询语句；第二行数据库登录信息，ip地址，用户，密码；第三行使用登录信息进行这个sql查询。
执行报错，根据报错看出来是语法问题，select 附近有错。
在第三行`echo ${sql}`，发现这个`select`后面的`*`，居然被替换成了当前脚本所在目录下的所有文件名字。怎么个意思呢？
假设`/user/local`下有`a.txt b.txt c.sh`三个文件，你在`c.sh`中写了如上（就那个select `*` ）的代码，那么你的查询语句中的`*`就会被替换成`a.txt b.txt`;

#### 解决方法
将`echo ${sql} | ${mysql}`改为`echo "${sql}" | ${mysql}`
没看错就是在变量`${sql}`外面包了一层双引号，就这么解决了。

#### 脑洞大开
由于没有查到翔实的资料，以下都是个人猜测。
将脚本写成下面这个样子：
```
 #!/bin/bash
sql="select * from test.klhinfo;"
mysql="mysql  -uroot -pmysql123"
echo ${sql}
echo "${sql}" | ${mysql}
```
然后运行一下，发现当`echo ${sql}`时，其中的星号被替换成了当前目录下的文件名。
脑洞大开：`${sql}` 被替换成 `$select $* $from $test.klhinfo`, `$*`正好是获取所有传入的参数，估计是将当前目录下的文件名都当作参数传进来了。

#### 在shell脚本中嵌入SQL的姿势

