import { runArr, TInnerContext , _dirname } from "./helpers";
import { resolve } from 'node:path'
import { existsSync } from 'node:fs'
import prompt from './prompt'
// @ts-ignore
import { copySync} from 'fs-extra'

async function branch(ctx: TInnerContext) {
  const { allowedBranch } = ctx.config;
  const actBranch = await ctx.exec("git", ["branch", "--show-current"]);
  if (!allowedBranch.find((branch) => branch === actBranch)) {
    ctx.log!("NONLICET_BRANCH", "red", actBranch);
    return false;
  }
  return true;
}

async function gitClean(ctx: TInnerContext) {
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

async function githubActions(ctx: TInnerContext) {
  const prefix = resolve(process.cwd(),'.github','workflows','release')
  if(!existsSync(resolve(prefix,'.yml')) && !existsSync(resolve(prefix,'.yaml'))){
    if(await prompt.githubActions(ctx)){
      const dir = _dirname('cli-pkg')
      if(dir){
        copySync(resolve(dir,'..','..','release.yml'),resolve(prefix,'..','release.yml'))
        ctx.log!("SETUP_ACTIONS","green")
        ctx.exec('git',['add','.'])
        const input = await prompt.commit()
        ctx.exec('git',['commit','-m',input])
        ctx.exec('git',['push'])
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
