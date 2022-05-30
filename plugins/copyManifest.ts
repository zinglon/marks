import * as path from "path";
import * as fs from "fs";
import { Plugin } from "rollup";

export const copyManifest = (): Plugin => {
  return {
    name: "copy-manifest",
    load() {
      this.addWatchFile(path.resolve("./manifest.json"));
      return undefined;
    },
    generateBundle() {
      if (!fs.existsSync("./dist")) fs.mkdirSync("./dist");

      fs.copyFileSync(
        path.resolve("./manifest.json"),
        path.resolve("./dist/manifest.json")
      );
    },
  };
};
