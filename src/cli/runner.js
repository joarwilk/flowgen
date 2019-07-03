// @flow
import path from "path";
import fs from "fs";
import { promisify } from "./util";

import meta from "./meta";
import beautify from "./beautifier";

import compiler from "./compiler";

import defaultExporter from "./default-exporter";
import flowTypedExporter from "./flow-typed-exporter";

type RunnerOptions = {
  jsdoc: boolean,
  quiet: boolean,
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

const readDir = promisify(fs.readdir);

async function outputFile(
  flowDefinitions: string,
  { intro, file, moduleName, outputFile }: File,
  options: RunnerOptions,
  writeFile,
): Promise<void> {
  // Produce the flow library content
  try {
    // Write the output to disk
    const absoluteOutputFilePath: string = await writeFile(
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

function getFile(
  file: string,
  options: RunnerOptions,
  rawFile: string,
  isInDir: boolean,
): File {
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

  return { file, outputFile, moduleName, intro, mode };
}

async function bfs(rootDir: string, options: RunnerOptions): Promise<Array<File>> {
  const queue: Array<string> = [];
  const files: Array<File> = [];
  queue.push(rootDir);
  let current;
  while (queue.length) {
    current = queue.shift();
    try {
      const dir: Array<any> = await readDir(current, { withFileTypes: true });
      for (const file of dir) {
        if (file.isDirectory()) {
          queue.push(path.join(current, file.name));
        } else {
          if (!file.name.endsWith(".d.ts")) continue;
          files.push(
            getFile(path.join(current, file.name), options, rootDir, true),
          );
        }
      }
    } catch {
      files.push(getFile(current, options, rootDir, false));
    }
  }
  return files;
}
export default (options: RunnerOptions) => {
  // No real reason to return an object here instead of combining
  // the compile function into the wrapper, but I like the API it produces.
  return {
    compile: async (rawFiles: Array<string>): Promise<void> => {
      let files = [];
      // Iterate all the files the user has passed in
      for (const rawFile of rawFiles) {
        files.push(...(await bfs(rawFile, options)));
      }
      if (files.length > 1) {
        const sources = compiler.compileDefinitionFiles(
          files.map(v => v.file),
          {
            jsdoc: options.jsdoc,
            quiet: options.quiet,
            interfaceRecords: options.interfaceRecords,
            moduleExports: options.moduleExports,
          },
        );
        for (let index = 0; index < sources.length; index++) {
          const [, flowDefinitions] = sources[index];
          const file = files[index];
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
          outputFile(flowDefinitions, file, options, writeFile);
        }
      } else {
        const file = files[0];
        const flowDefinitions = compiler.compileDefinitionFile(file.file, {
          jsdoc: options.jsdoc,
          quiet: options.quiet,
          interfaceRecords: options.interfaceRecords,
          moduleExports: options.moduleExports,
        });

        let writeFile = defaultExporter;
        if (file.mode === "flow-typed") writeFile = flowTypedExporter;
        // Let the user know what's going on
        console.log("Parsing", file.moduleName);
        outputFile(flowDefinitions, file, options, writeFile);
      }
      if (files.length >= 3) process.stdout.write("\n");
    },
  };
};

function getModuleNameFromFile(fileName: string): string {
  return path.basename(fileName).replace(".d.ts", "");
}

function getMode(
  options: RunnerOptions,
  file: string,
  isDir: boolean,
): "directory" | "flow-typed" | "file" {
  if (isDir) return "directory";
  if (options.flowTypedFormat) return "flow-typed";
  return "file";
}

function getOutputFile(
  options: RunnerOptions,
  file: string,
  prefix: string,
  isDir: boolean,
): string {
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
