// @flow

import fs from "fs";
import shell from "shelljs";
import path from "path";
import program from "commander";
import { promisify } from "./util";

import type { DirectoryFlowTypedFile } from "./runner.h";

const exists: (filename: string) => Promise<boolean> = promisify(fs.exists);
const writeFile: (filename: string, data: string) => Promise<void> = promisify(
  fs.writeFile,
);
const appendFile: (filename: string, data: string) => Promise<void> = promisify(
  fs.appendFile,
);

export async function flowTypedExporter(
  moduleName: string,
  output: string,
  _index: number,
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

export async function flowTypedDirectoryExporter(
  { rootModuleName }: DirectoryFlowTypedFile,
  output: string,
  index: number,
): Promise<string> {
  const opts = program.opts();
  const out =
    typeof opts.flowTypedFormat === "string" ? opts.flowTypedFormat : "exports";
  const flowFolder = `${out}/flow_v0.35.x-`;
  const outputFile = `${out}/flow_v0.35.x-/${rootModuleName}.js`;

  const testfilePath = `${out}/test_${rootModuleName}.js`;

  if (!(await exists(flowFolder))) {
    shell.mkdir("-p", flowFolder);
  }
  if (index === 0 && (await exists(outputFile))) {
    await writeFile(outputFile, "");
  }
  await writeFile(testfilePath, "");
  await appendFile(outputFile, output);
  return testfilePath;
}
