import { TContext } from "../helpers";
import { resolve } from "node:path";
import { _dirname } from "../helpers";
// @ts-ignore
import { copySync } from "fs-extra";

export default async function (
  this: TContext,
  dir?: string,
  prefix?: string
) {
  dir = dir || _dirname("cli-pkg");
  prefix = prefix || resolve(process.cwd(), ".github", "workflows");
  if (dir) {
    copySync(
      resolve(dir, "..", "..", ".github","workflows",'create-release.yml'),
      resolve(prefix,"release.yml")
    );
    this.log?.("CUSTOM", "green","已完成github Actions文件的创建，正在帮您推送到远程");
    await this.exec("git", ["add", "."]);
    const input = await this.prompt.input('请为当前commit添加备注','配置github Actions');
    this.spinner.start();
    await this.exec("git", ["commit", "-m", input]);
    await this.exec("git", ["push",'-f']);
    this.log?.('CUSTOM',"green","已完成git Actions初始化")
    this.spinner.stop();
  }
  this.log?.('CUSTOM',"green","已完成git Actions初始化")
}
