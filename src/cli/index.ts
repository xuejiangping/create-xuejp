#!/usr/bin/env tsx
import {
  multiselect,
  spinner,
  text
} from '@clack/prompts'
import { mkdir } from 'fs/promises'
import path from 'path'
import { copyTemplate, readTemplate } from '../utils'

const templateRoot = path.resolve(import.meta.dirname, '../../template/')


const projectName = await text({
  message: '请输入项目名称',
  placeholder: 'my-project',
  defaultValue: 'my-project',

})

// const useTypeScript = await confirm({
//   message: '是否使用 TypeScript？',
//   initialValue: true
// })

const templates = await multiselect({
  message: '请选择模版',
  options: await readTemplate(templateRoot),
  required: true
})

// const feature = await select({
//   message: '请选择功能2',
//   options: [
//     { value: 'eslint', label: 'ESLint' },
//     { value: 'prettier', label: 'Prettier' },
//     { value: 'test', label: '测试工具' }
//   ],
// })
const loading = spinner()
loading.start(`正在创建项目 ${String(projectName)}...`)

//创建项目文件夹
/**
* Mode | Description
* 0o755 // 所有人可读、可执行，所有者可写
* 0o700 // 只有当前用户可访问
* 0o775 // 所有人可读可执行，所有者和组可写
 */
await mkdir(<string>projectName, { recursive: false })
await copyTemplate(<string[]>templates, <string>projectName)

loading.stop('项目创建完成')

console.log({
  projectName,
  templates,
})