/* @flow */
"use strict";

import { recursiveWalkTree } from './parse';

import fs from 'fs';

import ts from 'typescript';

import { readFileSync } from "fs";

import program from 'commander';


program
  .version('0.1.3')
  .arguments('[files...]')
  .option('-o --output-file [outputFile]', 'name for ouput file, defaults to export.flow.js', 'export.flow.js')
  .action((files, options) => {
    files.forEach(fileName => {
      const sourceFile = ts.createSourceFile(fileName,
        readFileSync(fileName).toString(),
        ts.ScriptTarget.ES6,
        /*setParentNodes */ false
      );

      const tree = recursiveWalkTree(sourceFile);

      const output = tree.children.map(child => {
        return child.print();
      }).join(' ');

      fs.writeFile('./' + options.outputFile, output, function(err) {
          if (err) {
              return console.log(err);
          }

          console.log('Completed! Nodes exported');
      });
    });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
