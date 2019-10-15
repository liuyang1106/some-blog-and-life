## 针对使用 mobx 遇到的一些问题和感想

### 优点

1.mobx 始终只有 1 份数据引用，无需 reselect 和 immutable
2.autorun 保证了 mobx 的性能优势，按需更新组件，使用 forceUpdate，因此不要继承 PureComponent，不要 React.memo 去做比较

### 缺点

1.当一个组件注入了多个 store 的时候比较难管理，发起不同的 action 需要 store1.fn(),store2.fn()去分发
2.store1 和 store2 是完全隔离的，在 store1 内部完全无法获取 store2 的数据（部分场景需要），这造成了数据内部交流障碍
3.a
