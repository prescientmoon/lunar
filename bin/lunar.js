#!/usr/bin/env node

try {
    require('ts-node').register()
    require('../src/index.ts')
} catch (err) {
    console.error(err)
    require('../dist/index.js')
}
