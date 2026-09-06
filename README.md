# create-xuejp

一个基于 Node.js 的交互式项目脚手架。它会读取 `template` 目录中的模板，让用户选择一个或多个模板，并复制到新项目目录。

## 使用

直接创建项目：

```bash
npm create xuejp
```

也可以使用 pnpm 或 Yarn：

```bash
pnpm create xuejp
yarn create xuejp
```

执行后，工具会依次：

1. 询问项目目录名称
2. 展示 `template` 下可用的模板目录
3. 将选中的模板复制到项目目录

例如，模板目录如下：

```text
template/
├── a/
└── b/
```

用户选择 `a` 后，文件会被复制到：

```text
<项目名称>/
└── ...
```

选择多个模板时，会保留各自的目录名：

```text
<项目名称>/
├── a/
└── b/
```

在交互过程中按 `Ctrl+C` 可以安全退出。

## 本地开发

安装依赖：

```bash
pnpm install
```

直接运行 TypeScript 源码：

```bash
tsx src/cli/index.ts
```

也可以使用项目脚本：

```bash
pnpm run dev
```

如果项目中还没有 `dev` 脚本，可以直接使用上面的 `tsx` 命令。`tsx` 只用于本地开发，正式发布时执行的是构建后的 JavaScript 文件。

## 构建

```bash
pnpm run build
```

构建结果：

```text
bin/index.js
```

构建会生成 Node.js CLI 入口，并压缩代码。Node 内置模块不会被打包，这是正常行为。

## 添加模板

在 `template` 目录下新增一个目录即可：

```text
template/
├── react-app/
├── vue-app/
└── node-cli/
```

模板目录名会作为交互界面的显示名称。模板中的文件会原样复制到用户创建的项目目录中。

## 发布前检查

先构建：

```bash
pnpm run build
```

检查 npm 包实际包含的文件：

```bash
npm pack --dry-run
```

至少应包含：

```text
bin/index.js
template/...
```

发布：

```bash
npm publish
```

发布新版本前请更新 `package.json` 中的 `version`。

## 项目结构

```text
bin/              # 构建后的 CLI 入口
src/cli/          # CLI 交互流程
src/utils/        # 模板读取、复制和取消处理等工具函数
template/         # 可供用户选择的项目模板
vite.config.ts    # Node CLI 构建配置
```

## 运行环境

- Node.js `>= 17`
- npm、pnpm 或 Yarn

最终用户只需要通过 npm 安装并运行脚手架，不需要单独安装 TypeScript 或 `tsx`。
