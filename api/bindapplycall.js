// call的本质是冒充context
if (!Function.prototype.call2) {
  Function.prototype.call2 = function(context, ...rest) {
    context.fn = this;
    let result = context.fn(...rest);
    delete context.fn;
    return result;
  };
}

// apply的本质是冒充context
if (!Function.prototype.apply2) {
  Function.prototype.apply2 = function(context) {
    context.fn = this;
    let result = null;
    if (arguments[1]) {
      result = context.fn(arguments);
    } else {
      result = context.fn();
    }
    delete context.fn;
    return result;
  };
}

// bind的本质是绑定上下文，并且提供额外参数
// 第一步，确定是否被bind过，所以return出去的fn必须判断一次this instanceof self
// 第二部，寄生，使用一个空函数的实例当resfn的原型
Function.prototype.bind2 = function(context, ...rest) {
  if (typeof this != 'function') {
    throw Error('只有function才可以使用这个');
  }
  let fn = this;
  let args = [...rest];
  let resfn = function() {
    return fn.apply(
      this instanceof resfn ? this : context,
      arguments.concat(args)
    );
  };
  function tmp() {}
  tmp.prototype = this.prototype;
  resfn.prototype = new tmp();
  return resfn;
};
