/* @flow */

// Please add only built-in type references

import printers from "./index";

const identifiers = Object.create(null);
Object.assign(identifiers, {
  ReadonlyArray: "$ReadOnlyArray",
  ReadonlySet: "$ReadOnlySet",
  ReadonlyMap: "$ReadOnlyMap",
  Readonly: "$ReadOnly",
  NonNullable: "$NonMaybeType",
  Partial: ([type]: any[]) => {
    return `$Rest<${printers.node.printType(type)}, {}>`;
  },
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
