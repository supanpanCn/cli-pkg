import type { AnyObj } from "su-helpers";
import { createLog } from "su-helpers";
import ora from "ora";
import { execa, Options } from "execa";
import { createDoPlugin } from "./plugin";
import validate from "./validate";
import publish from "./publish";
import release from "./release";
import tag from "./tag";
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

export interface TInnerContext {
  lifecycle: TLifycycle;
  exec: typeof exec;
  plugins: TPlugin[];
  config: {
    allowedBranch: string[];
    runAt: string;
    ignoreGitChangeFiles: string[];
    packageManage: "npm" | "pnpm" | "yarn" | "cnpm";
    registry: string;
  };
  spinner: ReturnType<typeof initSpinner>;
  publish: typeof publish;
  release: typeof release;
  validate: typeof validate;
  tag: typeof tag;
  restart: () => void;
  shared: AnyObj;
  quit: () => void;
  pkg?: AnyObj;
  log?: ReturnType<typeof initLog>;
  runPluginTasks?: ReturnType<typeof createDoPlugin>;
}

export type TContext = Omit<Required<TInnerContext>, "plugins">;

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
}

// ------------- typescript definition -------------

// ------------- variable definition -------------

export const executeTypes = {
  发布npm包: 1,
  发布release: 2,
  发布tag: 3,
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
]);

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
  } as TInnerContext["config"];
}

// ------------- function definition -------------
