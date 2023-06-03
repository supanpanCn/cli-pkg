import type { AnyObj } from "su-helpers";
import { createLog } from "su-helpers";
import ora from "ora";
import { execa, Options } from "execa";
import { createDoPlugin } from "./plugin";
import validate from "./validate";
import prompt from "./prompt";
import {
  initGithubActions,
  publishNpm,
  createRelease,
  createTag,
} from "./steps";
import {
  existsSync,
  readFileSync,
  appendFileSync,
  writeFileSync,
  unlinkSync
} from "node:fs";
// @ts-ignore
import { outputFileSync } from 'fs-extra'
export { _dirname } from "su-helpers/node";
export { runArr } from "su-helpers";
export type { AnyObj } from "su-helpers";

// ------------- typescript definition -------------

export type TLifycycle =
  | "config"
  | "success"
  | "before:publish"
  | "after:publish"
  | "before:tag"
  | "after:tag"
  | "before:release"
  | "after:release";

export interface TContext {
  lifecycle: TLifycycle;
  exec: typeof exec;
  plugins: TPlugin[];
  config: {
    allowedBranch: string[];
    runAt: string;
    ignoreGitChangeFiles: string[];
    packageManage: "npm" | "pnpm" | "yarn" | "cnpm";
    registry: string;
    createReleaseBaseOnPkgVersion?:boolean;
  };
  prompt: typeof prompt;
  spinner: ReturnType<typeof initSpinner>;
  publishNpm: typeof publishNpm;
  initGithubActions: typeof initGithubActions;
  createRelease: typeof createRelease;
  createTag: typeof createTag;
  validate: typeof validate;
  restart: () => void;
  shared: {
    nextVersion?: string;
    latestTag?: string;
    willPlugins?: TPlugin[];
    [other: string]: any;
  };
  stopAfterPlugin: typeof stopAfterPlugin;
  quit: () => void;
  rungingLifeCycle?: TPlugin;
  queueHead?: "发布npm" | "创建release" | "创建tag" | (string & {});
  pkg?: AnyObj;
  log?: ReturnType<typeof initLog>;
  runPluginTasks?: ReturnType<typeof createDoPlugin>;
}

export interface TPlugin {
  (ctx: TContext): Promise<any>;
  lifecycle: TLifycycle;
}

export interface TMessageKey {
  NONLICET_BRANCH: string;
  DIRTY_GIT: string;
  EXEC_ERR: string;
  LOAD_PKG: string;
  START_PUBLISH_NPM: string;
  CHANGE_NPM: string;
  NO_TAG: string;
  NO_CHANGE: string;
  SETUP_ACTIONS: string;
  CUSTOM: string;
}

// ------------- typescript definition -------------

// ------------- variable definition -------------

export const REGISTRY = "https://registry.npmjs.org/";

export const executeTypes = {
  发布npm包: 1,
  创建release: 2,
  创建tag: 3,
};

export const messages = new Map<keyof TMessageKey, string | Function>([
  ["CHANGE_NPM", "已切换到npm"],
  ["NO_CHANGE", "检测到本地与前一次的tag包相同，不需要重新生成Release"],
  ["NO_TAG", `发现您尚未打包过tag,请重新运行脚本并选择"发布tag"`],
  [
    "START_PUBLISH_NPM",
    ({ version, name }: { version: string; name: string }) =>
      `执行npm包发布：版本号为${version}、包名称为${name}`,
  ],
  ["DIRTY_GIT", "本地存在未commit的文件变动"],
  ["EXEC_ERR", (reason: string) => reason],
  ["LOAD_PKG", "package.json读取失败"],
  [
    "NONLICET_BRANCH",
    (branchName: string) => `不支持在${branchName}分支执行操作`,
  ],
  ["SETUP_ACTIONS", "已完成github Actions文件的创建，正在帮您推送到远程"],
  ["CUSTOM", (msg: string) => `${msg}`],
]);

export const yarnrc = {
  url:'.yarnrc',
  back:{
    type:'',
    data:''
  },
  check() {
    if (existsSync(yarnrc.url)) {
      const code = readFileSync(yarnrc.url, "utf-8");
      if (code.trim()) {
        const reg = /registry[\s]+('|")(.*?)(\1)/g;
        const m = code.match(reg);
        yarnrc.back.data = code
        yarnrc.back.type = 'part'
        if (Array.isArray(m)) {
          const url = RegExp.$2;
          if (url) {
            if (url !== REGISTRY) {
              writeFileSync(yarnrc.url, code.replace(url, REGISTRY));
            }
          }
        } else {
          appendFileSync(yarnrc.url, `\nregistry "${REGISTRY}"`);
        }
      }else{
        appendFileSync(yarnrc.url, `\nregistry "${REGISTRY}"`);
      }
    } else {
      yarnrc.back.type = 'all'
      outputFileSync(yarnrc.url,`registry "${REGISTRY}"`)
    }
  },
  unlink(){
    if(yarnrc.back.type === 'all'){
      unlinkSync(yarnrc.url)
    }else if(yarnrc.back.type === 'part'){
      writeFileSync(yarnrc.url,yarnrc.back.data,'utf-8')
    }
  }
};

// ------------- variable definition -------------
export const PKG_NAME = "cli-pkg";

// ------------- function definition -------------

export function exec(bin: string, args: readonly string[], opts: Options = {}) {
  return new Promise<string>((resolve, reject) => {
    execa(bin, args, { stdio: "pipe", ...opts })
      .then(({ stdout }) => {
        resolve(stdout);
      })
      .catch((error) => {
        yarnrc.unlink();
        console.error(error);
        reject();
      });
  });
}

export function initLog<T extends TMessageKey>(runAt: string = PKG_NAME) {
  return createLog<T>(messages, runAt);
}

export function initSpinner() {
  const spinner = ora({
    text: "当前任务比较耗时，请耐心等待...",
    color: "red",
  });
  return spinner;
}

export function setupTimeout(cb: Function) {
  const timer = setTimeout(() => {
    if (typeof cb === "function") {
      cb();
    }
    clearTimeout(timer);
  }, 500);
}

export function sleep(){
  return new Promise((resolve)=>{
    setupTimeout(resolve)
  })
}

export function stopAfterPlugin(this: TContext) {
  const plugins = this.shared.willPlugins || [];
  for (let i = 0; i < plugins?.length; i++) {
    if (plugins[i] === this.rungingLifeCycle) {
      plugins.splice(i, 1);
      i--;
    }
  }
}

export function createDefaultConfig() {
  return {
    runAt: PKG_NAME,
    allowedBranch: ["main"],
    ignoreGitChangeFiles: [
      "yarn.lock",
      "package-lock.json",
      "pnpm-lock.yaml",
      "yarn-error.log",
    ],
    packageManage: "npm",
    registry: "https://registry.npmjs.org/",
    createReleaseBaseOnPkgVersion:false
  } as TContext["config"];
}

// ------------- function definition -------------
