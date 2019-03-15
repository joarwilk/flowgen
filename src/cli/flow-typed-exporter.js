// @flow

import fs from "fs";
import shell from "shelljs";
import program from "commander";
import { promisify } from "./util";

const exists: (filename: string) => Promise<boolean> = promisify(fs.exists);
const writeFile: (filename: string, data: string) => Promise<void> = promisify(fs.writeFile);

export default async function exportForFlowTyped(
  moduleName: string,
  output: string,
): Promise<string> {
  const opts = program.opts();
  const out =
    typeof opts.flowTypedFormat === "string" ? opts.flowTypedFormat : "exports";
  const folder = `./${out}/${moduleName}_v1.x.x`;
  const flowFolder = `${folder}/flow_v0.35.x-`;
  const outputFile = `${folder}/flow_v0.35.x-/${moduleName}.js`;

  const testfilePath = `${folder}/test_${moduleName}.js`;

  if (!(await exists(flowFolder))) {
    shell.mkdir("-p", flowFolder);
  }
  await writeFile(testfilePath, "");
  await writeFile(outputFile, output);
  return testfilePath;
}
