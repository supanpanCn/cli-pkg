import { TPlugin, TContext } from "../../helpers";

const config: TPlugin = async function (ctx: TContext) {
  ctx.config.ignoreGitChangeFiles.push('.yarnrc')
  ctx.config.ignoreGitChangeFiles = [
    ...new Set(ctx.config.ignoreGitChangeFiles),
  ];
};

config.lifecycle = "config";

export default config;
