import { exec, NPM_REGISTER_ADDRESS,TContext } from "./helpers";
import prompt from "./prompt";

export default async function (this:TContext) {
  await this.runPluginTasks!("before:tag")
  await this.runPluginTasks!("after:tag")
}
