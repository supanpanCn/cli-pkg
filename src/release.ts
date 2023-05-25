import { exec, NPM_REGISTER_ADDRESS,TContext } from "./helpers";
import prompt from "./prompt";

export default async function (this:TContext) {
  await this.runPluginTasks!("before:release")
  await this.runPluginTasks!("after:release")
}
