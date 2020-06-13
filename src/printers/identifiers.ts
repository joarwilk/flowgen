/* @flow */

// Please add only built-in type references

import printers from "./index";
import { opts } from "../options";
import { withEnv } from "../env";

const identifiers = Object.create(null);
Object.assign(identifiers, {
  ReadonlyArray: "$ReadOnlyArray",
  ReadonlySet: "$ReadOnlySet",
  ReadonlyMap: "$ReadOnlyMap",
  Readonly: "$ReadOnly",
  NonNullable: "$NonMaybeType",
  Partial: ([type]: any[]) => {
    const isInexact = opts().inexact;
    return `$Rest<${printers.node.printType(type)}, {${
      isInexact ? "..." : ""
    }}>`;
  },
  ReturnType: (typeArguments: any[]) => {
    return `$Call<<R>((...args: any[]) => R) => R, ${printers.node.printType(
      typeArguments[0],
    )}>`;
  },
  Record: ([key, value]: [any, any]) => {
    const isInexact = opts().inexact;
    return `{[key: ${printers.node.printType(key)}]: ${printers.node.printType(
      value,
    )}${isInexact ? ", ..." : ""}}`;
  },
});

export const print = withEnv<any, [string], string>(
  (env, kind: string): string => {
    if (env.classHeritage) return kind;
    return identifiers[kind] || kind;
  },
);
