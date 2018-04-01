---
title: vivo技术面试总结-大数据开发岗
date: 2018-03-20 09:59:04
tags: Interview
categories: Interview
---
稀里糊涂过了笔试，很幸运的得到了面试机会，背着我的小书包，挤着地铁就去了西土城面试；
<!--more-->
#### 自我介绍
这部分就不多说了，我说的也不好，大致介绍了一下个人的基本情况；
#### 数据结构
-	 给100W个区间，不重叠。给出一个数N，求这个数在那个区间。空间复杂度要求我看到了，但估计我太菜了，人家没问;
给出想法：
- 把所有区间的右边界，用一个数组存起来;
- 给数组排序;
- 二分查找，找到最后一个区间，返回右边界。这就是所在区间的右边界;
要求写出大概的代码：
现场我没写出来，时间有点紧，我有点菜；```
	package vivo;
	import java.util.Arrays;
	public class search100w {
		public static void main(String[] args) {
			int n = 89;
			int[] arr = {5,10,20,30,40,60,50,55,100,95,90};
			Arrays.sort(arr);
			System.out.println(Arrays.toString(arr));
			int index = binarySearch(arr,n);
			System.out.println("区间的右边界是： " + arr[index]);
		}
		private static int binarySearch(int[] arr, int n) {
			int low = 0;
			int heigh = arr.length-1;
			while(low < heigh) {
				int mid = (low+heigh)/2;
				if(n < arr[mid])
					heigh = mid - 1;
				else
					low = mid + 1;
				System.out.println(low +" "+ heigh);
			}
			return heigh+1;
		}
	}```

#### JAVA
1. 接口，抽象类，以及实现，问能不能写一个小栗子，说明一下区别；优缺点，大概这个样子。
我大致说了一下，但是没写出小例子;
大致区别：
接口支持多实现，类不支持多继承，这样接口更利于扩展；
实现接口，必须实现接口中的所有方法，继承抽象类，却不一定要实现他的所有方法；
接口中成员变量都必须被public static final,成员函数都必须被public abstract修饰，抽象类中可以用public protected default abstract;
抽象类的方法可以有默认实现，但是接口不可以;
抽象类的速度要比接口快;
添加新方法：接口，要添加就必须修改实现类，抽象函数却可以有默认的实现;
2. HashMap与HashTable的区别：
底层数据结果哈希表，特点和HashMap是一样的;
Hashtable线程安全集合，运行速度慢;
HashMap线程不安全的集合，运行速度快;
Hashtable命运和Vector是一样的，从JDK1.2开始，被更先进的HashMap取代;
HashMap允许存储nu11值，nu11键;
Hashtable 不允许存储nu11值，nu11键;
源码比较：http://blog.csdn.net/ns_code/article/details/36034955
3. HashMap存储，两个键值对中key如果哈希值相同是怎么存储的?
哈希值相同，但内容不相同，采用桶存储;
哈希值相同，equals()比较内容也相同的话，就不存储，因为这个情况下，key相等，不允许这种情况发生;
扩充：
HashMap和和Hashtable都是基于哈希表存储数据的，具体就是：内部维护了一个存储数据的Entry数组，HashMap采用链表解决冲突，每一个Entry本质上是一个单向链表。当准备添加一个key-value对时，首先通过hash(key)方法计算hash值，然后通过indexFor(hash,length)求该key-value对的存储位置，计算方法是先用hash&0x7FFFFFFF后，再对length取模，这就保证每一个key-value对都能存入HashMap中，当计算出的位置相同时，由于存入位置是一个链表，则把这个key-value对插入链表头。
4. StringBuffer与StringBuilder的比较：
前者线程安全，但是速度慢，后者线程不安全，但速度快。
StringBuilder类提供与StringBuffer 相同的方法。

#### Linux
说自己用过的Linux命令：ls ll la, cat more tail, cd, vi, mkdir touch mv cp scp ftp, chomd, cut sed awk;
基本就是这样了，这部分平时用就肯定脱口而出，都没问怎么用的，感觉会不会一眼就看得出来;

#### 自己介绍一下了解的hadoop
- hadoop三个组件，HDFS, MapReduce,Yarn;
- HDFS: 分布式存储框架，namenode, secondnamenode, dataname, 元数据，持久化的命名空间镜像文件，编辑日志。HA高可用;
- MapReduce: map-shuffle-reduce ,shuffle: combiner, partition, sort, copy, sort;
- Yarn: Resouce Manage, Application Manage, Namenode Manage;
这一部分我自己了解的比较清楚，名词都大致有个解释。

#### 地图的导航功能背后是怎么存储数据的额，他又是怎么做到精确导航的；
没答上来,人家就没扩展直接跳过了；
#### 笔试的一个题
- 寻找最长的重叠字符串，abcabc这种定义位重叠字符串``` 
	package vivo;
	import java.util.Arrays;
	public class FindRepeat {

		public static void main(String[] args) {
			String str = "abcdefefvivovivoghijghijk";
			char[] ch = str.toCharArray();
			System.out.println(Arrays.toString(ch));
			String childStr = null;
			int maxLength = 0;
			String res = null;
			for(int i=0; i<ch.length; i++) {
				for(int j=i+1; j<=ch.length; j++) {
					childStr = new String(ch, i ,j-i);
	//				System.out.println(childStr);
					int first = str.indexOf(childStr);
					int last = str.lastIndexOf(childStr);
					if(first != last && childStr.length()>maxLength) {
						res = childStr;
	//					System.out.println("res :" +res);
						maxLength = childStr.length();
					}
				}
			}		
			System.out.println(res);
		}
	}```
