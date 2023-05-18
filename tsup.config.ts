// tsup.config.ts
import type { Options } from "tsup";
export const tsup: Options = {
  clean: true,
  format: ["cjs", "esm"],
  dts: {
    resolve: true,
  },
  entry:['src/index.ts']
};
