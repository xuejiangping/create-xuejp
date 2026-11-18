#!/usr/bin/env tsx
import {
  multiselect,
  spinner,
  text
} from '@clack/prompts'
import { mkdir, rm } from 'node:fs/promises'
import {
  copyTemplate,
  findTemplateRoot,
  prompt,
  readTemplateOptions,
  resolveTemplateSources
} from '../utils'
import { XJPRC_CONFIG_FILE } from '../constant'

const templateRoot = await findTemplateRoot()

const projectName = await prompt(() => text({
  message: '请输入项目名称',
  placeholder: 'my-project',
  defaultValue: 'my-project',
}))

// const useTypeScript = await confirm({
//   message: '是否使用 TypeScript？',
//   initialValue: true
// })

const availableTemplates = await readTemplateOptions(templateRoot)
if (availableTemplates.length === 0) {
  throw new Error(`没有可用模版，请检查 template 目录或 ~/${XJPRC_CONFIG_FILE} 配置`)
}

const selectedTemplateIds = await prompt(() => multiselect({
  message: '请选择模版',
  options: availableTemplates.map(({ id, label }) => ({ value: id, label })),
  required: true
}))
const templateById = new Map(availableTemplates.map(template => [template.id, template]))
const templates = selectedTemplateIds.map(id => {
  const template = templateById.get(id)
  if (!template) throw new Error(`找不到所选模版: ${id}`)
  return template
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

let tempRoot: string | undefined
try {
  const resolvedTemplates = await resolveTemplateSources(templates)
  tempRoot = resolvedTemplates.tempRoot
  await mkdir(projectName, { recursive: false })
  await copyTemplate(resolvedTemplates.sources, projectName)

  loading.stop('项目创建完成')
} catch (error) {
  loading.stop('项目创建失败')
  throw error
} finally {
  if (tempRoot) await rm(tempRoot, { recursive: true, force: true })
}

console.log({
  projectName,
  templates,
})