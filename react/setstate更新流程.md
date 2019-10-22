## 详解 this.setState 更新流程

在 react 升级到 Fiber 架构后，以前的 this.setState({ })的批处理更新事务的机制已经背抛弃了。也就是网上找到的依靠 isBatchingUpdates （react 项目里全局已经搜不到这个变量了）这个标示，我在这里就自己探索了一下新版本 react 的调和机制 react-reconciler。其中 this.setState 整个流程就需要摸索清楚，fiber 是用来对 vDom 的 diff，就不用细究，我们关心组件的更新流程就够了

### 流程

1. setState 这个方法委托在 React.Component 的原型对象上

```javascript
Component.prototype.setState = function(partialState, callback) {
  invariant(
    typeof partialState === 'object' ||
      typeof partialState === 'function' ||
      partialState == null,
    'setState(...): takes an object of state variables to update or a ' +
      'function which returns an object of state variables.'
  );
  this.updater.enqueueSetState(this, partialState, callback, 'setState');
};
```

因此，实际 setState 执行的是 this 上的 updater.enqueueSetState 方法，我们既然没有传入这个 updater 结构，那么它肯定定义在原型上或者构造方法里面，我找到了这个 updater，在构造方法里，并找到了 updater 的对象结构 ReactNoopUpdateQueue：如下图

```javascript
function Component(props, context, updater) {
  this.props = props;
  this.context = context;
  this.refs = emptyObject;
  this.updater = updater || ReactNoopUpdateQueue;
}

const ReactNoopUpdateQueue = {
  isMounted: function(publicInstance) {
    return false;
  },
  enqueueForceUpdate: function(publicInstance, callback, callerName) {
    warnNoop(publicInstance, 'forceUpdate');
  },
  enqueueReplaceState: function(
    publicInstance,
    completeState,
    callback,
    callerName
  ) {
    warnNoop(publicInstance, 'replaceState');
  },
  enqueueSetState: function(
    publicInstance,
    partialState,
    callback,
    callerName
  ) {
    warnNoop(publicInstance, 'setState');
  }
};
```

现在我们知道了

```javascript
this.setState({ state });
// 等价
ReactNoopUpdateQueue.enqueueSetState.bind(
  this,
  publicInstance,
  partialState, // state
  callback, // 如果有cb()
  callerName
);
```

2. 找到 enqueueSetState 实际调用

```javascript
// 在react-reconciler找到下面的代码，
// 源码地址：https://github.com/facebook/react/blob/1022ee0ec140b8fce47c43ec57ee4a9f80f42eca/packages/react-reconciler/src/ReactFiberClassComponent.js

/**
 * 假如是class组件
 *
 */
function adoptClassInstance(workInProgress: Fiber, instance: any): void {
  instance.updater = classComponentUpdater; // function组件会有functionComponentUpdater
  workInProgress.stateNode = instance;
  setInstance(instance, workInProgress);
  if (__DEV__) {
    instance._reactInternalInstance = fakeInternalInstance;
  }
}
/**
 * 因此，一个class组件的updater会是下面这个数据结构classComponentUpdater
 * 只列出该结构的enqueueSetState代码，还有replaceSetState和其他属性
 */

const classComponentUpdater = {
  enqueueSetState(inst, payload, callback) {
    const fiber = getInstance(inst);
    // 计算当前的fiber节点
    const currentTime = requestCurrentTime();
    // 记录当前时间
    const suspenseConfig = requestCurrentSuspenseConfig();
    const expirationTime = computeExpirationForFiber(
      currentTime,
      fiber,
      suspenseConfig
    );
    // 这个update对象，是通过expirationTime（fiber的周期时间）和suspenseConfig（挂起时间）计算出来的
    const update = createUpdate(expirationTime, suspenseConfig);
    // 此时，我们传入的this.setState({ state }) 就是这里的payload
    update.payload = payload;
    if (callback !== undefined && callback !== null) {
      if (__DEV__) {
        warnOnInvalidCallback(callback, 'setState');
      }
      update.callback = callback;
    }
    // 真正开始调用更新
    enqueueUpdate(fiber, update);
    // 记录当前fiber节点的更新时间
    scheduleWork(fiber, expirationTime);
  }
  //  ...省略了其他代码
};
```

3. 上面已经看到，实际配置好 fiber 对象和 updater 对象后，会真正调用 enqueueUpdate 方法进行更新，找到 enqueueUpdate 这个方法
   ，在 https://github.com/facebook/react/blob/1022ee0ec1/packages/react-reconciler/src/ReactUpdateQueue.js

