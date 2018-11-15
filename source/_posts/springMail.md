---
title: 使用Spring中的JavaMailSender类和SimpleMailMessage类实现发邮件
date: 2018-11-14 20:08:26
tags: [Java, Spring, Mail]
categories: Spring
---
最近在有一个需求需要以邮件附件的形式发送一些数据给指定的一些账户。鉴于现有的框架我们需要使用avaMailSender类和SimpleMailMessage类实现发邮件。
<!-- more -->
首先你需要一个Maven管理的Web工程。
#### 准备一个邮箱作为发件人
#### 使用代码发送邮件