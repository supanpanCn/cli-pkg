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
      resolve(dir, "..", "..", "release.yml"),
      resolve(prefix, "..", "release.yml")
    );
    this.log!("SETUP_ACTIONS", "green");
    this.exec("git", ["add", "."]);
    const input = await prompt.commit();
    this.exec("git", ["commit", "-m", input]);
    this.exec("git", ["push"]);
  }
}