```javascript
// 为了看到最简洁的代码，我删除了enqueueUpdate的注释和dev环境下的代码，可能只看这个enqueueUpdate入更新队列有点懵逼，我找到了Fiber的构造方法
export function enqueueUpdate<State>(fiber: Fiber, update: Update<State>) {
  const alternate = fiber.alternate;
  // fiber节点的alternate代表着当前节点的缓存（自己的上一个Fiber，因为所有的Fiber节点都需要updateQueue更新）
  let queue1;
  let queue2;
  // 整个判断就是为了计算当前的Fiber和和上一个Fiber节点的更新的queue给下一个if判断使用，
  // 目的就是为了判断queue1和queue2也就是当前Fiber和上一个计算的Fiber是否是一样的
  if (alternate === null) {
    // 如果没有上一个Fiber节点，那么当前Fiber节点就是要入队列的Fiber节点，fiber.updateQueue默认就是null
    queue1 = fiber.updateQueue;
    queue2 = null;
    if (queue1 === null) {
      // 并且记录下 updateQueue 为当前的更新节点，记录当前的state
      // 此时 queue1 就是要进入更新队列的对象并且 queue2 = null
      queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
    }
  } else {
    // 此时fiber.alternate不是null，此时alternate就是上一个this准备更新时的Fiber节点
    // 此时queue1的queue2代表上一个Fiber和当前的Fiber
    queue1 = fiber.updateQueue;
    queue2 = alternate.updateQueue;

    if (queue1 === null) {
      if (queue2 === null) {
        // 如果当前Fiber的updateQueue是空的并且queue2也是空的，
        // 那么queue1和queue2都需要计算各自当前Fiber节点的updateQueue
        queue1 = fiber.updateQueue = createUpdateQueue(fiber.memoizedState);
        queue2 = alternate.updateQueue = createUpdateQueue(
          alternate.memoizedState
        );
      } else {
        // 如果当前Fiber（queue1）的updateQueue是空的并且queue2不是空的，
        // 那么只需要计算queue1 对应Fiber节点的updateQueue
        queue1 = fiber.updateQueue = cloneUpdateQueue(queue2);
      }
    } else {
      if (queue2 === null) {
        // 如果当前queue1不是空的并且queue2是空的
        // 那么计算queue2的updateQueue
        queue2 = alternate.updateQueue = cloneUpdateQueue(queue1);
      } else {
      }
    }
  }
  // 此时queue1不可能是null了
  if (queue2 === null || queue1 === queue2) {
    // 如果queue2是空的，说明之前的Fiber的updateQueue节点就是null，就不需要假如更新队列
    // 另外如果两个队列是完全一样的，那么只需要加入最新的Fiber节点，计算queue1的updateQueue就可以了
    appendUpdateToQueue(queue1, update);
  } else {
    if (queue1.lastUpdate === null || queue2.lastUpdate === null) {
      // 如果queue1和queue2都是最新的需要更新的节点，那么都需要加入更新队列
      // 比如onClick =  this.setState({ name: 'leo' }) && this.setState({ age: 23 })
      appendUpdateToQueue(queue1, update);
      appendUpdateToQueue(queue2, update);
    } else {
      // queue2不是null，而且queue1！=queue2，那么只要新的Fiber节点加入更新队列就行了
      // 比如onClick =  this.setState({ title: 1 }) && this.setState({ title: 2 })，只需要让this.setState({ title: 2 })进入更新栈就可以了
      appendUpdateToQueue(queue1, update);
      queue2.lastUpdate = update;
    }
  }
}
// FiberNode方法，Fiber节点的构造方法 new FiberNode(tag, pendingProps, key, mode)
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

  // Effects
  this.effectTag = NoEffect;
  this.nextEffect = null;

  this.firstEffect = null;
  this.lastEffect = null;

  this.expirationTime = NoWork;
  this.childExpirationTime = NoWork;

  this.alternate = null;
}

const createFiber = function(
  tag: WorkTag,
  pendingProps: mixed,
  key: null | string,
  mode: TypeOfMode
): Fiber {
  return new FiberNode(tag, pendingProps, key, mode);
};
/**
 * 将用FiberNode计算后的updater加入更新队列
 */
function appendUpdateToQueue<State>(
  queue: UpdateQueue<State>,
  update: Update<State>
) {
  // Append the update to the end of the list.
  if (queue.lastUpdate === null) {
    // Queue is empty
    queue.firstUpdate = queue.lastUpdate = update;
  } else {
    queue.lastUpdate.next = update;
    queue.lastUpdate = update;
  }
}
```

### 结论

react 升级到 fiber 架构后，setState 是依旧 fiber 和 updater 计算是否需要加入更新栈控制是否更新自己的，以前的批量处理的工作已经在
enqueueUpdate 的时候过滤了（计算上一个 queue 和下一个 queue 是否一样）。如果 queue 一样就只会让最新的 queue 进入更新队列了。
