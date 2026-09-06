import { defineConfig, type Plugin } from 'vite'

const removeShebang = (): Plugin => ({
  name: 'remove-cli-shebang',
  apply: 'build',

  transform(code, id) {
    if (!id.endsWith('/src/cli/index.ts')) return

    return {
      code: code.replace(/^#![^\n]*\r?\n/, ''),
      map: null
    }
  }
})

export default defineConfig({
  plugins: [removeShebang()],
  ssr: {
    noExternal: ['@clack/prompts']
  },
  build: {
    ssr: 'src/cli/index.ts',
    outDir: 'bin',
    minify: true,
    target: 'node20',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: 'index.js',
        format: 'es',
        banner: '#!/usr/bin/env node'
      }
    }
  }
})