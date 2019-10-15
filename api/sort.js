const testArray = [1, 2, 4, 5, 6, 78, 9, 21, 4, 1, 2]; //测试耗时用例
// 冒泡排序，主要是交换，得到最后排序的数组
// 原理很简单，就是相邻的两个元素交换，把最大的那个浮出水面，就撑之为冒泡
function bubbleSort(arr) {
  console.time('冒泡排序');
  if (arr.length <= 1) return arr;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  console.timeEnd('冒泡排序');
  return arr;
}
//结论
console.log(bubbleSort(testArray));
// 优化自己的冒泡排序
// 算法原理，1.前后同时遍历，找到最大的最小的，并且下次排序去掉头尾
function betterBubbleSort(arr) {
  console.time('优化后的冒泡排序');
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
  console.timeEnd('优化后的冒泡排序');
  return arr;
}
// 结论
console.log(betterBubbleSort(testArray));

// 快速排序
function quickSort(arr) {
  console.time('快速排序');
  if (arr.length <= 1) return arr;
  let left = [];
  let right = [];
  let minIndex = Math.floor(arr.length / 2);
  let mid = arr.splice(minIndex, 1)[0];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < mid) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  console.timeEnd('快速排序');
  return quickSort(left).concat([mid], quickSort(right));
}
console.log(quickSort(testArray));
