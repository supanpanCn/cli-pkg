import { exec, TContext } from "../helpers";
import semver from "semver";
import pkgHooks from "../pkg";

export default async function (this: TContext) {
  await this.runPluginTasks!("before:publish");
  if (this.pkg) {
    const initialVersion = this.pkg.version;
    const isValid = semver.valid(initialVersion);
    const major = semver.major(initialVersion);
    const minor = semver.minor(initialVersion);
    const patch = semver.patch(initialVersion);
    const input = isValid ? `${major}.${minor}.${patch + 1}` : "";
    const version = await this.prompt.input(
      `请输入要发布的版本号,当前版本为${major}.${minor}.${patch}`,
      input
    );
    this.shared.nextVersion = version;
    if (
      await this.prompt.confirm(
        `是否将新的版本号(${version})更新到package.json文件`
      )
    ) {
      pkgHooks.updateVersion(this.pkg?.url, version!);
      this.pkg = pkgHooks.load(this);
    } else {
      this.quit();
    }
    this.log?.("START_PUBLISH_NPM", "green", {
      version,
      name: this.pkg.name,
    });
    await exec("npm", ["publish"]);
    
  } else {
    this.quit();
  }
  this.log?.("CUSTOM", "green", "已完成npm发布");
  await this.runPluginTasks!("after:publish");
}
