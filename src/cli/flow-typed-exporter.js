// @flow
import fs from "fs";
import shell from "shelljs";

export default function exportForFlowTyped(moduleName: string, output: string) {
  const folder = "../exports/" + moduleName + "_v1.x.x";
  const outputFile = folder + "/flow_v0.35.x-/" + moduleName + ".js";

  const testfilePath = folder + "/test_" + moduleName + ".js";

  if (!fs.existsSync(folder)) {
    shell.mkdir('-p', folder);
    fs.existsSync(folder + "/flow_v0.35.x-") ||
      shell.mkdir('-p', folder + "/flow_v0.35.x-");
  }

  fs.writeFileSync(testfilePath, "");
  fs.writeFileSync(folder + "/flow_v0.35.x-/" + moduleName + ".js", output);

  return testfilePath;
}
