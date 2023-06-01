import { TPlugin, TContext } from "../helpers";

const success: TPlugin = async function (ctx: TContext) {
  ctx.shared = {};
};

success.lifecycle = "success";

export default success;
