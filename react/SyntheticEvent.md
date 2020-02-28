## React 合成事件

简述：React 内部使用的事件对象，是一个合成对象，那么这么对象是如何得到的了？因此有此文

### Event(原生事件对象) 和 SyntheticEvent(React 的合成事件对象)

如何创建一个原生事件对象？

```javascript
const event = new Event(typeArg, eventInit);
// mdn原生事件定义()[https://developer.mozilla.org/zh-CN/docs/Web/API/Event/Event]
```

如何使用一个 DOM 上使用原生事件对象？

1. 首先我们了解一下事情：所有的 DOM 元素都是 HTMLElement 对象 和 EventTarget 对象 的实例，并且 HTMLElement 的原型对象是一个 EventTarget 的实例， 下面的代码可以证明这一点：

```javascript
const aTag = document.createElement('div');
aTag instanceof HTMLElement; // true
aTag instanceof EventTarget; // true
HTMLElement.prototype instanceof EventTarget; // true
```

因此我们可以得出结论，所有的 DOM 元素是 EventTarget 的实例，可以访问 EventTarget 原型对象上的方法。

2. EventTarget 是什么？EventTarget 原型对象上的方法有什么？

- EventTarget 是什么？考虑下面的代码：

```javascript
let dom = document.createElement('div');
dom.addEventListener('click', e => console.log(e.target)); // e.target就是EventTarget的一个实例
dom.click();
```

很明显，`e.target`其实就是当前的 DOM 对象（就是 DOM 元素），那么现在明白了，其实 EventTarget 的实例就是绑在事件对象上的 target 对象。其实 MDN 上也没有对这个 EventTarget 对象做出过多的解释。

- EventTarget 原型对象上的方法有什么？

我们先生成一个它的实例：

```javascript
let evTarget = new EventTarget();
console.log(evTarget); //你会看到这三个方法
// addEventListener: ƒ addEventListener()
// removeEventListener: ƒ removeEventListener()
// dispatchEvent: ƒ dispatchEvent(）
```

由于上面说过，所有 DOM 元素都继承了 EventTarget 对象，原来我们再熟悉不过的`addEventListener removeEventListener`方法就是它的方法。我们这里不做更多的解释了。因为我们的主角是一个我们不常用的方法`dispatchEvent`，React 内部 `SyntheticEvent`的就是用它触发的。

3. SyntheticEvent 构造函数。ReactDOM 的合成事件的构造方法

- 既然所有的合成事件都是`SyntheticEvent`它的实例，那么我们看看 React 内部是怎么书写的

```javascript
// 核心代码
function SyntheticEvent(
  dispatchConfig,
  targetInst,
  nativeEvent,
  nativeEventTarget
) {
  this.dispatchConfig = dispatchConfig;
  this._targetInst = targetInst;
  this.nativeEvent = nativeEvent; // 原生事件对象挂在了合成事件对象的nativeEvent属性上

  // this.constructor.Interface 是用来增强在SyntheticEvent的原型对象
  // 增强的方法包含我们用的： preventDefault，stopPropagation，persist，isPersistent，destructor
  // 也就是在SyntheticEvent原型对象上增加了4个方法，比较熟悉吧
  const Interface = this.constructor.Interface;
  for (const propName in Interface) {
    if (!Interface.hasOwnProperty(propName)) {
      continue;
    }
    const normalize = Interface[propName];
    // React 找到事件对象上所有不是
    if (normalize) {
      this[propName] = normalize(nativeEvent);
    } else {
      // 把所有原生事件上的属性都遍历在合成事件上
      if (propName === 'target') {
        // 把发生事件的DOM挂在合成事件的target上
        this.target = nativeEventTarget;
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
  }
  // 阻止默认行为的兼容性写法
  const defaultPrevented =
    nativeEvent.defaultPrevented != null
      ? nativeEvent.defaultPrevented
      : nativeEvent.returnValue === false;
  if (defaultPrevented) {
    this.isDefaultPrevented = functionThatReturnsTrue;
  } else {
    this.isDefaultPrevented = functionThatReturnsFalse;
  }
  this.isPropagationStopped = functionThatReturnsFalse;
  return this;
}
```

总结一下：SyntheticEvent 增强了原生事件对象（磨平了一些兼容性），另外，所有原生事件对象的属性都可以在合成事件对象上找到，原生事件对象在挂载在合成事件对象的 nativeEvent 属性上。另外合成事件的原型对象还新增了 preventDefault，stopPropagation，persist，isPersistent，destructor 这些常用的方法

### 将事件绑定在 DOM（ReactDOM）

- 既然了解了合成事件，那么，合成事件是如何触发的呢？
  我在这边找到了 React 执行合成事件的注释
  ```javascript
  /*
  * | DOM | .
  * +------------+ .
  *       |           .
  *       v           .
  * +------------+ .
  * | ReactEvent | .
  * | Listener | .
  * +------------+ . +-----------+
  *       |           .               +--------+|SimpleEvent|
  *       |           .               |         |Plugin     |
  * +-----|------+ . v +-----------+
  * | | | . +--------------+ +------------+
  * | +-----------.--->|EventPluginHub| | Event |
  * | | . | | +-----------+ | Propagators|
  * | ReactEvent | . | | |TapEvent | |------------|
  * | Emitter | . | |<---+|Plugin | |other plugin|
  * | | . | | +-----------+ | utilities |
  * | +-----------.--->| | +------------+
  * | | | . +--------------+
  * +-----|------+ . ^ +-----------+
  *       |           .                |        |Enter/Leave|
  *       +           .                +-------+|Plugin     |
  * +-------------+ . +-----------+
  * | application | .
  * |-------------| .
  * | | .
  * | | .
  * +-------------+ .
  *                   .
  * React Core . General Purpose Event Plugin System
  * /
  ```
  可以非常清晰的看到：大致流程是：DOM-->>ReactEvent Listener -->> ReactEvent Emitter -->> application
