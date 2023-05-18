import validate from "./validate";
import prompt from "./prompt";
import pkgHooks from "./pkg";
import { log, exec, NPM_REGISTER_ADDRESS } from "./helpers";

async function main() {
    // 分类：tag、release、publish
  if (await validate()) {
    const pkg = pkgHooks.load();
    if (pkg) {
      await exec("npm", ["set", "registry", NPM_REGISTER_ADDRESS]);
      log("CHANGE_NPM", "green");
      if (await prompt.isLogin()) {
        if (await prompt.build()) {
            const npmscript = await prompt.runBuild(pkg.scripts)
            if(npmscript){
                await exec("npm", ["run",npmscript]);
            }
        }
        const version = await prompt.genVersion(pkg.version)
        log("START_PUBLISH_NPM","green",{
            version,
            name:pkg.name
        })

        // await exec("npm",["publish"])

        if(await prompt.updatePkg(version)){
            pkgHooks.update(pkg.url,version)

        }


      }
    }
  }
}

main();
