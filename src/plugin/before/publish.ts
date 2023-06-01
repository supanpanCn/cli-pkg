import { TPlugin, TContext } from "../../helpers";
import prompt from "../../prompt";

const publish: TPlugin = async function (ctx: TContext) {
  ctx.log("CHANGE_NPM", "green");
  try {
    ctx.spinner.start()
    const logined = await ctx.exec("npm", [
      "whoami",
      "--registry",
      ctx.config.registry,
    ]);
    ctx.spinner.stop()
    if (logined) {
      if (!(await prompt.checkLoginedUser(logined))) ctx.quit();
    } else {
      if (!(await prompt.isLogin())) ctx.quit();
    }
  } catch (error) {
    if (!(await prompt.isLogin())) ctx.quit();
  }
  if (!(await ctx.validate.branch(ctx))) ctx.quit();
  if (!(await ctx.validate.gitClean(ctx))) ctx.quit();
};

publish.lifecycle = "before:publish";

export default publish;
