import type { AnyObj } from "su-helpers";
import { createLog } from "su-helpers";
import ora from "ora";
import semver from "semver";
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
  unlinkSync,
} from "node:fs";
// @ts-ignore
import { outputFileSync } from "fs-extra";
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
    runAt?: string;
    pkgName?: string;
    registry?: string;
    firstCall?: "createRelease" | "createTag" | "publishNpm";
    packageManage?: "npm" | "pnpm" | "yarn" | "cnpm";
    allowedBranch?: string[];
    ignoreGitChangeFiles: string[];
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
    willPlugins?: TPlugin[];
    gitRepoUrl?:string;
    [other: string]: any;
  };
  stopAfterPlugin: typeof stopAfterPlugin;
  quit: () => void;
  rungingLifeCycle?: TPlugin;
  pkg?: AnyObj;
  log?: ReturnType<typeof initLog>;
  runPluginTasks?: ReturnType<typeof createDoPlugin>;
}

export interface TPlugin {
  (ctx: TContext): Promise<any>;
  lifecycle: TLifycycle;
}

export interface TMessageKey {
  CUSTOM: string;
}

// ------------- typescript definition -------------

// ------------- variable definition -------------

export const executeTypes = {
  "发布npm，创建release、tag": 1,
  初始化前端工程: 2,
};

export const messages = new Map<keyof TMessageKey, string | Function>([
  ["CUSTOM", (msg: string) => `${msg}`],
]);

export const yarnrc = {
  url: ".yarnrc",
  back: {
    type: "",
    data: "",
  },
  check(ctx: TContext) {
    const REGISTRY = ctx.config.registry || "https://registry.npmjs.org/";
    if (existsSync(yarnrc.url)) {
      const code = readFileSync(yarnrc.url, "utf-8");
      if (code.trim()) {
        const reg = /registry[\s]+('|")(.*?)(\1)/g;
        const m = code.match(reg);
        yarnrc.back.data = code;
        yarnrc.back.type = "part";
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
      } else {
        appendFileSync(yarnrc.url, `\nregistry "${REGISTRY}"`);
      }
    } else {
      yarnrc.back.type = "all";
      outputFileSync(yarnrc.url, `registry "${REGISTRY}"`);
    }
  },
  unlink() {
    if (yarnrc.back.type === "all") {
      unlinkSync(yarnrc.url);
    } else if (yarnrc.back.type === "part") {
      writeFileSync(yarnrc.url, yarnrc.back.data, "utf-8");
    }
    yarnrc.back.type = "";
    yarnrc.back.data = "";
  },
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
    text: "当前任务比较耗时，请耐心等待...\n",
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

export function sleep() {
  return new Promise((resolve) => {
    setupTimeout(resolve);
  });
}

export function stopAfterPlugin(this: TContext) {
  const plugins = this.shared.willPlugins || [];
  let splitIndex = -1;
  for (let i = 0; i < plugins?.length; i++) {
    if (plugins[i] === this.rungingLifeCycle) {
      splitIndex = i + 1;
      break;
    }
  }
  if (splitIndex > -1) {
    this.shared.willPlugins = this.shared.willPlugins?.slice(0, splitIndex);
  }
}

export function validatePkgName(ctx: TContext) {
  if (ctx.config.pkgName) {
  }
}

export function getNextVersion(initialVersion: string) {
  const isValid = semver.valid(initialVersion);
  const major = semver.major(initialVersion);
  const minor = semver.minor(initialVersion);
  const patch = semver.patch(initialVersion);
  const input = isValid ? `${major}.${minor}.${patch + 1}` : "";
  return input;
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
    firstCall: "createTag",
  } as TContext["config"];
}

// ------------- function definition -------------
