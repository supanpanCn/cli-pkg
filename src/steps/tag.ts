import { TContext } from "../helpers";

export default async function tag(this: TContext) {
  this.log?.("CUSTOM","green","开始生成git tag")
  const nextTag = `v${this.shared.nextVersion}`
  const form = await this.prompt.form("请填写表单", [
    {
      name: "tagName",
      message: "请填写tag名称",
      initial: nextTag || "",
    },
    {
      name: "remark",
      message: "请填写备注",
      initial: "create tag",
    },
  ]);

  if (!form.tagName) {
    this.log?.("CUSTOM", "yellow", "请填写tagName");
    this.stopAfterPlugin();
    await this.createTag();
    return;
  }

  this.shared.nextVersion = form.tagName;

  await this.runPluginTasks!("before:tag");

  let isBreak = false
  const tagString = await this.exec('git',['tag'])
  if(tagString){
    const tags = tagString.split('\n')
    if(tags.find(tag=>tag === form.tagName)){
      isBreak = true
    }
  }

  !isBreak && await this.exec("git", ["tag", form.tagName, "-m", form.remark]);

  this.log?.('CUSTOM',"green",`已生成tag，新tag为:${form.tagName}`)

  await this.runPluginTasks!("after:tag");

}
