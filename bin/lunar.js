#!/usr/bin/env node

const { resolve } = require('path')

try {
    require('ts-node').register()
    require(resolve(__dirname, '../src/index.ts'))
} catch (err) {
    console.error(err)
    require(resolve(__dirname, '../dist/index.js'))
}
