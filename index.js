import { load } from 'js-yaml'
import { readFileSync, mkdirSync, existsSync, writeFileSync, rmSync, copyFileSync } from 'fs'
import { resolve } from 'path'
import { execSync } from 'child_process'

const __dirname = resolve()
const MODULES_CONFIG_PATH = resolve(__dirname, 'modules.yaml')
const MODULES_DIR_PATH = resolve(__dirname, 'modules')
const TEMP_DIR_PATH = resolve(__dirname, 'temp')


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

function cloneTag(strings, id, remote) {
  const str = strings[0]
  return `${str}${remote} ${resolve(TEMP_DIR_PATH, id)} --depth 1`
}

function templateTag(_strings, id, filename) {
  return resolve(MODULES_DIR_PATH, id, filename)
}

function sourceTag(_strings, id, filename) {
  return resolve(TEMP_DIR_PATH, id, filename)
}

function cloneRepository(id, remote) {
  const cmd = cloneTag`git clone ${id} ${remote}`
  execSync(cmd, { stdio: 'inherit' })
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
  const modulesFile = readFileSync(MODULES_CONFIG_PATH, 'utf8')
  /**
   * @type
   * {{ modules: { id: string; "git-remote": string; languages: string[] }[] }}
   */
  const { modules } = load(modulesFile)
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
