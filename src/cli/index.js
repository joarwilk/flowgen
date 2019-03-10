#!/usr/bin/env node
/* @flow */
import runner from "./runner";
import pkg from "../../package.json";

import program from "commander";

program
  .version(pkg.version)
  .option(
    "-o --output-file [outputFile]",
    "name for output file, defaults to export.flow.js",
    "export.flow.js",
  )
  .option("--no-module-exports", "use only default exports")
  .option(
    "--interface-records",
    "exact records instead of interfaces in output",
  )
  .option("--no-jsdoc", "output without jsdoc")
  .option("--flow-typed-format [dirname]", "format output for flow-typed")
  .option(
    "--add-flow-header",
    "adds '// @flow' to the generated files (for libs)",
  )
  .option("--compile-tests", "compile any <filename>-tests.ts files found")
  .arguments("[files...]")
  .action((files, options) => {
    runner({
      interfaceRecords: options.interfaceRecords,
      moduleExports: options.moduleExports,
      jsdoc: options.jsdoc,
      flowTypedFormat: options.flowTypedFormat,
      addFlowHeader: options.addFlowHeader,
      compileTests: options.compileTests,
      out: options.outputFile,
      version: pkg.version,
    }).compile(files);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
