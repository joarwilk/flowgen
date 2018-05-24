// @flow
import fs from "fs";
import path from "path";
import ts from "typescript";

import meta from "./meta";
import beautify from "./beautifier";

import compiler from "./compiler";

import defaultExporter from "./default-exporter";
import flowTypedExporter from "./flow-typed-exporter";

import { readFileSync } from "fs";

type RunnerOptions = {
  version: string,
  out: string,
  flowTypedFormat: boolean,
  compileTests: boolean,
};

export default (options: RunnerOptions) => {
  const writeFile = options.flowTypedFormat
    ? flowTypedExporter
    : defaultExporter;

  // No real reason to return an object here instead of combining
  // the compile function into the wrapper, but I like the API it produces.
  return {
    compile: (files: Array<string>) => {
      // Iterate all the files the user has passed in
      files.forEach((file, index) => {
        // Get the module name from the file name
        const moduleName = getModuleNameFromFile(file);

        // The format of the output argument varies a bit based on which
        // exporting format we're using. For flow-typed, only the module name
        // is required, otherwise we use the cli arg.
        const outputFile = options.flowTypedFormat ? moduleName : options.out;

        // Get the intro text
        const intro = meta(moduleName, options.version);

        // Let the user know what's going on
        if (files.length > 3) {
          // If we're compiling a lot of files, show more stats
          const progress = Math.round(index / files.length * 100);
          process.stdout.write("\r\x1b[K");
          process.stdout.write(progress + "% | " + moduleName);
        } else {
          console.log("Parsing", moduleName);
        }

        // Produce the flow library content
        try {
          const flowDefinitions = compiler.compileDefinitionFile(file);

          // Write the output to disk
          const absoluteOutputFilePath: string = writeFile(
            outputFile,
            beautify(intro + flowDefinitions),
          );

          // Check if we should compile tests as well
          if (options.compileTests) {
            // Assume tests file is in same dir, named <filename>-tests.ts
            // Based on DD conventions
            const testFileName =
              path.dirname(file) + "/" + moduleName + "-tests.ts";
            const testFileOutput =
              path.dirname(absoluteOutputFilePath) +
              "/test_" +
              moduleName +
              ".js";

            // Try to compile the test file. Will fail silently if not present.
            compiler.compileTest(testFileName, testFileOutput);
          }
        } catch (e) {
          console.error("Parsing", moduleName, "failed");
          console.error(e);
        }
      });
    },
  };
};

function getModuleNameFromFile(fileName: string): string {
  return path.basename(fileName).slice(0, -5);
}
