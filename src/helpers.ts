import type { AnyObj } from "su-helpers";
import minimist from "minimist";
import { createLog } from "su-helpers";
export { _dirname } from "su-helpers/node";
export { runArr } from "su-helpers";
import { execa, Options } from "execa";

interface Args {
  runAt: string;
  checks: string;
  branch: string;
  [other: string]: any;
}
interface MessageKey {
  NONLICET_BRANCH: string;
  DIRTY_GIT: string;
  SYNC_GIT: string;
  EXEC_ERR: string;
  LOAD_PKG: string;
  START_PUBLISH_NPM: string;
  CHANGE_NPM: string;
}

export const messages = new Map<keyof MessageKey, string | Function>([
  ["CHANGE_NPM", "已切换到npm"],
  [
    "START_PUBLISH_NPM",
    ({ version, name }: { version: string; name: string }) =>
      `执行npm包发布：版本号为${version}、包名称为${name}`,
  ],
  ["DIRTY_GIT", "本地存在未commit的文件变动"],
  ["SYNC_GIT", "当前分支与远程不同步"],
  ["EXEC_ERR", (reason:string)=>reason],
  ["LOAD_PKG", "package.json读取失败"],
  [
    "NONLICET_BRANCH",
    (branchName: string) => `不支持在${branchName}分支执行操作`,
  ],
]);

export const LEGAL_BRANCH = ["main", "master"];

export const NPM_REGISTER_ADDRESS = "https://registry.npmjs.org/";

export const args = mergeArgs(minimist(process.argv.slice(2)));

function mergeArgs(args: AnyObj) {
  const defaultArgs: Args = {
    runAt: "publish-pkg",
    checks: "git,branch",
    branch: "master,main",
  };
  for (let key in args) {
    if (defaultArgs[key] && args[key]) {
      defaultArgs[key] = args[key];
    }
  }
  return defaultArgs;
}

export const exec = (
  bin: string,
  args: readonly string[],
  opts: Options = {}
) => {
  return new Promise<string>((resolve, reject) => {
    execa(bin, args, { stdio: "pipe", ...opts })
      .then(({ stdout }) => {
        resolve(stdout);
      })
      .catch((error) => {
        log("EXEC_ERR","red",error)
        reject();
      });
  });
};

export const log: ReturnType<typeof createLog<MessageKey>> = (...rest: any) => {
  const _log = createLog<MessageKey>(messages, args.runAt);
  _log(rest[0], rest[1], rest[2]);
};
