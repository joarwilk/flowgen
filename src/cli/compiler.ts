import ts, {
  createProgram,
  createCompilerHost,
  createSourceFile,
  ScriptTarget,
  transform,
} from "typescript";
import type { SourceFile } from "typescript";
import tsc from "typescript-compiler";

import namespaceManager from "../namespace-manager";
import { assignOptions, resetOptions } from "../options";
import type { Options } from "../options";
import { checker } from "../checker";
import * as logger from "../logger";
import { withEnv } from "../env";
import {
  importEqualsTransformer,
  legacyModules,
  declarationFileTransform,
  importTypeToImportDeclaration,
} from "../parse/transformers";
import { recursiveWalkTree } from "../parse";
import { printFlowGenHelper } from "../printers/node";

const compile = withEnv<any, [SourceFile], string>(
  (env: any, sourceFile: SourceFile): string => {
    const rootNode = recursiveWalkTree(sourceFile);

    const output = rootNode
      .getChildren()
      .map(child => {
        return child.print();
      })
      .join("");

    const helpersOutputs = printFlowGenHelper(env);

    return `${helpersOutputs}\n\n${output}`;
  },
);

const reset = (options?: Options): void => {
  resetOptions();
  if (options) {
    assignOptions(options);
  }
  namespaceManager.reset();
};

const compilerOptions = {
  noLib: true,
  target: ScriptTarget.Latest,
};

const getTransformers = (options?: Options) => [
  legacyModules(),
  importEqualsTransformer(),
  declarationFileTransform(options),
  importTypeToImportDeclaration(),
];

const transformFile = (
  fileName: string,
  sourceText: string,
  languageVersion: ScriptTarget,
  options?: Options,
) => {
  const transformedAst = transform(
    //$todo Flow has problems when switching variables instead of literals
    createSourceFile(fileName, sourceText, languageVersion, true),
    getTransformers(options),
    compilerOptions,
  ).transformed[0];
  const transformedText = ts.createPrinter().printFile(transformedAst);
  return createSourceFile(fileName, transformedText, languageVersion, true);
};

/**
 * Compiles typescript files
 */
export default {
  reset,

  compile: compile.withEnv({}),

  setChecker(typeChecker: any) {
    checker.current = typeChecker;
  },

  getTransformers(options?: Options) {
    return getTransformers(options);
  },

  compileTest: (path: string, target: string): void => {
    tsc.compile(path, "--module commonjs -t ES6 --out " + target);
  },

  compileDefinitionString: (string: string, options?: Options): string => {
    reset(options);

    const compilerHost = createCompilerHost({}, true);
    const oldSourceFile = compilerHost.getSourceFile;
    compilerHost.getSourceFile = (file, languageVersion) => {
      if (file === "file.ts") {
        return transformFile("/dev/null", string, languageVersion, options);
      }
      return oldSourceFile(file, languageVersion);
    };

    const program = createProgram(["file.ts"], compilerOptions, compilerHost);

    checker.current = program.getTypeChecker();
    const sourceFile = program.getSourceFile("file.ts");

    if (!sourceFile) return "";

    logger.setSourceFile(sourceFile);

    return compile.withEnv({})(sourceFile);
  },

  compileDefinitionFile: (
    path: string,
    options?: Options,
    mapSourceCode: (
      source: string | undefined,
      fileName: string,
    ) => string | undefined = a => a,
  ): string => {
    reset(options);

    const compilerHost = createCompilerHost({}, true);
    const oldSourceFile = compilerHost.getSourceFile;
    const oldReadFile = compilerHost.readFile;
    compilerHost.readFile = fileName =>
      mapSourceCode(oldReadFile(fileName), fileName);
    compilerHost.getSourceFile = (file, languageVersion) => {
      if (file === path) {
        const sourceText = compilerHost.readFile(file);
        return transformFile(file, sourceText, languageVersion, options);
      }
      return oldSourceFile(file, languageVersion);
    };

    const program = createProgram([path], compilerOptions, compilerHost);

    checker.current = program.getTypeChecker();
    const sourceFile = program.getSourceFile(path);

    if (!sourceFile) return "";

    logger.setSourceFile(sourceFile);

    return compile.withEnv({})(sourceFile);
  },

  compileDefinitionFiles: (
    paths: string[],
    options?: Options,
    mapSourceCode: (
      source: string | undefined,
      fileName: string,
    ) => string | undefined = a => a,
  ): Array<[string, string]> => {
    const compilerHost = createCompilerHost({}, true);
    const oldSourceFile = compilerHost.getSourceFile;
    const oldReadFile = compilerHost.readFile;
    compilerHost.readFile = fileName =>
      mapSourceCode(oldReadFile(fileName), fileName);
    compilerHost.getSourceFile = (file, languageVersion) => {
      if (paths.includes(file)) {
        const sourceText = compilerHost.readFile(file);
        return transformFile(file, sourceText, languageVersion, options);
      }
      return oldSourceFile(file, languageVersion);
    };

    const program = createProgram(paths, compilerOptions, compilerHost);

    checker.current = program.getTypeChecker();

    return paths.map(path => {
      const sourceFile = program.getSourceFile(path);
      if (!sourceFile) return [path, ""];
      logger.setSourceFile(sourceFile);
      reset(options);
      return [path, compile.withEnv({})(sourceFile)];
    });
  },
};
