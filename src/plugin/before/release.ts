import { TPlugin, TContext } from "../../helpers";

const release: TPlugin = async function (ctx: TContext) {
  if(!(await ctx.validate.githubActions(ctx))) ctx.quit();
  if (!(await ctx.validate.branch(ctx))) ctx.quit();
  if (!(await ctx.validate.gitClean(ctx))) ctx.quit();
  const latestTag = await ctx.exec('git',['describe','--match="*"',"--abbrev=0"])
  ctx.shared.latestTag = latestTag
};

release.lifecycle = "before:release";

export default release;
