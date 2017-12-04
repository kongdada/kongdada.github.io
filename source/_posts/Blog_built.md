---
title: 博客搭建过程
date: 2017-11-22 14:11:24
update: 2017-11-23 20:25:00
tags: Hexo next github
categories: Blog相关
---
#### 个人理解：
简单说一下个人对搭建理解：
- github相当于是服务器
-  hexo替生成漂亮的页面
<!-- more -->
-  通过hexo命令将生成的页面部署（就是上传）到github, github替你将这些页面保存起来。有人访问你的博客，github 就自己发给他。

#### 搭建过程：
- 博客搭建详细教程：[神秘链接](http://www.jianshu.com/p/f4cc5866946b)
- next主题配置教程：[神秘链接](http://theme-next.iissnan.com/getting-started.html)
- 搭建过程有上面两个教程就足够了，但是也不妨看看文档。
- Hexo文档：[神秘文档](https://hexo.io/zh-cn/docs/)

#### 个人遇到的问题：
1. hexo 无法安装，就是命令敲进去了没反应，或者安装一半卡死了。
    正常安装Hexo时卡死解决办法：
    > npm install -g cnpm --registry=https://registry.npm.taobao.org
    > cnpm install hexo-cli -g

#### 结束语：
- 新建文章： hexo new title             在本地新建了 .md 文件 
- 生成静态页面： hexo generate          在本地生成 html+css+js 文件
- 清除生成内容： hexo clean             清除本地生成的文件 
- 部署Hexo：hexo deploy                 将本地文件部署到 GitHub
- 最后说一句，了解一下超简单的几个MarkDown语法就可以轻松编辑 .md 文件。就是在写文章啦。
- [超简单的MarkDown写法](https://kongdada.github.io/2017/11/20/%E6%B5%8B%E8%AF%95%E6%96%87%E7%AB%A0/)

