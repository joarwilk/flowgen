#!/usr/bin/env node
/* @flow */
import runner from "./runner";
import { version } from "../../package.json";

import program from "commander";

program
  .version(version)
  .option(
    "-o --output-file [outputFile]",
    "name for output file, defaults to export.flow.js",
    "export.flow.js",
  )
  .option(
    "--string-enums",
    "string enums instead of classes in output(doesn't represent runtime behaviour)",
  )
  .option("--interface-records", "exact records instead of interfaces in output")
  .option("--no-jsdoc", "output without jsdoc")
  .option("--flow-typed-format", "format output for flow-typed")
  .option("--compile-tests", "compile any <filename>-tests.ts files found")
  .arguments("[files...]")
  .action((files, options) => {
    runner({
      stringEnums: options.stringEnums,
      interfaceRecords: options.interfaceRecords,
      jsdoc: options.jsdoc,
      flowTypedFormat: options.flowTypedFormat,
      compileTests: options.compileTests,
      out: options.outputFile,
      version,
    }).compile(files);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
