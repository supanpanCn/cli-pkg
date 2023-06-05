import { TContext } from "../helpers";
import pkgHooks from "../pkg";

export default async function (this: TContext) {
  this.log?.("CUSTOM","green","开始发布到npm")
  await this.runPluginTasks!("before:publish");
  if (this.pkg) {
    const version = this.shared.nextVersion
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
    this.log?.(
      "CUSTOM",
      "green",
      `执行npm包发布：版本号为${version}、包名称为${this.pkg.name}`
    );
    this.spinner.start();
    await this.exec("npm", ["publish"]);
    this.spinner.stop();
  } else {
    this.quit();
  }
  await this.runPluginTasks!("after:publish");
}
