import { TContext } from "../helpers";
import { resolve } from "node:path";
import prompt from "../prompt";
import { _dirname } from "../helpers";
// @ts-ignore
import { copySync } from "fs-extra";

export default async function (
  this: TContext,
  dir?: string,
  prefix?: string
) {
  dir = dir || _dirname("cli-pkg");
  prefix = prefix || resolve(process.cwd(), ".github", "workflows", "release");
  if (dir) {
    copySync(
      resolve(dir, "..", "..", ".github","workflows",'create-release.yml'),
      resolve(prefix, "..", "release.yml")
    );
    this.log!("SETUP_ACTIONS", "green");
    await this.exec("git", ["add", "."]);
    const input = await prompt.commit();
    console.log(input,'输入是啥啊')
    debugger
    await this.exec("git", ["commit", "-m", input]);
    await this.exec("git", ["push"]);
  }
}
