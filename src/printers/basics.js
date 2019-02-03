/* @flow */

const types: { [key: string]: string } = {
  VoidKeyword: "void",
  StringKeyword: "string",
  AnyKeyword: "any",
  NumberKeyword: "number",
  BooleanKeyword: "boolean",
  NullKeyword: "null",
  UndefinedKeyword: "void",
  ObjectKeyword: "{[key: string]: any}",
  FalseKeyword: "false",
  TrueKeyword: "true",
  NeverKeyword: "empty",
  UnknownKeyword: "mixed",
};

export const print = (kind: string): string => {
  return types[kind];
};
