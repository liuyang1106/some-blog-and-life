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
