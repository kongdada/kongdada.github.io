---
title: 日志易技术面总结
date: 2018-03-29 22:00:25
tags: Interview
categories: Interview
---
感谢日志易给的面试机会，感谢技术面大佬；
最后厚着脸皮要了个评语：基础知识还行，但是不够熟练，不能用起来，代码量太少，一看就没写过多少代码；
被看穿，情理之中，我没想过要隐藏什么；
<!--more-->
#### 笔试
这一部分的话，回忆几个比较重要的（我回答错）点。
##### 字符串初始化与 == 比较
题目：```
		String str1 = "hello";
		String str2 = "he" + new String("llo");
		String str3 = "he" + "llo";
		System.out.println(str1 == str2);
		System.out.println(str1 == str3);```
结果：false  true
##### 自增与等于结合
题目：```
		int i = 1;
		int y = ++i;
		System.out.println(i + " " + y);```
结果: 2 2
##### 不同修饰符，修饰后能引用的范围：
public:  同一类，同一包，子孙类，不同包；
protect: 同一类，同一包，子孙类；
default: 同一类，同一包；
private: 同一类；
##### 原生类与引用数据类型；
原生类就是指java的8种基本类型，byte short int long float double char boolean；
引用数据类型：数组，类，接口；
##### 进程与线程的区别
进程：是系统资源分配的基本单位，一个进程可以有多个线程；
线程：是CPU调度的基本类型，线程不拥有系统资源，可以访问隶属进程的资源；
##### 进程间的通信
- 管道（普通管道单向传递用在父子进程间，流管道可以双向传递用在父子进程间，命名管道单向传递可以用在不同进程间）
- 消息队列（克服了管道只能承载无格式字节流以及缓冲区受限）
- 套接字（可以用在不同机器的进程之间通信）；
- 共享内存：操作系统建立一块共享内存，映射到各个进程的地址，各个进程可以对这块共享内存进行读写，这是进程间通信的最快方式；

##### 线程间的通信
线程间的通信主要目的是用于线程同步
- 锁机制：互斥锁，读写锁，条件变量等；
- 信号量机制： 无名线程信号量，有名先线程信号量；
- 信号机制：类似与进程间的信号处理；

##### HashMap的底层实现，哈希表的结构，冲突怎么解决的？
##### 内存模型与垃圾回收
##### 设计模式的应用场景

#### 数据结构
##### 题目一：给出一个n,代表有从1到n的数字[1,2,3,··· n]，问可以构成多少种二叉搜索树？
一开始的想法是直接递归构造，时间复杂度是指数上升；
后来想法是找规律：
先看例子：
- n = 1, 有一个元素,可以构成一个二叉搜索树,左右都没有元素，总数量 = 左子树数量 * 右子树数量，记为f(1) = f(0) * f(0) = 1，这儿可以将f(0)初始化为1;
- n = 2, 1做根，那么左子树没有元素记为f(0),右子树有一个元素记为f(1), 2做根，左子树有一个元素，记为f(1),右子树没有元素记为f(0);
总共：f(2) = f(0) * f(1) + f(1) * f(0) = 2;
- n = 3, 1做根，数量 = f(0) * f(2), 2做根 数量 = f(1) * f(1), 3做根， 数量 = f(2) * f(0);
总共 f(3) = f(0) * f(2) + f(1) * f(1) + f(2) * f(0) = 5;
可以看出f(n),依赖与f(0)到f(n-1),换句话说可以有前面的n-1项推导出第n项；
分析关系表达式：
- 记h(k)为以k为根可以生成的二叉搜索树数量；
- 当以k为根时，他的左子树为[1,2 ··· k-1]构成，也就是左子树有k-1个元素构成，这个就可以记为f(k-1)；
- 右子树为[k+1 ··· n]构成，也就是右子树有n-k个元素构成，这个可以记为f(n-k)；
- 那么h(k) = f(k-1) * f(n-k); 要记得k的范围可以从1到n;
- 整合以上规律可得到：有n个元素的二叉搜索树的数量；f(n) = h(1)+h(2)+···+h(n) = ∑ h(k) ,0 < k <= n;
- 又因为h(k) = f(k-1) * f(n-k)得到：f(n) = ∑ f(k-1) * f(n-k); 0 < k <= n;
- 代码：输入n，输出可以构造出的二叉搜索树的数量；
- 时间复杂度O(n^3)；
```
	private static int BSCount(int n) {
		int[] res = new int[n+1];
		res[0] = 1;
		for(int i = 1; i<=n; i++) {
			for(int k=1; k<=i; k++) {
				res[i] += res[k-1] * res[i-k];
//				System.out.println(i + " k:" + k +" " + res[i]);
			}
		}
		return res[res.length-1];
	}
	```
