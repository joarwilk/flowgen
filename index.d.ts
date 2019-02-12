import { SourceFile } from "typescript";

export type Options = {
  jsdoc?: boolean;
  interfaceRecords?: boolean;
  moduleExports?: boolean;
};

export type Compiler = {
  compileTest(path: string, target: string): void;
  compileDefinitionString(string: string, options?: Options): string;
  compileDefinitionFile(path: string, options?: Options): string;

  // Low-level exports
  reset(options?: Options): void;
  compile(sourceFile: SourceFile): string;
};

type Flowgen = {
  beautify(str: string): string;
  compiler: Compiler;
};

export default Flowgen;
