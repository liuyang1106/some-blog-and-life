## react-loadable: 在 react 组件层面做代码分割的包

### 使用方式如下，不过多介绍

```javascript
import Loadable from 'react-loadable';
import Loading from './my-loading-component';

const LoadableComponent = Loadable({
  loader: () => import('./my-component'),
  loading: Loading
});

export default class App extends React.Component {
  render() {
    return <LoadableComponent />;
  }
}
```

### 开始解析

1. 打开源码

```javascript
// 我们看到文件默认到处了这个变量，也就是我们使用的Loadable方法
module.exports = Loadable;
// 变量Loadable其实就是一个函数，调用了createLoadableComponent方法
function Loadable(opts) {
  return createLoadableComponent(load, opts);
  // 等价于 createLoadableComponent(load, { loader: () => import('./my-component'), loading: Loading })
}
// 找到createLoadableComponent方法，这个方法相对较长，定义如下
function createLoadableComponent(loadFn, options) {}
// 方法内部合并了 options，也就是我们传入的配置（我们也可以传入配置去覆盖）
let opts = Object.assign(
  {
    loader: null,
    loading: null,
    delay: 200,
    timeout: null,
    render: render,
    webpack: null,
    modules: null
  },
  options
);
// 我们也需要赵大loadFn方法，这个方法接受参数loader，也就是我们传入的配置 loader: () => import('./my-component'),
function load(loader) {
  let promise = loader();

  let state = {
    loading: true,
    loaded: null,
    error: null
  };

  state.promise = promise
    .then(loaded => {
      state.loading = false;
      state.loaded = loaded;
      return loaded;
    })
    .catch(err => {
      state.loading = false;
      state.error = err;
      throw err;
    });

  return state;
}

// 可以看到，这个内部的loadFn方法返回了一个Promise
// 而 createLoadableComponent()方法返回了一个组件
return class LoadableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: res.loading, // res是loadFn返回的Promise,(load方法返回的state)
      loaded: res.loaded // res.loaded返回的结果是ReactElement，挂载在res的loaded上
    };
  }
};

// 在这个高阶组件LoadableComponent中，组件在preload的时候init调用 loader: () => import('./my-component')加载真正需要挂载的组件（vDom，ReactElement），最终在render函数中render这个ReactElement（import('./my-component')完成后的组件）
// 下面的是render函数的代码
render() {
  if (this.state.loading || this.state.error) {
    return React.createElement(opts.loading, {
      isLoading: this.state.loading,
      pastDelay: this.state.pastDelay,
      timedOut: this.state.timedOut,
      error: this.state.error,
      retry: this.retry
    });
  } else if (this.state.loaded) {
    return opts.render(this.state.loaded, this.props);
  } else {
    return null;
  }
}

// 需要注意一下opts.render方法，这个方法兼容了CMD和ES6的两种导出的方法
// obj.default这种方式在webpack中会被做代码分割：https://webpack.js.org/migrate/3/#code-splitting-with-es2015
function resolve(obj) {
  return obj && obj.__esModule ? obj.default : obj;
}

function render(loaded, props) {
  return React.createElement(resolve(loaded), props);
}
```

### 总结

1. react-loadable 默认导出的是一个创建 LoadableComponent 组件的方法，在内部可以做如下配置

```javascript
  const options = {
    loader: null,
    loading: null,
    delay: 200,
    timeout: null,
    render: render,
    webpack: null,
    modules: null
  },
```

2. LoadableComponent 在加载的时候或者出现错误的时候会在 render 中显示 loading 组件，在 loading 结束后会 render 为需要 render 的组件，最终 render 的组件的信息保存在闭包的变量 res 中。
