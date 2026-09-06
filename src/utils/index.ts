
import { cancel, isCancel } from '@clack/prompts'
import { access, cp, readdir } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

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


export async function copyTemplate(sources: string[], dest: string) {
  const isMutiple = sources.length > 1
  return Promise.all(
    sources.map(source => {
      const target = isMutiple ? join(dest, basename(source)) : dest
      return cp(source, target, { recursive: true })
    })
  )
}

// console.log('readTemplate()', await readTemplate('src'))