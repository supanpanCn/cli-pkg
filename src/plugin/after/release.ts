import { TPlugin, TContext,yarnrc } from "../../helpers";

const release: TPlugin = async function (ctx: TContext) {
  if(ctx.config.createReleaseBaseOnPkgVersion){
    
  }
};

release.lifecycle = "after:release";

export default release;
