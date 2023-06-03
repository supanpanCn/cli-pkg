import { TPlugin, TContext,yarnrc } from "../../helpers";

const publish: TPlugin = async function (ctx: TContext) {
  yarnrc.unlink()
  if (await ctx.prompt.confirm("是否将文件变动推送到远程仓库")) {
    ctx.spinner.start();
    await ctx.exec("git", ["add", "."]);
    const commit = await ctx.prompt.input(
      "请输入commit信息",
      `publish npm , The version number is ${ctx.shared.nextVersion}`
    );
    await ctx.exec("git", ["commit", "-m", commit]);
    await ctx.exec("git", ["push"]);
    ctx.spinner.stop();
  }
};

publish.lifecycle = "after:publish";

export default publish;
