---
title: 伪分布式hadoop2.8.0安装与环境搭建
date: 2017-11-30 15:25:37
tags: "hadoop"
categories: Hadoops
---
#### 详细教程
这儿有篇宝典，简单有效，相见恨晚：[点击打开宝典](https://www.jianyujianyu.com/ubuntu16.04-hadoop2.8.0/)
<!--more-->
#### 安装SSH，配置SSH的无密码登录。
- 记得先更新一下APT：`sudo apt-get update`
- 安装个Vim ：`sudo apt-get install vim`
- 安装SSH服务：`sudo apt-get  install  openssh-server`
- 安装后登陆一下本机： `ssh localhost`
- 这时候是需要密码的，然后退出准备配置无密码登录： exit
- 开始:
	`cd  ~./ssh` 
    `ssh-keygen  -t  rsa`     #一直回车就行
    `cat  ./id_rsa.pub  >>  ./authorized_keys` #加入授权
#### 环境配置知识点。
1. 环境变量临时设置，直接在终端输入，属于临时设置。
`export  JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`
`export PATH=$JAVA_HOME/bin:$PATH`
2. 当前用户的全局设置
打开~/.bashrc，添加行：
`export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`
`export PATH=$JAVA_HOME/bin:$PATH`
使生效
 `source  ~/.bashrc` 
3. 所有用户的全局设置
`$ sudo vim  /etc/profile `
`export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64`
`export PATH=$JAVA_HOME/bin:$PATH`
使生效
`source   /etc/profile`
个人建议环境变量用第三种方式配置。
- 我的错误：配置环境时在这句中 ： `export PATH=$JAVA_HOME/bin:` 中没有写最后的$PATH.
后果就是所有的命令都无法正常使用了。怎么办呢？命令还在只是计算机没有办法自己找到。那就我们代劳。
解决方法：写命令的绝对路径，举个例子，假设 vim 这个命令在 /bin 下那么使用 vim 就要写  ./bin/vim  然后重新编辑环境变量。
#### jps 后没有namenode
解决办法：[点击转到解决办法](https://www.zhihu.com/question/31239901)
#### hadoop用户
最好直接新建 hadoop 用户，不要轻易尝试将当前用户名改为hadoop.这是个大坑，亲测。