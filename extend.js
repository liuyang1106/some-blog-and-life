// 寄生组合继承

function Parent(name) {
  this.name = name;
}

Parent.prototype.sayName = function() {
  console.log(this.name);
};
function Child(name) {
  Parent.call(this, name);
  this.age = age;
}

function extendFn(fatherPro) {
  function F() {}
  F.prototype = fatherPro;
  return new F();
}

Child.prototype = extendFn(Parent.prototype);
// 纠正this
Child.prototype.constructor = Child;

function findStr(k = 1, arr = []) {
  if (arr.length <= 1) return arr.length;
  let [a, b, c, d, e, f, g, h, i, j] = arr[0].split('');
}

function dealData(n) {
  var dp = new Array(100001);
  for (var k = 0; k < dp.length; k++) {
    dp[k] = 0;
  }
  dp[0] = 1;
  var coins = [1, 2, 5, 10];
  for (var i = 0; i < coins.length; i++) {
    for (var j = coins[i]; j < dp.length; j++) {
      dp[j] = dp[j] + dp[j - coins[i]];
    }
  }
  console.log(dp[n]);
}
dealData(10000);
