// tsup.config.ts
import type { Options } from "tsup";
export const tsup: Options = {
  sourcemap:true,
  clean: true,
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
  },
  entry:['src/index.ts']
};
