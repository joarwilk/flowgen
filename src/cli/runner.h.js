// @flow

export type RunnerOptions = {
  jsdoc: boolean,
  quiet: boolean,
  interfaceRecords: boolean,
  moduleExports: boolean,
  inexact: boolean,
  version: string,
  out: string,
  flowTypedFormat: boolean,
  addFlowHeader: boolean,
  compileTests: boolean,
  ...
};

export type Mode = "directory" | "directory-flow-typed" | "flow-typed" | "file";

export type DirectoryFlowTypedFile = {|
  rootModuleName: string,
  moduleName: string,
  filename: string,
|};
export type OutputFile = DirectoryFlowTypedFile | string;

export type File = {|
  index: number,
  mode: Mode,
  moduleName: string,
  isMain: boolean,
  file: string,
  +outputFile: OutputFile,
  intro: string,
|};
