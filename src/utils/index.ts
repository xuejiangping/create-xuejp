import { cancel, isCancel } from '@clack/prompts'
import extractZip from 'extract-zip'
import { execFile } from 'node:child_process'
import { access, cp, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { homedir, tmpdir } from 'node:os'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'
import { parse } from 'yaml'
import { XJPRC_CONFIG_FILE } from '../constant'

const execFileAsync = promisify(execFile)

type RemoteTemplateType = 'git' | 'zip'

export type TemplateOption =
  | {
    id: string
    name: string
    label: string
    kind: 'local'
    path: string
  }
  | {
    id: string
    name: string
    label: string
    kind: 'remote'
    type: RemoteTemplateType
    url: string
  }

export interface CopyTemplateSource {
  name: string
  path: string
  kind?: 'local' | 'remote'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function inferRemoteTemplateType(url: string): RemoteTemplateType {
  const path = url.split(/[?#]/, 1)[0].toLowerCase()
  return path.endsWith('.zip') ? 'zip' : 'git'
}

function validateTemplateName(name: string) {
  if (!name || name === '.' || name === '..' || /[\\/]/.test(name)) {
    throw new Error(`无效的模版名称: ${name}`)
  }
}

async function readRemoteTemplates(configPath: string): Promise<TemplateOption[]> {
  let contents: string
  try {
    debugger
    contents = await readFile(configPath, 'utf8')
  } catch (error) {
    if (isRecord(error) && error.code === 'ENOENT') return []
    throw error
  }

  const config: unknown = parse(contents)
  if (!isRecord(config) || !isRecord(config.templates)) {
    throw new Error(`配置文件 ${configPath} 必须包含 templates 对象`)
  }

  return Object.entries(config.templates).map(([name, value]) => {
    validateTemplateName(name)

    let url: string
    let type: RemoteTemplateType
    if (typeof value === 'string') {
      url = value
      type = inferRemoteTemplateType(url)
    } else if (isRecord(value) && typeof value.url === 'string') {
      url = value.url
      const configuredType = value.type
      if (configuredType !== undefined && configuredType !== 'git' && configuredType !== 'zip') {
        throw new Error(`模版 ${name} 的 type 只能是 git 或 zip`)
      }
      type = configuredType ?? inferRemoteTemplateType(url)
    } else {
      throw new Error(`模版 ${name} 必须是 URL 字符串或包含 url 的对象`)
    }

    if (!url.trim()) throw new Error(`模版 ${name} 的 url 不能为空`)

    return {
      id: `remote:${name}`,
      name,
      label: `远程 · ${name}`,
      kind: 'remote',
      type,
      url
    }
  })
}

export async function prompt<T>(action: () => Promise<T | symbol>): Promise<T> {
  const result = await action()

  if (isCancel(result)) {
    cancel('操作已取消')
    process.exit(0)
  }

  return result
}

export async function findTemplateRoot() {
  let currentDir = dirname(fileURLToPath(import.meta.url))

  while (true) {
    const templateRoot = join(currentDir, 'template')

    try {
      await access(templateRoot)
      return templateRoot
    } catch {
      const parentDir = dirname(currentDir)

      if (parentDir === currentDir) {
        throw new Error('找不到 template 目录')
      }

      currentDir = parentDir
    }
  }
}

export async function readTemplate(source: string = 'template') {
  const items = await readdir(source, { withFileTypes: true })
  return items.filter(d => d.isDirectory()).map(d => ({
    value: join(source, d.name),
    label: d.name
  }))
}
export async function readTemplateOptions(
  localRoot: string,
  configPath: string = join(homedir(), XJPRC_CONFIG_FILE)
): Promise<TemplateOption[]> {
  const localItems = await readdir(localRoot, { withFileTypes: true })
  const localTemplates: TemplateOption[] = localItems
    .filter(item => item.isDirectory())
    .map(item => ({
      id: `local:${item.name}`,
      name: item.name,
      label: `本地 · ${item.name}`,
      kind: 'local',
      path: join(localRoot, item.name)
    }))

  return [...localTemplates, ...await readRemoteTemplates(configPath)]
}

async function downloadRemoteTemplate(
  template: Extract<TemplateOption, { kind: 'remote' }>,
  tempRoot: string,
  index: number
): Promise<string> {
  const target = join(tempRoot, `template-${index}`)

  if (template.type === 'git') {
    await execFileAsync('git', ['clone', '--depth', '1', '--', template.url, target])
    await rm(join(target, '.git'), { recursive: true, force: true })
    return target
  }

  const response = await fetch(template.url, { signal: AbortSignal.timeout(120_000) })
  if (!response.ok) {
    throw new Error(`下载模版 ${template.name} 失败: HTTP ${response.status}`)
  }

  const archivePath = join(tempRoot, `template-${index}.zip`)
  await writeFile(archivePath, Buffer.from(await response.arrayBuffer()))
  await extractZip(archivePath, { dir: target })

  const entries = await readdir(target, { withFileTypes: true })
  if (entries.length === 1 && entries[0].isDirectory()) {
    return join(target, entries[0].name)
  }

  return target
}

export async function resolveTemplateSources(
  templates: TemplateOption[]
): Promise<{ sources: CopyTemplateSource[]; tempRoot?: string }> {
  const hasRemoteTemplate = templates.some(template => template.kind === 'remote')
  const tempRoot = hasRemoteTemplate
    ? await mkdtemp(join(tmpdir(), 'create-xuejp-'))
    : undefined

  try {
    const sources: CopyTemplateSource[] = []
    for (const [index, template] of templates.entries()) {
      let path: string
      if (template.kind === 'local') {
        path = template.path
      } else {
        if (!tempRoot) throw new Error('远程模版缺少临时下载目录')
        path = await downloadRemoteTemplate(template, tempRoot, index)
      }

      sources.push({
        name: template.name,
        path,
        kind: template.kind
      })
    }
    return { sources, tempRoot }
  } catch (error) {
    if (tempRoot) await rm(tempRoot, { recursive: true, force: true })
    throw error
  }
}

export async function copyTemplate(
  inputSources: Array<CopyTemplateSource | string>,
  dest: string
) {
  const sources = inputSources.map(source => typeof source === 'string'
    ? { name: basename(source), path: source }
    : source)

  const names = new Map<string, number>()
  for (const source of sources) {
    const name = source.name
    validateTemplateName(name)
    names.set(name, (names.get(name) ?? 0) + 1)
  }

  const targets = sources.map(source => {
    const name = (names.get(source.name) ?? 0) > 1 && source.kind
      ? `${source.kind}-${source.name}`
      : source.name
    return { source, name }
  })
  const targetNames = new Set<string>()
  for (const target of targets) {
    if (targetNames.has(target.name)) {
      throw new Error(`所选模版名称冲突: ${target.name}`)
    }
    targetNames.add(target.name)
  }

  const isMultiple = sources.length > 1
  return Promise.all(
    targets.map(({ source, name }) => {
      const target = isMultiple ? join(dest, name) : dest
      return cp(source.path, target, { recursive: true })
    })
  )
}
