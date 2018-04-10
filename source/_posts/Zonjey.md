---
title: 创智优品面试总结
date: 2018-04-10 22:00:49
tags: Interview
categories: Interview
---
4.08号，创智优品面试，学长内推，一面被拒。两个算法题；
<!--more-->

#### 数据结构与算法
##### 题目一：
给你一棵二叉树，找到距离最远的两个节点；
（从A节点出发，可以向上或者向下走，沿途的节点只能经过一次，当到达B节点时，路径上的节点数叫做A到B的距离）
思路：分三种情况假设给出的根为root
- root的左子树上的最大距离；
- root的右子树上的最大距离；
- 跨越root，左子树距离root的最远距离 + 1 + 右子树距离root最远的距离；
在这三个距离中取最大的一个就是所求；
代码：
```
// 我们需要一个独立于递归函数之外的变量，不受递归影响，还要递归函数能够改变，所以采用了一个record；
private static int maxDistance(Node head) {
  int[] record = new int[1];
  return posOrder(head, record);
}
// 递归函数，设置递归，确定边界；
private static int posOrder(Node head, int[] record) {
  if(head == null) {
    record[0] = 0;
    return 0;
  }
  int lmax = posOrder(head.left, record);
  int maxfromLeft = record[0];
  int rmax = posOrder(head.right, record);
  int maxfromRight = record[0];
  int curNodeMax = maxfromLeft + maxfromRight + 1;
  record[0] = Math.max(maxfromLeft, maxfromRight) + 1;
  return Math.max(Math.max(lmax, rmax), curNodeMax);
}
```
##### 题目二：手写快速排序；
这个就直接上代码：
```
import java.util.Arrays;
public class quick_sort {

	public static void main(String[] args) {
		int[] arr = {1,4,7,2,5,8,3,6,9,5,4};
		quickSort(arr, 0, arr.length-1);
		System.out.println("最终结果：" + Arrays.toString(arr));
	}

	private static void quickSort(int[] arr, int i, int j) {
		if(i >= j)
			return ;
		else {
			int index = partition(arr, i, j);
			System.out.println("index: " + index);
			quickSort(arr, i, index-1);
			quickSort(arr, index+1, j);
		}
	}
	// 返回基准的下标
	private static int partition(int[] arr, int low, int heigh) {
		int key = arr[low];
		while(low < heigh) {
			// 这儿要说明的一点是：必须先从后往前比，因为前面用key记住了基准，空开了一个位置
			// 所以从后向前比较发现一个小于基准的数字，放在这个空开的位置；
			while(arr[heigh] >= key && low < heigh) {
				heigh--;
			}
			// 在后面找到了小于基准的数，放在基准前；同时后面空出了一个位置，所以从前面找一个
			// 大于基准的数，放在这个位置上；
			arr[low] = arr[heigh];
			//从前向后比较
			while(arr[low] <= key && low < heigh) {
				low++;
			}
			// 这儿就是在前面发现了一个大于基准的数，把他放在后面的位置上；
			arr[heigh] = arr[low];
			// 至此，小于基准的位于一边，大于基准的位于另一边；
			System.out.println("前后置换一次：" + Arrays.toString(arr));
		}
		arr[heigh] = key;
		return heigh;
	}
}
```
#### Java
##### java垃圾回收算法
1. 标记 - 清除
将需要回收的对象进行标记，然后清除。
不足：两点：效率问题和时间空间问题
- 标记和清除过程效率都不高
- 会产生大量碎片，内存碎片过多可能导致无法给大对象分配内存
之后的算法都是基于该算法进行改进。
2. 复制
- 将内存划分为大小相等的两块，每次只使用其中一块，当这一块内存用完了就将还存活的对象复制到另一块上面，然后再把使用过的内存空间进行一次清理。
- 主要不足是只使用了内存的一半。
- 现在的商业虚拟机都采用这种收集算法来回收新生代，但是并不是将内存划分为大小相等的两块，而是分为一块较大的 Eden 空间和两块较小的 Survior 空间，每次使用 Eden 空间和其中一块 Survivor。在回收时，将 Eden 和 Survivor 中还存活着的对象一次性复制到另一块 Survivor 空间上，最后清理 Eden 和 使用过的那一块 Survivor。HotSpot 虚拟机的 Eden 和 Survivor 的大小比例默认为 8:1，保证了内存的利用率达到 90 %。如果每次回收有多于 10% 的对象存活，那么一块 Survivor 空间就不够用了，此时需要依赖于老年代进行分配担保，也就是借用老年代的空间。
- IBM研究表明，98%的对象都是朝生夕死，
- 分配担保：存活对象超过了survivor的内存，通过分配担保机直接进入老年代
##### 一个需要理解的细节
在交流过程中有一个细节，没有掌握清楚，记录在下面
问题：分代垃圾回收中，既然复制算法效率高，速度快，为什么老年代没有采取复制算法？
- 复制算法适用的场景是大多数对象都有一个很短的生存期，所以复制时会有少量的对象被复制到survivor区；老年代正好与此相反，大多数对象都有一个比较长的生存期，所以会造成每一次回收都必须复制大量的对象，效率必然不高；
- 最根本的缺陷，复制算法在垃圾回收时，如果存活的对象所占的内存大于survivor区域，此时年轻代的解决方案是用老年代的内存做分配担保；如果复制算法用在了老年代垃圾回收上，因为老年代对象的生存期长，很可能会发生survivor区域内存不足，此时却没有任何区域给老年代做分配担保；
