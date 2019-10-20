## react 版本：v16.10.0

1. render 函数是纯函数。同样的 state 和 props 会 render 出相同的结果。
2. 只有 state 才可以引起组件更新（props 变化是因为父亲 state 变化）
3. jsx 最后会被转化为 ReactElement
4. React 组件生命周期是一个状态机
   3 种不同状态下的生命周期：
   挂载时：constructor ==>> static getDerivedStateFromProps() ==>> render() ==>> componentDidMount()
   更新时：static getDerivedStateFromProps() ==>> shouldComponentUpdate() ==>> render() ==>> getSnapshotBeforeUpdate() ==>> componentDidUpdate()
   卸载时：componentWillUnmount()
5. setState 触发更新批量更新事务。更新信息记录在 Update 数据结构中，更新队列是 UpdateQueue。
6. 使用 Fiber 计算得到新的 state 和 props。重复步骤 1。另外：FiberNode 上记录了当前节点的 updateQueue 信息。（fiber 记录了）
7. ReactDOM 插入 DOM 节点

### 记录下了一些源码链接

```bash
# ReactElement:  https://github.com/facebook/react/blob/master/packages/react/src/ReactElement.js
# ReactFiber:  https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactFiber.js
# ReactUpdateQueue:  https://github.com/facebook/react/blob/master/packages/react-reconciler/src/ReactUpdateQueue.js
```

### 下面是一些重要的 React 中用到的数据结构，所有代码都是伪代码，从源码拿出来的。都是生产模式下的部分重要属性。

```javascript
ReactElement = {
  // This tag allows us to uniquely identify this as a React Element
  $$typeof: REACT_ELEMENT_TYPE,
  // Built-in properties that belong on the element
  type: type,
  key: key,
  props: props
};

// 下面的这一些属性是 FiberNode 的部分属性
function FiberNode(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
) {
  // Instance
  this.tag = tag;
  this.key = key;
  this.elementType = null;
  this.type = null;
  this.stateNode = null;

  // Fiber
  this.return = null;
  this.child = null;
  this.sibling = null;
  this.index = 0;

  this.ref = null;

  this.pendingProps = pendingProps;
  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;

  this.mode = mode;
}

export type Update<State> = {
  expirationTime: ExpirationTime,
  suspenseConfig: null | SuspenseConfig,

  tag: 0 | 1 | 2 | 3,
  payload: any,
  callback: (() => mixed) | null,

  next: Update<State> | null,
  nextEffect: Update<State> | null,

  //DEV only
  priority?: ReactPriorityLevel
};

export type UpdateQueue<State> = {
  baseState: State,

  firstUpdate: Update<State> | null,
  lastUpdate: Update<State> | null,

  firstCapturedUpdate: Update<State> | null,
  lastCapturedUpdate: Update<State> | null,

  firstEffect: Update<State> | null,
  lastEffect: Update<State> | null,

  firstCapturedEffect: Update<State> | null,
  lastCapturedEffect: Update<State> | null
};
```