##### 题目二：给出一个文本，每行一个单词，10000行以上，将类似与"good"与"godo"与"doog"，也就是单词所包含的字母出现次数一样，这类单词都定义同义词，现在输入一个单词，要求返回该单词的所有同义词；要求查询速度要快。
- 解析：这个方法是面试官告诉我的，我自己拿一套就不提了，太傻。
首先我们理解诉求，要查询快，当然用哈希表；
那么什么东西做key，什么东西做value;
因为要返回输入单词的所有同义词，那么value可以是一个字符串类型的数组；
我们将所有单个单词都进行排序，那么同义词都长一个样，我们就拿这个排序后的单词做key;
- 最难的部分解决了，说说流程；
我们需要一个HashMap<String, ArrayList<String>>,value是一个列表；
每次从文本读入一个单词，排序后做key,然后存入HashMap；
如果key存在，那么获得value的指向的ArrayList,将原本的单词，存入
个ArrayList;
如果key不存在，那么我们需要新建一个Arraylist,然后将读入的单词存入ArrayList,最后将ArrayList存入HashMap；
查询时记得，将输入的单词排序做key去查value;
- 代码如下：
```
package rizhiyi;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Scanner;

public class Synonym {

	public static void main(String[] args) throws Exception {
		Scanner sc = new Scanner(System.in);
		String str = sc.next();
		sc.close();
		File file = new File("H:\\java\\example.txt");
		ArrayList<String> arr  = countSameword(str, file);
		System.out.println(arr.toString());
	}

	private static ArrayList<String> countSameword(String s1, File file) throws IOException {
		BufferedReader bfr =
				new BufferedReader(new FileReader(file));
		String line = null;
		HashMap<String, ArrayList<String>> map = new HashMap<String, ArrayList<String>>();
		while((line = bfr.readLine()) != null) {
			char[] ch = line.toCharArray();
			Arrays.sort(ch);
			String str = new String(ch);
			if(map.get(str) != null) {
				ArrayList<String> value = map.get(str);
				value.add(line);
			}else {
				ArrayList<String> arr = new ArrayList<String>();
				arr.add(line);
				map.put(str, arr);
			}
		}
		bfr.close();
		char[] chRes = s1.toCharArray();
		Arrays.sort(chRes);
		s1 = new String(chRes);
		return map.get(s1);
	}
} ```

##### 题目三：给出2^200次最简单的算法，并且证明算法是最简单的。
- 这个问题我还没有思路解决在数学上证明方法是最简单的；
但是在书上找到了一种相对简单的方法；
- 先将200转为二进制表示法，11001000；
- 2^200 = 2^128 * 2^64 * 2^8;   
在这个过程中我们只需要计算2^1 2^2 2^4 2^8 2^16 2^32 2^64 2^128,也就是二进制有多少位，我们就需要计算多少次；
- 在计算最后结果时，只需要二进制对应是1的地方累乘，计算对应0的地方不需要累乘；
- 没有考虑大数
- 代码：
```
package rizhiyi;

public class bigPower {

	public static void main(String[] args) {
		int n = 4;
		String str = Integer.toBinaryString(n);
		// System.out.println(str);
		char[] ch = str.toCharArray();
		long[] res = new long[str.length()];
		res[0] = 1;
		res[1] = 2;
		long ans = 1;
		for (int i = 2; i < str.length(); i++) {
			res[i] = res[i - 1] * res[i - 1];
		}
		for (int j = ch.length - 1; j >= 0; j--) {
			if (ch[j] == '1') {
				ans *= res[res.length-1-j];
			}
		}
		System.out.println(ans);
	}

}
```
