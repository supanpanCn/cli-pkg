import { PKG_NAME, TPlugin, TContext } from "../../helpers";

const config: TPlugin = async function (ctx: TContext) {
  ctx.config.runAt = PKG_NAME
  ctx.config.allowedBranch = ["main"]
  ctx.config.ignoreGitChangeFiles = ['yarn.lock','package-lock.json','pnpm-lock.yaml','yarn-error.log']
};

config.lifecycle = "config";

export default config;
