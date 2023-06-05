import { TPlugin, TContext, yarnrc } from "../../helpers";

const publish: TPlugin = async function (ctx: TContext) {
  ctx.log?.("CUSTOM", "green", "已发布到npm");
  yarnrc.unlink();
  if (await ctx.prompt.confirm("是否将文件变动推送到远程仓库")) {
    const form = await ctx.prompt.form("请填写表单", [
      {
        name: "remark",
        message: "请填写commit备注",
        initial: `publish ${ctx.shared.nextVersion}`,
      },
    ]);
    await ctx.exec("git", ["add", "."]);
    await ctx.exec("git", ["commit", "-m", form.remark]);
    try {
      ctx.spinner.start();
      await ctx.exec("git", ["push"]);
      ctx.spinner.stop();
      ctx.log?.("CUSTOM", "green", "已更新package.json");
    } catch (_) {
      ctx.log?.("CUSTOM","yellow","请手动执行git push推送到远程仓库")
    }
  }
  
};

publish.lifecycle = "after:publish";

export default publish;
