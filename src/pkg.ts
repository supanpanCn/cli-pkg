import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { TContext } from "./helpers";
export interface Pkg {
  name: string;
  version: string;
  scripts: string;
  url: string;
}

function load(ctx: TContext) {
  try {
    const url = resolve(process.cwd(), "package.json");
    const pkg: any = JSON.parse(readFileSync(url, "utf-8"));
    return {
      ...pkg,
      url,
    } as Pkg;
  } catch (_) {
    ctx.log?.("CUSTOM","red","package.json读取失败");
    process.exit(1);
  }
}

function updateVersion(url: string, version: string) {
  if (existsSync(url)) {
    let code = readFileSync(url, "utf-8");
    const reg = /"[\s]*?version[\s]*?"[\s]*?:[\s]*?"(.*?)"/g;
    const m = code.match(reg);
    if (Array.isArray(m)) {
      code = code.replace(m[0], `"version":"${version}"`);
    }
    writeFileSync(url!, code, "utf-8");
  }
}

export default {
  load,
  updateVersion,
};
