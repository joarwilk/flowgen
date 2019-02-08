/* @flow */
import { createSourceFile, ScriptTarget } from "typescript";
import fs from "fs";
import tsc from "typescript-compiler";

import namespaceManager from "../namespaceManager";
import { type Options, assignOptions, resetOptions } from "../options";
import { recursiveWalkTree } from "../parse";

const compile = (sourceFile): string => {
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
  reset(options?: Options) {
    resetOptions();
    if (options) {
      assignOptions(options);
    }
    namespaceManager.reset();
  },

  compile,

  compileTest: (path: string, target: string): void => {
    tsc.compile(path, "--module commonjs -t ES6 --out " + target);
  },

  compileDefinitionString: (string: string, options?: Options): string => {
    resetOptions();
    if (options) {
      assignOptions(options);
    }
    namespaceManager.reset();

    return compile(
      createSourceFile("/dev/null", string, ScriptTarget.Latest, false),
    );
  },

  compileDefinitionFile: (path: string, options?: Options): string => {
    resetOptions();
    if (options) {
      assignOptions(options);
    }
    namespaceManager.reset();

    return compile(
      createSourceFile(
        path,
        fs.readFileSync(path).toString(),
        ScriptTarget.Latest,
        false,
      ),
    );
  },
};
