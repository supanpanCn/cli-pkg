import { TContext } from "../helpers";

export default async function (this:TContext) {
  this.log?.("CUSTOM","green","开始生成git release")
  await this.runPluginTasks!("before:release")
  const nextVersion = this.shared.nextVersion
  if(nextVersion){
    this.spinner.start();
    await this.exec("git", ["push", "origin", nextVersion]);
    this.spinner.stop();
  }
  this.log?.('CUSTOM',"green","已生成git Release")
  await this.runPluginTasks!("after:release")
}
