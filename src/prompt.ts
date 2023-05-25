// @ts-nocheck
import enquirer from "enquirer";
import semver from "semver";
import { executeTypes } from './helpers'

async function isLogin() {
  const { isLogin } = await enquirer.prompt({
    type: "confirm",
    name: "isLogin",
    message: "是否已登陆npm？",
    initial: true,
  });
  return isLogin;
}

async function genVersion(initialVersion) {
  const isValid = semver.valid(initialVersion);
  const major = semver.major(initialVersion);
  const minor = semver.minor(initialVersion);
  const patch = semver.patch(initialVersion);
  const input = isValid ? `${major}.${minor}.${patch + 1}` : "";
  const version = await enquirer.input({
    message: `请输入要发布的版本号,当前版本为${major}.${minor}.${patch}`,
    initial: input,
  });
  return version;
}

async function updatePkg(version:string,updateType:'release'|'tag'|'publish') {
  let message = ''
  switch(updateType){
    case 'publish':
      message = `npm包已发布，是否将新的版本号(${version})更新到package.json文件`
      break
  }
  const { isUpdate } = await enquirer.prompt({
    type: "confirm",
    name: "isUpdate",
    message,
    initial: true,
  });
  return isUpdate;
}

async function executeType() {
  const script = await enquirer.select({
    message: "请选择操作",
    choices: Object.keys(executeTypes),
    result(value){
      return executeTypes[value]
    }
  });
  return script;
}

export default {
  isLogin,
  genVersion,
  updatePkg,
  executeType
};
