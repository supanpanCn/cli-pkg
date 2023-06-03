import { TPlugin, TContext } from "../../helpers";

const release: TPlugin = async function (ctx: TContext) {
  if(!(await ctx.validate.githubActions(ctx))) ctx.quit();
  if (!(await ctx.validate.branch(ctx))) ctx.quit();
  if (!(await ctx.validate.gitClean(ctx))) ctx.quit();
  ctx.shared.latestTag = await ctx.exec('git',['describe',`--match=*`,`--abbrev=0`])
};

release.lifecycle = "before:release";

export default release;
