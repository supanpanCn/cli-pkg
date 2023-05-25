import { TContext } from "./helpers";

async function branch(ctx: TContext) {
  const { allowedBranch } = ctx.config;
  const actBranch = await ctx.exec("git", ["branch", "--show-current"]);
  if (!allowedBranch.find((branch) => branch === actBranch)) {
    ctx.log!("NONLICET_BRANCH", "red", actBranch);
    return false;
  }
  return true;
}

async function gitClean(ctx: TContext) {
  const gitIsDirty = await ctx.exec("git", ["status", "--porcelain"]);
  console.log(gitIsDirty)
  debugger
  if (gitIsDirty) {
    ctx.log("DIRTY_GIT", "red");
    return false;
  }
  return true;
}

export default {
  branch,
  gitClean,
};
