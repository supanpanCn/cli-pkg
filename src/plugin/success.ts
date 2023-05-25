import { TPlugin, TContext,TInnerContext } from "../helpers";
import prompt from "../prompt";
import pkgHooks from "../pkg";

const success: TPlugin = async function (ctx: TContext) {
  if (await prompt.updatePkg(ctx.shared.nextVersion, "publish")) {
    pkgHooks.updateVersion(ctx.pkg.url, ctx.shared.nextVersion);
    ctx.pkg = pkgHooks.load(ctx as TInnerContext)
    ctx.shared = {}
  }
};

success.lifecycle = "success";

export default success;
