import { TPlugin, TContext, yarnrc, sleep } from "../../helpers";

const msgs = {
  login: "无法获取当前登陆用户，请手动检查当前登陆的npm账户，并确认是否继续？",
  user: (username: string) =>
    `检测到当前登陆的npm账号为：${username}，请确认是否继续？`,
  registry: (registry: string) => `请求切换到npm：${registry}`,
};

const publish: TPlugin = async function (ctx: TContext) {
  const registry = ctx.config.registry!;
  if (await ctx.prompt.confirm(msgs.registry(registry))) {
    ctx.spinner.start();
    yarnrc.check(ctx);
    await sleep();
    await ctx.exec("npm", ["set", "registry", registry]);
    ctx.spinner.stop();
  } else {
    ctx.quit();
  }
  ctx.log?.("CUSTOM", "green","已切换到npm");

  try {
    ctx.spinner.start();
    const logined = await ctx.exec("npm", ["whoami", "--registry", registry]);
    ctx.spinner.stop();
    if (logined) {
      if (!(await ctx.prompt.confirm(msgs.user(logined)))) ctx.quit();
    } else {
      if (!(await ctx.prompt.confirm(msgs.login))) ctx.quit();
    }
    if (!(await ctx.validate.branch(ctx))) ctx.quit();
    if (!(await ctx.validate.gitClean(ctx))) ctx.quit();
  } catch (error) {
    if (!(await ctx.prompt.confirm(msgs.login))) ctx.quit();
  }
};

publish.lifecycle = "before:publish";

export default publish;
