export type Options = {
  jsdoc?: boolean;
  interfaceRecords?: boolean;
  stringEnums?: boolean;
};

export type Compiler = {
  compileTest(path: string, target: string): void;
  compileDefinitionString(string: string, options?: Options): string;
  compileDefinitionFile(path: string, options?: Options): string;
};

type Flowgen = {
  beautify(str: string): string;
  compiler: Compiler;
};

export default Flowgen;
