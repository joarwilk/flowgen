import path from "path";
import fs from "fs";
import { promisify } from "./util";

import meta from "./meta";
import beautify from "./beautifier";

import compiler from "./compiler";

import defaultExporter from "./default-exporter";
import {
  flowTypedExporter,
  flowTypedDirectoryExporter,
} from "./flow-typed-exporter";
import type { File, RunnerOptions, Mode, OutputFile } from "./runner.h";

const readDir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);

async function outputFile(
  flowDefinitions: string,
  { intro, index, file, moduleName, outputFile }: File,
  options: RunnerOptions,
  writeFile,
): Promise<void> {
  // Produce the flow library content
  try {
    // Write the output to disk
    let code = intro + flowDefinitions;
    try {
      code = beautify(code);
    } catch (e) {
      console.error(e);
    }
    const absoluteOutputFilePath: string = await writeFile(
      outputFile,
      code,
      index,
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
    console.error("Parsing", file, "failed");
    console.error(e);
  }
}

function getFile(
  file: string,
  options: RunnerOptions,
  rawFile: string,
  isInDir: boolean,
  index: number,
  pkg?: {
    [key: string]: any;
  },
): File {
  // Get the module name from the file name
  const moduleName = getModuleNameFromFile(file, pkg);
  const mode = getMode(options, file, isInDir);
  const mainTypes: string = pkg ? pkg.typings || pkg.types || "" : "";
  const isMain = path.join(rawFile, mainTypes) === file;

  // The format of the output argument varies a bit based on which
  // exporting format we're using. For flow-typed, only the module name
  // is required, otherwise we use the cli arg.
  const outputFile = getOutputFile(options, file, rawFile, mode, moduleName);

  // Get the intro text
  let intro = meta(
    moduleName,
    options.version,
    options.addFlowHeader || mode === "directory",
  );

  if (mode === "directory-flow-typed") intro = "";

  return { file, index, isMain, outputFile, moduleName, intro, mode };
}

async function bfs(
  rootDir: string,
  options: RunnerOptions,
): Promise<Array<File>> {
  const queue: Array<string> = [];
  const files: Array<File> = [];
  let pkg;
  try {
    pkg = JSON.parse(
      (await readFile(path.join(rootDir, "package.json"))).toString(),
    );
  } catch (err) {
    // ignored
  }
  queue.push(rootDir);
  let current;
  while (queue.length) {
    current = queue.shift();
    try {
      const dir = await readDir(current, { withFileTypes: true });
      for (const file of dir) {
        if (file.isDirectory()) {
          if (file.name === "node_modules") continue;
          queue.push(path.join(current, file.name));
        } else {
          if (!file.name.endsWith(".d.ts")) continue;
          files.push(
            getFile(
              path.join(current, file.name),
              options,
              rootDir,
              true,
              files.length,
              pkg,
            ),
          );
        }
      }
    } catch {
      files.push(getFile(current, options, rootDir, false, files.length, pkg));
    }
  }
  return files;
}

export default (options: RunnerOptions) => {
  const fileOptions = {
    jsdoc: options.jsdoc,
    quiet: options.quiet,
    interfaceRecords: options.interfaceRecords,
    moduleExports: options.moduleExports,
    inexact: options.inexact,
    asModule: options.asModule,
  };
  // No real reason to return an object here instead of combining
  // the compile function into the wrapper, but I like the API it produces.
  return {
    compile: async (rawFiles: Array<string>): Promise<void> => {
      const files: Array<File> = [];
      // Iterate all the files the user has passed in
      for (const rawFile of rawFiles) {
        files.push(...(await bfs(rawFile, options)));
      }
      const filesByPath = files.reduce((acc, file) => {
        acc.set(file.file, file);
        return acc;
      }, new Map());
      const fileMapper = (sourceCode, fileName) => {
        if (!sourceCode) return;
        const file = filesByPath.get(fileName);
        if (!file) return sourceCode;
        if (file.mode !== "directory-flow-typed") return sourceCode;
        if (file.isMain) {
          return `declare module "${file.outputFile.moduleName}" {${sourceCode}}
          declare module "${file.outputFile.rootModuleName}" {
            declare export * from "${file.outputFile.moduleName}";
          }
          `;
        }
        return `declare module "${file.outputFile.moduleName}" {${sourceCode}}`;
      };
      if (files.length > 1) {
        const sources = compiler.compileDefinitionFiles(
          files.map(v => v.file),
          fileOptions,
          fileMapper,
        );
        for (let index = 0; index < sources.length; index++) {
          const [, flowDefinitions] = sources[index];
          const file = files[index];
          let writeFile: any = defaultExporter;
          if (file.mode === "flow-typed") writeFile = flowTypedExporter;
          if (file.mode === "directory-flow-typed")
            writeFile = flowTypedDirectoryExporter;
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
        const flowDefinitions = compiler.compileDefinitionFile(
          file.file,
          fileOptions,
          fileMapper,
        );

        let writeFile: any = defaultExporter;
        if (file.mode === "flow-typed") writeFile = flowTypedExporter;
        if (file.mode === "directory-flow-typed")
          writeFile = flowTypedDirectoryExporter;
        // Let the user know what's going on
        console.log("Parsing", file.moduleName);
        outputFile(flowDefinitions, file, options, writeFile);
      }
      if (files.length >= 3) process.stdout.write("\n");
    },
  };
};

function getModuleNameFromFile(
  fileName: string,
  pkg?: {
    [key: string]: any;
  },
): string {
  if (pkg) return pkg.name;
  return path.basename(fileName).replace(".d.ts", "");
}

function getMode(options: RunnerOptions, file: string, isDir: boolean): Mode {
  if (isDir && options.flowTypedFormat) return "directory-flow-typed";
  if (isDir) return "directory";
  if (options.flowTypedFormat) return "flow-typed";
  return "file";
}

function getOutputFile(
  options: RunnerOptions,
  file: string,
  prefix: string,
  mode: Mode,
  moduleName: string,
): OutputFile {
  switch (mode) {
    case "directory-flow-typed":
      return {
        rootModuleName: moduleName,
        moduleName: path.join(
          moduleName,
          path.relative(prefix, file).replace(".d.ts", ""),
        ),
        filename: path.normalize(file.replace(prefix, "").replace(".d.ts", "")),
      };
    case "directory": {
      const basedir = options.out ?? "exports";
      return path.normalize(
        file
          .replace(prefix, `${basedir}${path.sep}`)
          .replace(".d.ts", ".js.flow"),
      );
    }
    case "flow-typed":
      return moduleName;
    default:
      return options.out;
  }
}
