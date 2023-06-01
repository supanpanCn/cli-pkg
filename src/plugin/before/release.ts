import { TPlugin, TContext } from "../../helpers";

const release: TPlugin = async function (ctx: TContext) {
  if(!(await ctx.validate.githubActions(ctx))) ctx.quit();
  if (!(await ctx.validate.branch(ctx))) ctx.quit();
  if (!(await ctx.validate.gitClean(ctx))) ctx.quit();

  const branchName = await ctx.exec('git',['rev-parse','--abbrev-ref','HEAD'])
  const remoteBranch = await ctx.exec('git',['config','--get',`branch.${branchName}.remote`])
  const remoteUrl = await ctx.exec('git',['remote','get-url',remoteBranch])
  const latestTag = await ctx.exec('git',['describe','--match="*"',"--abbrev=0"])

  ctx.shared.gitRepo = {
    localBranch:branchName,
    remoteBranch,
    remoteUrl,
    latestTag
  }
};

release.lifecycle = "before:release";

export default release;
