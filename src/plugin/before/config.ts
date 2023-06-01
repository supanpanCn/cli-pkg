import { TPlugin, TContext } from "../../helpers";
import prompt from "../../prompt";

const config: TPlugin = async function (ctx: TContext) {
  ctx.config.ignoreGitChangeFiles = [
    ...new Set(ctx.config.ignoreGitChangeFiles),
  ];

  if (await prompt.requestChangeToNpm(ctx.config.registry)) {
    await ctx.exec("npm", ["set", "registry", ctx.config.registry]);
  } else {
    ctx.quit();
  }
};

config.lifecycle = "config";

export default config;
