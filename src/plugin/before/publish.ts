import { TPlugin, TContext } from "../../helpers";

const publish: TPlugin = async function (ctx: TContext) {
  if (!(await ctx.validate.branch(ctx))) ctx.quit();
  if (!(await ctx.validate.gitClean(ctx))) ctx.quit();
};

publish.lifecycle = "before:publish";

export default publish;
