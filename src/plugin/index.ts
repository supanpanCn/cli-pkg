import { TContext, TLifycycle,TPlugin } from "../helpers";
export { default as config } from "./before/config";
export { default as beforePublish } from "./before/publish";
export { default as afterPublish } from "./after/publish";
export { default as beforeRelease } from "./before/release";
export { default as success } from "./success";
import pSeries from "p-series";

export function createDoPlugin(ctx: TContext) {
  return async function (lifecycle: TLifycycle) {
    ctx.lifecycle = lifecycle;
    const willDo = ctx.plugins
      .filter((p) => p.lifecycle === lifecycle)
      .map((d) => () => d(ctx as TContext));
    await pSeries<()=>TPlugin>(willDo);
  };
}