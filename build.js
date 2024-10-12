import * as esbuild from 'esbuild'
import info from './package.json' assert { type: 'json' }

await esbuild.build({
    entryPoints: ['src/index.ts'],
    minify: false,
    bundle: true,
    outdir: 'dist',
    format: 'esm',
    target: ['esnext'],
    platform: 'node',
    external: Object.keys(info.dependencies)
})
