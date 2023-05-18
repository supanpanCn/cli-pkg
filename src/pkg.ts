import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { log } from "./helpers";

function load() {
  try {
    const url = resolve(process.cwd(), "package.json");
    const pkg: any = JSON.parse(readFileSync(url, "utf-8"));
    return {
      version: pkg.version,
      scripts: pkg.scripts,
      name: pkg.name,
      url,
    };
  } catch (_) {
    log("LOAD_PKG");
    process.exit(1);
  }
}

function update(url: string, version: string) {
  if (existsSync(url)) {
    let code = readFileSync(url, "utf-8");
    const reg = /"[\s]*?version[\s]*?"[\s]*?:[\s]*?"(.*?)"/g;
    const m = code.match(reg);
    if (Array.isArray(m)) {
      code = code.replace(m[0], `"version":"${version}"`);
    }
    writeFileSync(url!, code,"utf-8");
  }
}

export default {
  load,
  update,
};
