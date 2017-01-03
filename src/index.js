/* @flow */
import { recursiveWalkTree } from './parse';
import runner from './cli/runner';

import program from 'commander';

const version = '1.0.0';

program
  .version(version)
  .option('-o --output-file [outputFile]', 'name for ouput file, defaults to export.flow.js', 'export.flow.js')
  .option('--flow-typed-format', 'format outut for flow-typed')
  .option('--compile-tests', 'compile any <filename>-tests.ts files found')
  .arguments('[files...]')
  .action((files, options) => {
    runner({
      flowTypedFormat: options.flowTypedFormat,
      compileTests: options.compileTests,
      out: options.outputFile,
      version
    }).compile(files);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
