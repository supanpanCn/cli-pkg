import { TContext } from "../helpers";

export default async function tag(this: TContext) {
  const form = await this.prompt.form("请填写表单", [
    {
      name: "tagName",
      message: "请填写tag名称",
      initial: this.shared.latestTag || "",
    },
    {
      name: "remark",
      message: "请填写备注",
      initial: "create tag",
    },
  ]);

  if (!form.tagName) {
    this.log?.("CUSTOM", "red", "请填写tagName");
    this.stopAfterPlugin();
    await this.createTag();
    return;
  }

  this.shared.latestTag = form.tagName;

  await this.runPluginTasks!("before:tag");

  this.exec("git", ["tag", form.tagName, "-m", form.remark]);

  if (this.rungingLifeCycle?.lifecycle.includes("tag")) {
    this.spinner.start();
    this.exec("git", ["push", "origin", form.tagName]);
    this.spinner.stop();
  }

  await this.runPluginTasks!("after:tag");

  this.log?.('CUSTOM',"green","已完成Tag生成")
}
