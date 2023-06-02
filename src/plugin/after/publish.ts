import { TPlugin, TContext } from "../../helpers";
import prompt from "../../prompt";
import pkgHooks from "../../pkg";

const publish: TPlugin = async function (ctx: TContext) {
  if (await prompt.updatePkg(ctx.shared.nextVersion, "publish")) {
    pkgHooks.updateVersion(ctx.pkg?.url, ctx.shared.nextVersion);
    ctx.pkg = pkgHooks.load(ctx as TContext);
  }
  if(await prompt.requestDoReleaseAfterPublish()){
    await ctx.createRelease()
  }
};

publish.lifecycle = "after:publish";

export default publish;
