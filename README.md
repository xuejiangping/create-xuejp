# create-xuejp

一个基于 Node.js 的交互式项目脚手架。它会同时展示 `template` 目录中的本地模板和 `~/.xuejprc` 中配置的远程模板，供用户选择并复制到新项目目录。

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
2. 展示 `template` 下的本地模板和 `~/.xuejprc` 中配置的远程模板
3. 仅下载被选中的远程模板，再将选中模板复制到项目目录

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

### 配置远程模板

在用户主目录创建 `~/.xuejprc`：

```yaml
templates:
  server: https://gitee.com/example/server.git
  web: https://example.com/web-template.zip
  mobile:
    type: git
    url: https://gitee.com/example/mobile.git
```

配置项可以是 URL 字符串，也可以是包含 `type` 和 `url` 的对象。字符串 URL 以 `.zip` 结尾时按 ZIP 模板处理，其他 URL 按 Git 仓库处理；对象中的 `type` 可显式指定为 `git` 或 `zip`。选择多个模板时，复制结果会使用模板名作为目录名；本地和远程模板重名时会分别加上 `local-` 和 `remote-` 前缀。

ZIP 模板会解压后复制；压缩包可以包含一个顶层目录，也可以直接包含模板文件。没有配置文件时，CLI 仍可正常展示和使用本地模板。

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

## 当前已有模版

<!-- templates:start -->

### [vscode-extension-webview-template](template/vscode-extension-webview-template/README.md)

### [youhou](template/youhou/README.md)

<!-- templates:end -->
