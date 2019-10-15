// 得出结论
// 满足下面条件的数组polyfill，都可以用reduce
// 1.只想要得出一个累积的结果
// 2.需要遍历

/**
 * 返回对象的类型
 * @param {any} obj
 */
function type(obj) {
  const typeList = 'Boolean Number String Function Array Date RegExp Object Error Symbol Undefined'.split(
    ' '
  );
  // null will return "object"
  if (obj === null) return typeof obj;
  const class2type = {};
  typeList.forEach(k => {
    class2type[`[object ${k}]`] = k.toLowerCase();
  });
  const objType = Object.prototype.toString.call(obj);
  return class2type[objType];
}

//数组扁平化
const __TEST__ARRAY__ = [1, [2], [3, [4]], [5, [6, [7, [8]]]]];
function flatten(array = []) {
  return array.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flatten(val)) : acc.concat(val),
    []
  );
}

// 数组去重
const deDuplicationArray = [1, 1, 2, 3, 3, 4, 5, 56, 2];

function deDuplication(array = []) {
  return array.reduce(
    (acc, cur) => (acc.indexOf(cur) === -1 ? acc.concat(cur) : acc),
    []
  );
}

console.log(flatten(__TEST__ARRAY__));
