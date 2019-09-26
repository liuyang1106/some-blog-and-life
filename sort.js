// 冒泡排序，主要是交换，得到最后排序的数组
// 原理很简单，就是相邻的两个元素交换，把最大的那个浮出水面，就撑之为冒泡
function bubbleSort(arr) {
  console.time('bubbleSort：');
  if (arr.length <= 1) return arr;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  console.timeEnd('bubbleSort：');
  return arr;
}
//结论
bubbleSort([1, 2, 4, 5, 6, 78, 9, 21, 4, 1, 2]);
// 优化自己的冒泡排序
// 算法原理，1.前后同时遍历，找到最大的最小的，并且下次排序去掉头尾
function betterBubbleSort(arr) {
  console.time('betterBubbleSort');
  let low = 0,
    high = arr.length - 1;
  while (low < high) {
    // 只找出最小的那个
    for (let i = low; i < high; i++) {
      if (arr[i] > arr[i + 1]) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      }
    }
    for (let i = high; i > low; i--) {
      if (arr[i] < arr[i - 1]) {
        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      }
    }
    low++;
    high--;
  }
  console.timeEnd('betterBubbleSort');
  return arr;
}
// 结论
betterBubbleSort([1, 2, 4, 5, 6, 78, 9, 21, 4, 1, 2]);
