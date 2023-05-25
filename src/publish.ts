import { exec, NPM_REGISTER_ADDRESS,TContext } from "./helpers";
import prompt from "./prompt";

export default async function (this:TContext) {
  await this.runPluginTasks!("before:publish")
  if (this.pkg) {
    await exec("npm", ["set", "registry", NPM_REGISTER_ADDRESS]);
    this.log("CHANGE_NPM", "green");
    if (await prompt.isLogin()) {
      const version = await prompt.genVersion(this.pkg.version);
      this.log("START_PUBLISH_NPM", "green", {
        version,
        name: this.pkg.name,
      });
      await exec("npm",["publish"])
      this.shared.nextVersion = version;
    }else{
      this.quit()
    }
  }else{
    this.quit()
  }
  await this.runPluginTasks!("after:publish")
}
