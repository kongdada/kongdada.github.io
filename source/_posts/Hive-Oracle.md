---
title: 从Hive导出数据到Oracle数据库--Sqoop
date: 2017-12-01 09:48:59
tags: Hive
categories: Hive
---
实习老大让我把Hive中的数据导入Oracle数据库。摸索成功后记录如下：
首先解释一下各行代码：
<!--more-->``` 
sqoop export
# 指定要从Hive中导出的表
--table TABLE_NAME    
# host_ip:导入oracle库所在的ip:导入的数据库
--connect jdbc:oracle:thin:@HOST_IP:DATABASE_NAME 

# oracle用户账号
--username USERNAME
# oracle用户密码
--password PASSWORD 

# hive表数据文件在hdfs上的路径
--export-dir /user/hive/test/TABLE_NAME
# 指定表的列名，必须指定 
--columns ID,data_date,data_type,c1,c2,c3 

# 列分隔符(根据hive的表结构定义指定分隔符)
--input-fields-terminated-by '\001'
# 行分隔符
--input-lines-terminated-by '\n' 

# 如果hive表中存在null字段，则需要添加参数，否则无法导入
--input-null-string '\\N' 
--input-null-non-string '\\N'```
不知道表存在哪儿了: ` show create table table_name;`
然后来个小栗子：```
sqoop export \
--connect jdbc:oracle:thin:@172.12.12.102:orcl \
--username test \
--password kong \
--table table_abc \
--export-dir /user/hive/warehouse/bonc_gjj.db/table_abc \
# 注意，这一行columns不能有多余的空格，否则会报错。
--columns zzjgdm,jgmc,jglx,jjlx,frdbhfzr,xzqhdm,yzbm,tzgb,hbzl,jgdz,dh,yxqzfrq,zczj,njq0,fzrq,zzzt,pzwhhzch,bfdw,lastdate,id,dir_id,dir_ver,dir_ver_serail_num,addtime,updatetime,edituser_id,edituser,editdept_id,editdept,inserttype,is_valid,audit_status,pk_md5,sys_encrypt \
--input-fields-terminated-by '\001' \
--input-lines-terminated-by '\n' \
--input-null-string "\\\\N" \
--input-null-non-string "\\\\N" ```
最后，表那么多，总不能一张一张手动导入吧，那就来个脚本吧。hh
脚本奉上，简单的要死，看看就会：```
#!/bin/bash 
a=0;
b=1;
# ``这两个反斜点，就是说里面这是一个变量，我的have_data_table_name是一个文件，里面存的是一堆表名。
# cat file_name，自己试试什么效果。for 开始循环表名。
for table_name in `cat ./have_data_table_name`
    do
    a=`expr $a + $b`
    echo "表名：$table_name,计数：$a";
    echo  "开始导入数据！"
    # 这一行就厉害了，简单来说就是取出一张表的所有列名，每个列名后加个逗号，然后去掉最后一个逗号，存在col这个变量中。
    col=`hive -e "desc database_name.${table_name}"|sed '1d'|awk '{printf $1","}'|sed 's/,$/\n/g'`

sqoop export \
--connect jdbc:oracle:thin:@172.12.12.102:1521:orcl \
--username test \
--password kong \
--table ${table_name} \
--export-dir /user/hive/warehouse/database_name.db/${table_name} \
--columns ${col} \
--input-fields-terminated-by '\001' \
--input-lines-terminated-by '\n' \
--input-null-string "\\\\N" \
--input-null-non-string "\\\\N"

    echo "第${a}张表导入完毕！";
done ```
最后你就可以一边喝茶，一边看电脑跑脚本，数据就这么被导入了。