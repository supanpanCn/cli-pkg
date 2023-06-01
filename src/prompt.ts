// @ts-nocheck
import enquirer from "enquirer";
import semver from "semver";
import { executeTypes } from './helpers'

async function isLogin() {
  const { isLogin } = await enquirer.prompt({
    type: "confirm",
    name: "isLogin",
    message: "无法获取当前登陆用户，请手动检查当前登陆的npm账户，并确认是否继续？",
    initial: true,
  });
  return isLogin;
}

async function checkLoginedUser(username) {
  const { next } = await enquirer.prompt({
    type: "confirm",
    name: "next",
    message: `检测到当前登陆的npm账号为：${username}，请确认是否继续？`,
    initial: true,
  });
  return next;
}

async function requestChangeToNpm(registry) {
  const { next } = await enquirer.prompt({
    type: "confirm",
    name: "next",
    message: `请求切换到npm：${registry}`,
    initial: true,
  });
  return next;
}

async function requestDoReleaseAfterPublish() {
  const { next } = await enquirer.prompt({
    type: "confirm",
    name: "next",
    message: `已成功发布npm，是否生成Release`,
    initial: true,
  });
  return next;
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

async function commit() {
  const commitInfo = await enquirer.input({
    message: `请为当前commit添加备注`,
    initial: '配置github Actions',
  });
  return commitInfo;
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

async function githubActions(ctx) {
  const { isSetup } = await enquirer.prompt({
    type: "confirm",
    name: "isSetup",
    message:`检测到您还未配置github Actions，是否允许${ctx.config.runAt}帮您自动创建？`,
    initial: true,
  });
  return isSetup;
}



export default {
  isLogin,
  commit,
  genVersion,
  updatePkg,
  executeType,
  githubActions,
  checkLoginedUser,
  requestChangeToNpm,
  requestDoReleaseAfterPublish
};
