#!/usr/bin/env node

try {
    require('ts-node').register()
    require('../src/index.ts')
} catch {
    require('../dist/index.js')
}
