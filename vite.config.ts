import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    ssr: 'src/cli/index.ts',
    outDir: 'bin',
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