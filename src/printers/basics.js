/* @flow */
const types = {
  VoidKeyword: "void",
  StringKeyword: "string",
  AnyKeyword: "any",
  NumberKeyword: "number",
  BooleanKeyword: "boolean",
  NullKeyword: "null",
  UndefinedKeyword: "void",
  ObjectKeyword: "{[key: string]: any}",
  FalseKeyword: "false",
  TrueKeyword: "true"
};

export const print = (kind: string): string => {
  return types[kind];
};
