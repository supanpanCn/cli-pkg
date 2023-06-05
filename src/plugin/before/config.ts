import { TPlugin, TContext } from "../../helpers";
import PKG from "../../pkg";

const config: TPlugin = async function (ctx: TContext) {
  ctx.config.ignoreGitChangeFiles?.push(".yarnrc");
  ctx.config.ignoreGitChangeFiles = [
    ...new Set(ctx.config.ignoreGitChangeFiles),
  ];
  if (ctx.config.pkgName) {
    const pkg = PKG.load(ctx);
    if (pkg.name !== ctx.config.pkgName) {
      ctx.log?.(
        "CUSTOM",
        "red",
        `package.json中的name（${pkg.name}）与配置的pkgName（${ctx.config.pkgName}）不一致`
      );
      ctx.quit();
    }
  }
};

config.lifecycle = "config";

export default config;
