import { TInnerContext, TContext, TLifycycle } from "../helpers";
export { default as config } from "./before/config";
export { default as beforePublish } from "./before/publish";
export { default as success } from "./success";
import pSeries from "p-series";

export function createDoPlugin(ctx: TInnerContext) {
  return async function (lifecycle: TLifycycle) {
    ctx.lifecycle = lifecycle;
    const willDo = ctx.plugins
      .filter((p) => p.lifecycle === lifecycle)
      .map((d) => () => d(ctx as TContext));
    await pSeries(willDo as any[]);
  };
}
