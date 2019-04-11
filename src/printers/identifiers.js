/* @flow */

// Please add only built-in type references

import printers from "./index";

const identifiers = Object.create(null);
Object.assign(identifiers, {
  ReadonlyArray: "$ReadOnlyArray",
  Partial: "$Shape",
  Readonly: "$ReadOnly",
  NonNullable: "$NonMaybeType",
  ReturnType: (typeArguments: any[]) => {
    return `$Call<<R>((...args: any[]) => R) => R, ${printers.node.printType(
      typeArguments[0],
    )}>`;
  },
  Record: ([key, value]: [any, any]) =>
    `{[key: ${printers.node.printType(key)}]: ${printers.node.printType(
      value,
    )}}`,
});

export const print = (kind: string): string => {
  return identifiers[kind] || kind;
};
