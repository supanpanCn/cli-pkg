import { runArr, TContext, _dirname } from "./helpers";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

async function branch(ctx: TContext) {
  const { allowedBranch } = ctx.config;
  const actBranch = await ctx.exec("git", ["branch", "--show-current"]);
  if (!allowedBranch?.find((branch) => branch === actBranch)) {
    ctx.log?.("CUSTOM", "red", `不支持在${actBranch}分支执行操作`);
    return false;
  }
  return true;
}

async function gitClean(ctx: TContext) {
  const gitIsDirty = await ctx.exec("git", ["status", "--porcelain"]);
  const ignores = ctx.config.ignoreGitChangeFiles;
  if (gitIsDirty) {
    const changes = gitIsDirty.split("\n");
    runArr<string>(ignores, (ig, i) => {
      const index = changes.findIndex((c) => c.indexOf(ig) > -1);
      if (index > -1) {
        changes.splice(index, 1);
      }
    });
    if (changes.length) {
      ctx.log?.("CUSTOM", "red","本地存在未commit的文件变动");
      return false;
    }
  }
  return true;
}

async function githubActions(ctx: TContext) {
  const prefix = resolve(process.cwd(), ".github", "workflows");
  const msg = `检测到您还未配置github Actions，是否允许${ctx.config.runAt}帮您自动创建？`;
  if (
    !existsSync(resolve(prefix, "release.yml")) &&
    !existsSync(resolve(prefix, "release.yaml"))
  ) {
    if (await ctx.prompt.confirm(msg)) {
      const dir = _dirname("cli-pkg");
      if (dir) {
        await ctx.initGithubActions(dir, prefix);
      }
    } else {
      return false;
    }
  }
  return true;
}

export default {
  branch,
  gitClean,
  githubActions,
};
