/* @flow */
import {
  createProgram,
  createCompilerHost,
  createSourceFile,
  ScriptTarget,
  type SourceFile,
} from "typescript";
import fs from "fs";
import tsc from "typescript-compiler";

import namespaceManager from "../namespaceManager";
import { type Options, assignOptions, resetOptions } from "../options";
import { checker } from "../checker";
import { recursiveWalkTree } from "../parse";

const compile = (sourceFile: SourceFile): string => {
  const rootNode = recursiveWalkTree(sourceFile);

  const output = rootNode
    .getChildren()
    .map(child => {
      return child.print();
    })
    .join("");

  return output;
};

const reset = (options?: Options) => {
  resetOptions();
  if (options) {
    assignOptions(options);
  }
  namespaceManager.reset();
};

/**
 * Compiles typescript files
 */
export default {
  reset,

  compile,

  setChecker(typeChecker: any) {
    checker.current = typeChecker;
  },

  compileTest: (path: string, target: string): void => {
    tsc.compile(path, "--module commonjs -t ES6 --out " + target);
  },

  compileDefinitionString: (string: string, options?: Options): string => {
    reset(options);

    // const compilerHost = {
    //   fileExists: () => true,
    //   getCanonicalFileName: filename => filename,
    //   getCurrentDirectory: () => "",
    //   getDefaultLibFileName: () => require.resolve("typescript/lib/lib.d.ts"),
    //   getNewLine: () => "\n",
    //   getSourceFile: () => {
    //     return createSourceFile(
    //       "/dev/null",
    //       string,
    //       ScriptTarget.Latest,
    //       false,
    //     );
    //   },
    //   readFile: () => {},
    //   useCaseSensitiveFileNames: () => true,
    //   writeFile: () => {},
    // };

    const program = createProgram(
      ["file.ts"],
      {
        noLib: true,
        target: ScriptTarget.Latest,
      },
      createCompilerHost({}, true),
    );

    checker.current = program.getTypeChecker();
    const sourceFile = program.getSourceFile("file.ts");

    if (!sourceFile) return "";

    return compile(sourceFile);
  },

  compileDefinitionFile: (path: string, options?: Options): string => {
    reset(options);

    // const compilerHost = {
    //   fileExists: () => true,
    //   getCanonicalFileName: filename => filename,
    //   getCurrentDirectory: () => "",
    //   getDefaultLibFileName: () => require.resolve("typescript/lib/lib.d.ts"),
    //   getNewLine: () => "\n",
    //   getSourceFile: path => {
    //     return createSourceFile(
    //       path,
    //       fs.readFileSync(path).toString(),
    //       ScriptTarget.Latest,
    //       false,
    //     );
    //   },
    //   readFile: () => {},
    //   useCaseSensitiveFileNames: () => true,
    //   writeFile: () => {},
    // };

    const program = createProgram(
      [path],
      {
        noLib: true,
        target: ScriptTarget.Latest,
      },
      createCompilerHost({}, true),
      //compilerHost,
    );

    checker.current = program.getTypeChecker();
    const sourceFile = program.getSourceFile(path);

    if (!sourceFile) return "";

    return compile(sourceFile);
  },
};
