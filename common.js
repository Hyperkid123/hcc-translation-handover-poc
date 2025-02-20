import { resolve } from 'path'
import { readFileSync } from 'fs'
import { load } from 'js-yaml'
import { execSync } from 'child_process'

export const __dirname = resolve()
export const MODULES_CONFIG_PATH = resolve(__dirname, 'modules.yaml')
export const MODULES_DIR_PATH = resolve(__dirname, 'modules')
export const TEMP_DIR_PATH = resolve(__dirname, 'temp')
export function loadConfig() {
    const configFile = readFileSync(MODULES_CONFIG_PATH, 'utf8')
    /**
     * @type
     * {{ modules: { id: string; "git-remote": string; languages: string[] }[] }}
     */
    const { modules } = load(configFile)
    return modules
}

export function getModuleRepositoryDir(id) {
  return resolve(TEMP_DIR_PATH, id)
}

function cloneTag(strings, id, remote) {
  const str = strings[0]
  return `${str}${remote} ${getModuleRepositoryDir(id)} --depth 1`
}
export function cloneRepository(id, remote) {
  const cmd = cloneTag`git clone ${id} ${remote}`
  execSync(cmd, { stdio: 'inherit' })
}
