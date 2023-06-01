import { TContext } from "./helpers";
import prompt from "./prompt";

export default async function (this:TContext) {
  await this.runPluginTasks!("before:release")
  const  {
    localBranch,
    remoteBranch,
    remoteUrl,
    latestTag
  } = this.shared.gitRepo || {}
  
  await this.runPluginTasks!("after:release")
}
