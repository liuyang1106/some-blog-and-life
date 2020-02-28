## 前端开发代码管理规范

### 管理工具：Git

### 原则

1. 一个开发分支对应一个不可拆分的需求任务；
2. 所有开发人员不得在 master 分支上做开发

### 具体流程如下：

例如当前版本 1 已发布，最新代码为 master，那么步骤如下，需要迭代的版本为 v1.14：

1. 切到 master 分支，拉取最新 master 代码

```bash
git checkout master;
git pull origin master;
```

2. 创建迭代分支，v.1.14(release/1.14)

```bash
git checkout master;
git checkout -b release/1.14; # 创建需要迭代的分支（后续用它来做发布和快速回滚版本）
git push origin release/1.14; # 推到远端
```

3. 从 master 切换开发分支

```bash
git checkout develop/leo; # 切换到自己的开发分支，例如我的分支：develop/leo;
git merge master; # 保证自己的开发分支是最新的已经发布的代码
git checkout -b feature/XXXXX; # 切换到一个新的本地分支，XXXX为任务编号，自己要开发的任务的分支，开始开发代码
```

4. 将需要发布测试的代码合并到自己的分支：feature/XXXX --->>> develop/leo

```bash
git checkout develop/leo;
git merge feature/XXXX; # 合并开发完成的需求
# yarn 打包 || npm 打包
```

5. 所有代码测试完成，合并到 release/1.14 分支，打包发布版本

6. 将 release/1.14 代码合并到 master，将 master 推动到远端
