import { TPlugin, TContext } from "../../helpers";

const success: TPlugin = async function (ctx: TContext) {
  ctx.shared = {};
  ctx.log?.("CUSTOM","green","执行成功，程序即将退出")
};

success.lifecycle = "success";

export default success;
