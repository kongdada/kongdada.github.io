---
title: 在RedHat5.8上安装jira
date: 2018-12-12 20:14:07
tags: [Mysql, Jira, Jdk]
categories: JIRA
---
在某个抓耳挠腮写不出代码的傍晚，老大那个时常是灰色的头像开始疯狂跳动，正好处于转正前夕。我有点紧张了，点开了对话框。
"XX，下周你看一下JIRA，搭建个平台出来，如果需要Linux机器的话，找我要一下。"
"想了想，打了好几个字，然后删除，在对话框输入’好的‘，Enter"
言归正传，聊一下怎么搭建这个平台，分享一些我的低级失误，大家就不要再犯了，不要再折腾自己了，虽然我知道你还得折腾，谁让咱们都是不信命的程序员呢！
<!-- more -->
#### 确定你要安装的JIRA产品
你需要知道的事情是JIRA现在指的是一个产品组了，不是指某个具体的产品，具体如下图：
![](https://ws1.sinaimg.cn/large/005Owz0qly1fy4xqq55pjj30hj0gcjsl.jpg)
啥也不多说了，我们要的就是JIRA Software
#### 环境介绍
官方推荐：
- jdk1.8
- Mysql 5.5 5.6

本次搭建中我使用的：
- RedHat5.8
```
[root@djt_36_149 ~]# lsb_release -a
LSB Version:    :core-4.0-amd64:core-4.0-ia32:core-4.0-noarch:graphics-4.0-amd64:graphics-4.0-ia32:graphics-4.0-noarch:printing-4.0-amd64:printing-4.0-ia32:printing-4.0-noarch
Distributor ID: RedHatEnterpriseServer
Description:    Red Hat Enterprise Linux Server release 5.8 (Tikanga)
Release:        5.8
Codename:       Tikanga
```
- jdk1.8.0_191
```
[root@djt_36_149 ~]# java -version
java version "1.8.0_191"
Java(TM) SE Runtime Environment (build 1.8.0_191-b12)
Java HotSpot(TM) Server VM (build 25.191-b12, mixed mode)
```
- Mysql
```
[root@djt_36_149 jiraPackage]# rpm -qa | grep -i mysql
MySQL-client-5.6.23-1.rhel5
MySQL-server-5.6.23-1.rhel5
```
- JIRA Software 
atlassian-jira-software-7.3.8-x64.bin

#### 安装包提供
[https://pan.baidu.com/s/1-gT1s93KZfgO59U1mdfYPw 提取码: 8h3c](https://pan.baidu.com/s/1-gT1s93KZfgO59U1mdfYPw)

#### Mysql安装
MySQL的安装推荐一篇文章：
[https://www.cnblogs.com/rusking/p/4422986.html](https://www.cnblogs.com/rusking/p/4422986.html)
按照上面文章做没有问题；亲测
但大致记录一下我安装时的一些细节：
##### 检查老版本并卸载
- 看看Linux机器有没有Mysql
```
[root@rhel204 /]# rpm -qa | grep -i mysql
MySQL-server-advanced-5.6.23-1.rhel5
MySQL-client-advanced-5.6.23-1.rhel5
```
- 假设有，如上，则卸载
```
[root@rhel204 /]# rpm -ev MySQL-server-advanced-5.6.23-1.rhel5 MySQL-client-advanced-5.6.23-1.rhel5
```
- 删除残余文件
其实并不是所有含有mysql的文件都要删，把下面列出来的这几个删除就可以了；
```
[root@rhel201 mysql]# find / -name mysql* 找到所有的mysql目录，并删除。 
rm -rf /usr/share/mysql
rm -rf /var/lib/mysql
rm -rf /usr/lib64/mysql
rm -rf /var/lib/mysql
rm -rf /etc/my.cnf.d
```

##### 安装MySQL并创建需要的数据库
- 服务端和客户端都需要
```
[root@rhel204 MySQL 5.6.23-RMP]# rpm -ivh MySQL-server-advanced-5.6.23-1.rhel5.x86_64.rpm 
Preparing... ########################################### [100%]
1:MySQL-server-advanced ########################################### [100%]
warning: user mysql does not exist - using root
warning: group mysql does not exist - using root
[root@rhel204 MySQL 5.6.23-RMP for oraclelinux or rhel5-x86-64V74393-01]# rpm -ivh MySQL-client-advanced-5.6.23-1.rhel5.x86_64.rpm 
Preparing... ########################################### [100%]
1:MySQL-client-advanced ########################################### [100%]
```
安装完成有个提示：
You will find that password in '/root/.mysql_secret'
这个目录中有第一次登录需要的密码；要记一下。
- 启动MySQL
```
[root@rhel204 MySQL 5.6.23-RMP]# /etc/init.d/mysql start
Starting MySQL........[ OK ]
[root@rhel204 MySQL 5.6.23-RMP]# /etc/init.d/mysql status
MySQL running (13003)[ OK ]
```

##### 登录MySQL
- 登录
mysql -u root -p 粘贴前文中那个目录下的初始密码；
- 设置密码
mysqladmin -uroot -p旧密码 password 新密码
最好手动输入不要粘贴，有些不能识别；

##### 创建创建数据库jira并为其赋权
- 创建用户
```
create user 'jira'@'%' identified by '123456';
flush privileges;
```
- 创建数据库
```
create databases jiradb character set utf8 collate utf8_bin;
```
- 为用户在这个数据库上赋予所有权限
```
grant all privileges on  jiradb.* to jira@'%' identified  by '123456'
flush privileges;
```
至此数据库准备完成。
数据库这一块，如果操作没有得到预期的结果，就查询你自己的具体问题吧；

#### JDK安装预配置
这一点就不在介绍了，网上实在太多。
```
export JAVA_HOME=/usr/local/jdk1.8.0_191
export JRE_HOME=$JAVA_HOME/jre
export CLASSPATH=.:$JAVA_HOME/lib/dt.jar:$JAVA_HOME/lib/tools.jar
```
#### JIRA Software 安装配置
- 这个请按照烂泥先生的流程来做，大佬还提供比较新的版本的破解:
[https://www.ilanni.com/?p=12119](https://www.ilanni.com/?p=12119)
- 如果不顺利也可以在参考另一篇：
[http://www.yfshare.vip/2017/05/09/%E9%83%A8%E7%BD%B2JIRA-7-2-2-for-Linux/](http://www.yfshare.vip/2017/05/09/%E9%83%A8%E7%BD%B2JIRA-7-2-2-for-Linux/)

#### JIRA使用参考
[https://www.jianshu.com/p/145b5c33f7d0](https://www.jianshu.com/p/145b5c33f7d0)
[https://www.jianshu.com/p/975385878cde](https://www.jianshu.com/p/975385878cde)
[http://www.confluence.cn/pages/viewpage.action?pageId=1671211](http://www.confluence.cn/pages/viewpage.action?pageId=1671211)

#### 后记
想来也是惭愧从接到任务到完成这个部署以及写完这个文章整整两天半花了出去；
起初在RedHat5.8上安装Mysql5.6，个人感觉是真是老牛拉新车；
厌烦，所以打算在本地mac上搭建一下，但我的Mysql数据库是8.0.11，能连接成功(补充一句，mysql-connect的jar包请使用5.1.44),但是在部署JIRA时，初始化有问题，官方不支持；
转去RedHat5.8，好不容易弄好了数据库却又安装了一个 JIRA core ,这玩意又少功能；删除，重来。
终于成功：放个图高兴一些；
![](https://ws1.sinaimg.cn/large/005Owz0qly1fy54nbagc0j318c0l8di0.jpg)

###### 文章如有错误，欢迎指正