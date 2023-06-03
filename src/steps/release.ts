import { TContext } from "../helpers";

export default async function (this:TContext) {
  await this.runPluginTasks!("before:release")
  const latestTag = this.shared.latestTag
  if(latestTag){
    this.spinner.start();
    this.exec("git", ["push", "origin", latestTag]);
    this.spinner.stop();
  }
  this.log?.('CUSTOM',"green","已完成Release发布")
  await this.runPluginTasks!("after:release")
}
