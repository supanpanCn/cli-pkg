// @ts-nocheck
import enquirer from "enquirer";
import semver from "semver";

async function isLogin() {
  const { isLogin } = await enquirer.prompt({
    type: "confirm",
    name: "isLogin",
    message: "是否已登陆npm？",
    initial: true,
  });
  return isLogin;
}

async function validateGit() {
  const { isMatched } = await enquirer.prompt({
    type: "confirm",
    name: "isMatched",
    message:
      "是否校验当前分支与远程分支匹配？由于网络连接原因，这可能需要花费较长时间，请确认！",
    initial: false,
  });
  return isMatched;
}

async function build() {
  const { needBuild } = await enquirer.prompt({
    type: "confirm",
    name: "needBuild",
    message: "是否需要执行打包操作",
    initial: false,
  });
  return needBuild;
}

async function runBuild(scripts) {
  const script = await enquirer.select({
    message: "请选择打包脚本",
    choices: Object.keys(scripts),
  });
  return script;
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

async function updatePkg(version:string) {
  const { isUpdate } = await enquirer.prompt({
    type: "confirm",
    name: "isUpdate",
    message:
      `已成功发布npm，是否将新的版本号(${version})更新到package.json文件`,
    initial: true,
  });
  return isUpdate;
}

export default {
  isLogin,
  validateGit,
  build,
  runBuild,
  genVersion,
  updatePkg,
};
