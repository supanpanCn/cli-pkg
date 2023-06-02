import { runArr, TContext , _dirname } from "./helpers";
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import prompt from './prompt'


async function branch(ctx: TContext) {
  const { allowedBranch } = ctx.config;
  const actBranch = await ctx.exec("git", ["branch", "--show-current"]);
  if (!allowedBranch.find((branch) => branch === actBranch)) {
    ctx.log!("NONLICET_BRANCH", "red", actBranch);
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
      ctx.log!("DIRTY_GIT", "red");
      return false;
    }
  }
  return true;
}

async function githubActions(ctx: TContext) {
  const prefix = resolve(process.cwd(),'.github','workflows','release')
  if(!existsSync(resolve(prefix,'.yml')) && !existsSync(resolve(prefix,'.yaml'))){
    if(await prompt.githubActions(ctx)){
      const dir = _dirname('cli-pkg')
      if(dir){
        await ctx.initGithubActions(dir,prefix)
        return true
      }
    }
  }
  return false
}


export default {
  branch,
  gitClean,
  githubActions
};
