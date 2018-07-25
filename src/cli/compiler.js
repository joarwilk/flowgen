/* @flow */
import ts from "typescript";
import fs from "fs";
import tsc from "typescript-compiler";

import namespaceManager from "../namespaceManager";
import { recursiveWalkTree } from "../parse";

const compile = sourceFile => {
  const rootNode = recursiveWalkTree(sourceFile);

  const output = rootNode
    .getChildren()
    .map(child => {
      return child.print();
    })
    .join("");

  return output;
};

/**
 * Compiles typescript files
 */
export default {
  compileTest: (path: string, target: string) => {
    tsc.compile(path, "--module commonjs -t ES6 --out " + target);
  },

  compileDefinitionString: (string: string) => {
    namespaceManager.reset();

    return compile(
      ts.createSourceFile("/dev/null", string, ts.ScriptTarget.ES6, false),
    );
  },

  compileDefinitionFile: (path: string) => {
    namespaceManager.reset();

    return compile(
      ts.createSourceFile(
        path,
        fs.readFileSync(path).toString(),
        ts.ScriptTarget.ES6,
        false,
      ),
    );
  },
};
