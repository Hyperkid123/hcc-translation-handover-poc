import { mkdirSync, existsSync, writeFileSync, rmSync, copyFileSync } from 'fs'
import { resolve } from 'path'
import { cloneRepository, loadConfig, MODULES_DIR_PATH, TEMP_DIR_PATH } from './common.js'


function findOrCreateDir(pathname) {
  if (existsSync(pathname)) {
    return
  }

  mkdirSync(pathname, { recursive: true })
  writeFileSync(resolve(pathname, '.gitkeep'), '')
}

function cleanTemp() {
  if(!existsSync(resolve(TEMP_DIR_PATH))) {
    return
  }

  rmSync(TEMP_DIR_PATH, { recursive: true })
}


function templateTag(_strings, id, filename) {
  return resolve(MODULES_DIR_PATH, id, filename)
}

function sourceTag(_strings, id, filename) {
  return resolve(TEMP_DIR_PATH, id, filename)
}


function loadTranslationTemplate(id, templateFilename = 'package.json') {
  // using package.json as a template for testing
  const fileName = templateTag`${id}/${'template.json'}`
  if (existsSync(fileName)) {
    rmSync(fileName)
  }

  const source = sourceTag`${id}/${templateFilename}`
  copyFileSync(source, fileName)
}

function main() {
  findOrCreateDir(TEMP_DIR_PATH)
  const modules = loadConfig()
  modules.forEach(({ id, languages, 'git-remote': remote }) => {
    cloneRepository(id, remote)
    languages.forEach((language) => {
      findOrCreateDir(resolve(MODULES_DIR_PATH, id, language))
    })
    loadTranslationTemplate(id)
  })
  console.log(modules)

  cleanTemp()
}

main()
