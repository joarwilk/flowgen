import { SourceFile, TypeChecker } from "typescript";

export type Options = {
  jsdoc?: boolean;
  interfaceRecords?: boolean;
  moduleExports?: boolean;
};

export type Compiler = {
  compileTest(path: string, target: string): void;
  compileDefinitionString(
    string: string,
    options?: Options,
    mapSourceCode?: (source: string | void, fileName: string) => string | void,
  ): string;
  compileDefinitionFile(
    path: string,
    options?: Options,
    mapSourceCode?: (source: string | void, fileName: string) => string | void,
  ): string;

  // Low-level exports
  reset(options?: Options): void;
  setChecker(checker: TypeChecker): void;
  compile(sourceFile: SourceFile): string;
};

type Flowgen = {
  beautify(str: string): string;
  compiler: Compiler;
};

export default Flowgen;
