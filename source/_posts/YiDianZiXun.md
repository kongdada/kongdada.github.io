---
title: 一点资讯技术面总结
date: 2018-04-19 20:26:07
tags: 算法 Linux
categories: Interview
---
感谢一点资讯给的面试机会；
以前文章提到过的不在赘述，记录新的知识点。
<!--more-->
#### Linux
Linux命令用法查询网站：[Click to jump](http://man.linuxde.net/)
##### wc
wc统计文件里面有多少单词，多少行，多少字符。
语法:
[root@www ~]# wc [-lwm]
选项与参数：
-l  ：仅列出行；
-w  ：仅列出多少字(英文单字)；
-m  ：多少字符；
eg:
默认使用wc统计/etc/passwd
- #wc /etc/passwd
40   45 1719 /etc/passwd
40是行数，45是单词数，1719是字节数
- #wc -l /etc/passwd   #统计行数，在对记录数时，很常用
40 /etc/passwd       #表示系统有40个账户
- #wc -w /etc/passwd  #统计单词出现次数
45 /etc/passwd
- #wc -m /etc/passwd  #统计文件的字符数
1719
##### grep
grep（global search regular expression(RE) and print out the line，全面搜索正则表达式并把行打印出来）是一种强大的文本搜索工具，它能使用正则表达式搜索文本，并把匹配的行打印出来。
常见用法：
- 在文件中搜索一个单词，命令会返回一个包含“match_pattern”的文本行：
grep match_pattern file_name
grep "match_pattern" file_name
在多个文件中查找：
grep "match_pattern" file_1 file_2 file_3 ...
- 输出除了匹配到的之外的所有行 -v 选项：
grep -v "match_pattern" file_name
- 使用正则表达式 -E 选项：
grep -E "[1-9]+"
或
egrep "[1-9]+"
- 统计文件或者文本中包含匹配字符串的行数 -c 选项：
grep -c "text" file_name
- 输出包含匹配字符串的行数 -n 选项：
grep "text" -n file_name
或
cat file_name | grep "text" -n
#多个文件
grep "text" -n file_1 file_2
##### date
- 格式化输出：
 date + "%Y%m%d"
- 前一天：
 date -d "1 day ago" + date +"%Y-%m-%d"
 - 加减操作：
date +%Y%m%d                   //显示前天年月日
date -d "+1 day" +%Y%m%d       //显示前一天的日期
date -d "-1 day" +%Y%m%d       //显示后一天的日期
date -d "-1 month" +%Y%m%d     //显示上一月的日期
date -d "+1 month" +%Y%m%d     //显示下一月的日期
date -d "-1 year" +%Y%m%d      //显示前一年的日期
date -d "+1 year" +%Y%m%d      //显示下一年的日期
- 设定时间：
date -s                //设置当前时间，只有root权限才能设置，其他只能查看
date -s 20120523       //设置成20120523，这样会把具体时间设置成空00:00:00
date -s 01:01:01       //设置具体时间，不会对日期做更改
date -s "01:01:01 2012-05-23"  //这样可以设置全部时间
date -s "01:01:01 20120523"    //这样可以设置全部时间
date -s "2012-05-23 01:01:01"  //这样可以设置全部时间
date -s "20120523 01:01:01"    //这样可以设置全部时间
##### crontab
用户任务调度：用户定期要执行的工作，比如用户数据备份、定时邮件提醒等。用户可以使用 crontab 工具来定制自己的计划任务。所有用户定义的crontab文件都被保存在/var/spool/cron目录中。其文件名与用户名一致，使用者权限文件如下：
/etc/cron.deny     该文件中所列用户不允许使用crontab命令
/etc/cron.allow    该文件中所列用户允许使用crontab命令
/var/spool/cron/   所有用户crontab文件存放的目录,以用户名命名

crontab文件的含义：用户所建立的crontab文件中，每一行都代表一项任务，每行的每个字段代表一项设置，它的格式共分为六个字段，前五段是时间设定段，第六段是要执行的命令段，格式如下：
> minute   hour   day   month   week   command     顺序：分 时 日 月 周

其中：
minute： 表示分钟，可以是从0到59之间的任何整数。
hour：表示小时，可以是从0到23之间的任何整数。
day：表示日期，可以是从1到31之间的任何整数。
month：表示月份，可以是从1到12之间的任何整数。
week：表示星期几，可以是从0到7之间的任何整数，这里的0或7代表星期日。
command：要执行的命令，可以是系统命令，也可以是自己编写的脚本文件。
在以上各个字段中，还可以使用以下特殊字符：
星号（*）：代表所有可能的值，例如month字段如果是星号，则表示在满足其它字段的制约条件后每月都执行该命令操作。
逗号（,）：可以用逗号隔开的值指定一个列表范围，例如，“1,2,5,7,8,9”
中杠（-）：可以用整数之间的中杠表示一个整数范围，例如“2-6”表示“2,3,4,5,6”
正斜线（/）：可以用正斜线指定时间的间隔频率，例如“0-23/2”表示每两小时执行一次。同时正斜线可以和星号一起使用，例如*/10，如果用在minute字段，表示每十分钟执行一次。
[详细用法链接：](http://man.linuxde.net/crontab)
#### 数据结构与算法
##### 给出一个数组{0，1，1，1，2，2，3，3，4，4，5，6，7，8，8}，求出现次数最多的那个数字出现次数，显然应该返回1，出现3次；
当时的想法是采用桶，给出数组中的元素做下标，出现一次，对应桶的值+1；
但有问题，如果给出的数组特别大，那么空间复杂度就高，甚至内存溢出；
所以采取新的思路，用HashMap<Integer, Integer>,数组元素做key，出现次数做value;遍历数组，出现一次，value++；
代码：
```
package YiDianZiXun;
import java.util.HashMap;
// 找到出现次数最多的那个数，和出现的次数；
public class CountTimes {

	public static void main(String[] args) {
		int[] arr = { 0, 1, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 8, 8 };
		int[] res = MaxTimes(arr);
		System.out.println("数字：" + res[0] + " 出现次数： " + res[1]);
	}

	private static int[] MaxTimes(int[] arr) {
		if(arr == null || arr.length < 1)
			return new int[] {};
		HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();
		int times = 0;
		int num = 0;
		for (int i = 0; i < arr.length; i++) {
			if (map.get(arr[i]) == null) {
				map.put(arr[i], 1);
			} else {
				Integer value = map.get(arr[i]) + 1;
				map.put(arr[i], value);
				if (value > times) {
					times = value;
					num = arr[i];
				}
			}
		}
		return new int[] { num, times };
	}
}
```
##### 给出一个数组{-1，0，1，2，3，0，1，4，-1，0}，求和为零的最长连续子序列；
思路：定义sum(i)是数组的前i项和；
我们假设从i+1位置到j位置的和为零，那么我们可以得到sum(i) == sum(j)；
计算sum(i)，用一个map记录这个和，以及这个和第一次出现的位置；
如果一个和不是第一次出现，也就是存在sum(i) == sum(j)；j > i；
那么从i+1 到 j位置的和就是零；长度为(j - i);
代码：
```
package YiDianZiXun;
import java.util.HashMap;

// 求一个数组所有子数组中和为零子数组长度最长的。
public class SubArrIsZero {

	public static void main(String[] args) {
		int[] arr = { -1, 0, 1, 2, 3, 0, 1, 4, -1, 0 };
		int len = GetMaxLength(arr);
		System.out.println(len);
	}

	private static int GetMaxLength(int[] arr) {
		if (arr == null || arr.length < 1)
			return 0;
		HashMap<Integer, Integer> map = new HashMap<Integer, Integer>();
		// 为了解决从开头第一个位置有一个子数组就是所求
		map.put(0, -1);
		int sum = 0;
		int len = 0;
		for (int i = 0; i < arr.length; i++) {
			sum += arr[i];
			if (!map.containsKey(sum)) {
				map.put(sum, i);
			} else {
				int left = map.get(sum);
				len = Math.max(len, (i - left));
			}
		}
		return len;
	}
}
```
##### 手撸快排
排序的重要性不言而喻，在我有限的面试中就已经手写了两次快排了;
归并，堆排序，都需要掌握；
##### 一个总结递推公式的题：
这类题只要有递推公式以及边界条件，剩下的就是代码优化；
有一个 2xN 的区域，现在用N个2x1的矩形去填充，问总共有多少种方式？
破题点：最后一块怎么放？
分情况：
最后一块竖着放，那么使用前n-1块的形成的方案数量等于用n块的方案数量；
最后一块横着放，那么第n-1块必然也是横着放，所以使用前n-2块形成的方案数量等于使用n块的方案数量；
那么总方案数量等于以上两种情况的和：f(n) = f(n-1) + f(n-2);
且f(1) = 1, f(2) = 2;
代码：
```
package YiDianZiXun;
// 矩形覆盖问题
public class Fibonacci {

	public static void main(String[] args) {
		int n = 3;
		int res = RectCover(n);
		System.out.println(res);
	}

	private static int RectCover(int target) {
		if (target == 0)
			return 1;
		if (target < 3)
			return target;
		int pre = 1;
		int cur = 2;
		int res = 0;
		for (int i = 3; i <= target; i++) {
			res = pre + cur;
			pre = cur;
			cur = res;
		}
		return res;
	}
}
```
#### SQL
##### between and 用法；
