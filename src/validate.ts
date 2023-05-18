import { args, exec, log, LEGAL_BRANCH, runArr } from "./helpers";
import prompt from "./prompt";

export default async function () {
  const checks = args.checks.split(",");
  const branchs = args.branch.split(",");

  if (checks.includes("branch")) {
    const actBranch = await exec("git", ["branch", "--show-current"]);
    if (
      !LEGAL_BRANCH.find((branch) => branch === actBranch) &&
      !branchs.find((branch) => branch === actBranch)
    ) {
      log("NONLICET_BRANCH", "red", actBranch);
      return false;
    }
  }
  if (checks.includes("git")) {
    const gitIsDirty = await exec("git", ["status", "--porcelain"]);
    if (gitIsDirty) {
      log("DIRTY_GIT", "red");
      return false;
    }
    if (await prompt.validateGit()) {
      
      const regs: RegExp[] = [];
      runArr<string>(LEGAL_BRANCH, (branch) => {
        regs.push(
          new RegExp(
            `\\W${branch}\\W.*(?:fast-forwardable|local out of date)`,
            "i"
          )
        );
      });
      let isNotSync = false;
      const diffInfo = await exec("git", ["remote", "show", "origin"], {
        stdio: "pipe",
      });
      runArr<RegExp>(regs, (reg) => {
        if (reg.test(diffInfo)) {
          isNotSync = true;
          return "break";
        }
      });
      if (isNotSync) {
        log("SYNC_GIT", "red");
        return false;
      }
    }
  }

  return true;
}
