
import { cp, readdir } from 'fs/promises'
import { basename, join } from 'path'
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