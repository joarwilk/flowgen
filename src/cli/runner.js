// @flow
import path from "path";
import fs from "fs";
import {promisify} from "./util";

import meta from "./meta";
import beautify from "./beautifier";

import compiler from "./compiler";

import defaultExporter from "./default-exporter";
import flowTypedExporter from "./flow-typed-exporter";

type RunnerOptions = {
  jsdoc: boolean,
  interfaceRecords: boolean,
  moduleExports: boolean,
  version: string,
  out: string,
  flowTypedFormat: boolean,
  addFlowHeader: boolean,
  compileTests: boolean,
};

type File = {|
  mode: "file" | "directory" | "flow-typed",
  moduleName: string,
  file: string,
  outputFile: string,
  intro: string,
|};

function compileFile(
  { file, moduleName, outputFile, intro }: File,
  options: RunnerOptions,
  writeFile,
) {
  // Produce the flow library content
  try {
    const flowDefinitions = compiler.compileDefinitionFile(file, {
      jsdoc: options.jsdoc,
      interfaceRecords: options.interfaceRecords,
      moduleExports: options.moduleExports,
    });

    // Write the output to disk
    const absoluteOutputFilePath: string = writeFile(
      outputFile,
      beautify(intro + flowDefinitions),
    );

    // Check if we should compile tests as well
    if (options.compileTests) {
      // Assume tests file is in same dir, named <filename>-tests.ts
      // Based on DD conventions
      const testFileName = path.dirname(file) + "/" + moduleName + "-tests.ts";
      const testFileOutput =
        path.dirname(absoluteOutputFilePath) + "/test_" + moduleName + ".js";

      // Try to compile the test file. Will fail silently if not present.
      compiler.compileTest(testFileName, testFileOutput);
    }
  } catch (e) {
    console.error("Parsing", moduleName, "failed");
    console.error(e);
  }
}

async function processFile(
  file: string,
  files: File[],
  options: RunnerOptions,
  rawFile: string,
  isInDir: boolean,
) {
  if (!file.endsWith('.d.ts')) return
  // Get the module name from the file name
  const moduleName = getModuleNameFromFile(file);

  // The format of the output argument varies a bit based on which
  // exporting format we're using. For flow-typed, only the module name
  // is required, otherwise we use the cli arg.
  const outputFile = getOutputFile(options, file, rawFile, isInDir);
  const mode = getMode(options, file, isInDir);

  // Get the intro text
  let intro = meta(
    moduleName,
    options.version,
    options.addFlowHeader || mode === "directory",
  );

  files.push({ file, outputFile, moduleName, intro, mode });
}

async function processDirectory(
  dir: string,
  files: File[],
  options: RunnerOptions,
  rawFile: string,
) {
  const directory = await promisify(fs.readdir)(dir);
  for (const file of directory) {
    const isDirectory = (await promisify(fs.lstat)(
      path.join(dir, file),
    )).isDirectory();
    if (isDirectory) {
      await processDirectory(path.join(dir, file), files, options, rawFile);
    } else {
      await processFile(path.join(dir, file), files, options, rawFile, true);
    }
  }
}

export default (options: RunnerOptions) => {
  // No real reason to return an object here instead of combining
  // the compile function into the wrapper, but I like the API it produces.
  return {
    compile: async (rawFiles: Array<string>): Promise<void> => {
      let files = [];
      // Iterate all the files the user has passed in
      for (const rawFile of rawFiles) {
        const isDirectory = (await promisify(fs.lstat)(rawFile)).isDirectory();
        if (isDirectory) {
          await processDirectory(rawFile, files, options, rawFile);
        } else {
          await processFile(rawFile, files, options, rawFile, false);
        }
      }
      for (const [index, file] of files.entries()) {
        let writeFile = defaultExporter;
        if (file.mode === "flow-typed") writeFile = flowTypedExporter;
        // Let the user know what's going on
        if (files.length >= 3) {
          // If we're compiling a lot of files, show more stats
          const progress = Math.round(((index + 1) / files.length) * 100);
          process.stdout.write("\r\x1b[K");
          process.stdout.write(progress + "% | " + file.moduleName);
        } else {
          console.log("Parsing", file.moduleName);
        }
        compileFile(file, options, writeFile);
      }
      if (files.length >= 3) process.stdout.write("\n");
    },
  };
};

function getModuleNameFromFile(fileName: string): string {
  return path.basename(fileName).replace(".d.ts", "");
}

function getMode(options: RunnerOptions, file: string, isDir: boolean) {
  if (isDir) return "directory";
  if (options.flowTypedFormat) return "flow-typed";
  return "file";
}

function getOutputFile(
  options: RunnerOptions,
  file: string,
  prefix: string,
  isDir: boolean,
) {
  if (isDir) {
    return path.normalize(
      file.replace(prefix, `exports${path.sep}`).replace(".d.ts", ".js.flow"),
    );
  }
  if (options.flowTypedFormat) {
    return getModuleNameFromFile(file);
  } else {
    return options.out;
  }
}
