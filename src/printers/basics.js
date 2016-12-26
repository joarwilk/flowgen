/* @flow */
const types = {
  VoidKeyword: 'void',
  StringKeyword: 'string',
  AnyKeyword: 'any',
  NumberKeyword: 'number',
  BooleanKeyword: 'boolean'
}

export const print = (kind: string): string => {
  return types[kind];
}