- 在这个过程中的 ReactDOM 起什么作用呢？
  render()

  ```javascript
  render(
    (element: React$Element<any>),
    (container: DOMContainer),
    (callback: ?Function)
  );

  ReactDOM.render(<App />, document.getElementById('root'));
  ```

  render 方法把最终生成的 DOM 插入到#root 模版中。 约等于 JSX ==> render ==>> 插入 DOM。不过在这个文件里（ReactDOM.js）中并没有找到事件对象相关的。我们关注另外的两个文件 ReactDOMComponent.js 和 ReactDOMEventListener.js

- ReactDOMComponent.js 和 ReactDOMEventListener.js

  - 在 ReactDOMComponent 我们找到 listenToEventResponderEventTypes 这个方法

  ```javascript
  function listenToEventResponderEventTypes(
    eventTypes: Array<ReactEventResponderEventType>,
    element: Element | Document
  ) {
    // 部分关键代码...
    for (let i = 0, length = eventTypes.length; i < length; ++i) {
      const targetEventType = eventTypes[i];
      let topLevelType;
      let capture = false;
      let passive = true;
    }
    // ...
    // 部分关键代码...
    const passiveKey = passive ? '_passive' : '_active';
    const captureKey = capture ? '_capture' : '';
    const listeningName = `${topLevelType}${passiveKey}${captureKey}`;
    if (!listeningSet.has(listeningName)) {
      // 其实这个element就是document，绕了几个地方，不难找到其定义
      trapEventForResponderEventSystem(
        element,
        ((topLevelType: any): DOMTopLevelEventType),
        capture,
        passive
      );
      listeningSet.add(listeningName);
    }
  }
  ```

  我们终于发现 ReactDOMComponent.js 其实是利用`trapEventForResponderEventSystem`这个方法绑定事件的。（这个文件里也可以找到 React 是把所有的事件都委托到 document 上的，拿出了该代码）

  ```javascript
  function ensureListeningTo(
    rootContainerElement: Element | Node,
    registrationName: string
  ): void {
    const isDocumentOrFragment =
      rootContainerElement.nodeType === DOCUMENT_NODE ||
      rootContainerElement.nodeType === DOCUMENT_FRAGMENT_NODE;
    const doc = isDocumentOrFragment
      ? rootContainerElement
      : rootContainerElement.ownerDocument;
    listenTo(registrationName, doc); // 在这里注册事件，doc其实就是顶层对象
  }
  ```

  回到`trapEventForResponderEventSystem`这个方法，

  ```javascript
  function trapEventForResponderEventSystem(
    element: Document | Element | Node,
    topLevelType: DOMTopLevelEventType,
    capture: boolean,
    passive: boolean
  ) {
    // ...
    // 关键代码
    const listener = dispatchEvent.bind(null, topLevelType, eventFlags);
    // 绑定事件
    // 这是一种hack addEventListener
    addEventListener(element, rawEventName, listener, {
      capture,
      passive
    });
  }
  ```

  我们终于找到 React 使用`addEventListener`去绑定事件，触发的监听函数是`listener`，这个`listener`使用了 `dispatchEvent`方法 bind 多添加了 2 个参数：`topLevelType`和`eventFlags`。也是最开始将 dispatchEvent 这个方法的原因。不过 React 是自己定义了这个方法，我在这里找到了这个函数的完整的定义：

  ```javascript
  function dispatchEvent(
    topLevelType: DOMTopLevelEventType, //  通过bind添加的参数
    eventSystemFlags: EventSystemFlags, // 通过bind添加的参数
    nativeEvent: AnyNativeEvent // 原生事件发生的事件对象
  ) {
    if (!_enabled) {
      return;
    }
    const nativeEventTarget = getEventTarget(nativeEvent);
    let targetInst = getClosestInstanceFromNode(nativeEventTarget);

    if (
      targetInst !== null &&
      typeof targetInst.tag === 'number' &&
      !isFiberMounted(targetInst)
    ) {
      // If we get an event (ex: img onload) before committing that
      // component's mount, ignore it for now (that is, treat it as if it was an
      // event on a non-React tree). We might also consider queueing events and
      // dispatching them after the mount.
      targetInst = null;
    }

    if (enableEventAPI) {
      // hack写法
      // const PLUGIN_EVENT_SYSTEM = 1;
      // const RESPONDER_EVENT_SYSTEM = 1 << 1;
      // const IS_PASSIVE = 1 << 2;
      // const IS_ACTIVE = 1 << 3;
      // const PASSIVE_NOT_SUPPORTED = 1 << 4;
      if (eventSystemFlags === PLUGIN_EVENT_SYSTEM) {
        dispatchEventForPluginEventSystem(
          topLevelType,
          eventSystemFlags,
          nativeEvent,
          targetInst
        );
      } else {
        // 响应的事件系统，也是React内部定义的事件响应系统 RESPONDER_EVENT_SYSTEM
        // Responder event system (experimental event API)
        dispatchEventForResponderEventSystem(
          topLevelType, // DOMTopLevelEventType
          targetInst, // null | Fiber,
          nativeEvent, // AnyNativeEvent
          nativeEventTarget, // EventTarget
          eventSystemFlags // EventSystemFlags
        );
      }
    } else {
      dispatchEventForPluginEventSystem(
        topLevelType,
        eventSystemFlags,
        nativeEvent,
        targetInst
      );
    }
  }
  ```
