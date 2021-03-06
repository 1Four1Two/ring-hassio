//This code by Dgreif https://github.com/dgreif/ring/examples/browser_example.ts

import * as path from 'path'
import { promisify } from 'util'
import { mkdir } from 'fs'
const rimraf = require('rimraf')

export const outputDirectory = path.resolve('output')

export async function cleanOutputDirectory() {
  await promisify(rimraf)(outputDirectory)
  await promisify(mkdir)(outputDirectory)
}
