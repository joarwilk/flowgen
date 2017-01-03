/* @flow */
import ts from 'typescript';
import fs from 'fs';
import tsc from 'typescript-compiler';

import namespaceManager from '../namespaceManager';
import { recursiveWalkTree } from '../parse';

/**
 * Compiles typescript files
 */
export default {
  compileTest: (path: string, target: string) => {
    tsc.compile(path, '--module commonjs -t ES5 --out ' + target);
  },

  compileDefinitionFile: (path: string) => {
    namespaceManager.reset();

    const sourceFile = ts.createSourceFile(path,
      fs.readFileSync(path).toString(),
      ts.ScriptTarget.ES6,
      false
    );

    const rootNode = recursiveWalkTree(sourceFile);

    const output = rootNode.getChildren().map(child => {
      return child.print();
    }).join('');

    return output;
  }
}
