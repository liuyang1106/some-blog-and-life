// 冒泡排序，主要是交换，得到最后排序的数组
// 每轮挑选出最大的
function bubbleSort(arr) {
  if (arr.length <= 1) return arr;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[i] > arr[j]) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
  }
  return arr;
}
// 优化自己的冒泡排序
// 算法原理，1.前后同时遍历，找到最大的最小的，并且下次排序去掉头尾
function betterBubbleSort(arr) {
  let low = 0,
    high = arr.length - 1;
  while (low < high) {
    for (let i = low; i < high; i++) {
      // 找打最小的放在最前面
      if (arr[i] < arr[low]) {
        [arr[i], arr[low]] = [arr[low], arr[i]];
        low++;
      }
    }
    for (let i = high; i >= low; i--) {
      //找到最大的放最后面
      if (arr[i] > arr[high]) {
        high--;
        [arr[i], arr[high]] = [arr[high], arr[i]];
      }
    }
  }
  return arr;
}
