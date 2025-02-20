import { resolve } from 'path'
import { execSync } from 'child_process'
import { cloneRepository, getModuleRepositoryDir, loadConfig, MODULES_DIR_PATH } from './common.js'
import { existsSync } from 'fs';

const DIF_COMMAND = 'git diff --name-only HEAD~2 HEAD~1';
const UPDATE_BRANCH = 'update-translations';
const modules = loadConfig();

function getChangedFiles() {
  const changedFiles = execSync(DIF_COMMAND, { encoding: 'utf-8' });
  return changedFiles.split('\n').filter(Boolean);
}

function getChangedModule(filename) {
  const id = filename.split('/')[1];
  
  return modules.find(m => m.id === id);
}

function preparePRTag(_strings, m) {
  const repositoryDir = getModuleRepositoryDir(m.id)
  const copyCommand = `cp -r ${resolve(MODULES_DIR_PATH, m.id)} ${repositoryDir}/lang`
  // THis is just a placeholder. WE should use github/gitlab API co create a pull request with proper description etc.
  return `${copyCommand} && git -C ${repositoryDir} checkout -b ${UPDATE_BRANCH} && git -C ${repositoryDir} add ${m.languages.map(l => 'lang/' + l).join(' ')} && git -C ${repositoryDir} commit -m "chore: update translations" && echo "create PR here" && git -C ${repositoryDir} checkout -b foo && git -C ${repositoryDir} branch -D ${UPDATE_BRANCH}`
}

function openModulePR(m) {
  const repositoryDir = getModuleRepositoryDir(m.id)
  if(!existsSync(repositoryDir)) {
    cloneRepository(m.id, m['git-remote'])
  }

  const gitCommand = preparePRTag`${m}`
  const r = execSync(gitCommand, { stdio: 'inherit' })
}

function main() {
  const changedFiles = getChangedFiles();
  const changedModules= Object.values(changedFiles.map(getChangedModule).reduce((acc, curr) => {
    if(!acc[curr.id]) {
      acc[curr.id] = curr
    }
    return acc
  }, {}))
  changedModules.forEach(openModulePR)

}

main ()
