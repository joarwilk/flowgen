// Please add only built-in type references

import * as printers from "./index";
import { withEnv } from "../env";
import ts from "typescript";

const recordMembers = (key, value) => {
  const valueType = printers.node.printType(value);

  switch (key.kind) {
    case ts.SyntaxKind.LiteralType:
      return [`${printers.node.printType(key)}: ${valueType}`];
    case ts.SyntaxKind.UnionType:
      if (key.types.every(t => t.kind === ts.SyntaxKind.LiteralType)) {
        return key.types.map(
          t => `${printers.node.printType(t)}: ${valueType}`,
        );
      }
    // Fallthrough
    default:
      return [`[key: ${printers.node.printType(key)}]: ${valueType}`];
  }
};

type IdentifierResult = string | ((...args: any[]) => any);

const identifiers: { [name: string]: IdentifierResult } = {
  ReadonlyArray: "$ReadOnlyArray",
  ReadonlySet: "$ReadOnlySet",
  ReadonlyMap: "$ReadOnlyMap",
  Readonly: "$ReadOnly",
  RegExpMatchArray: "RegExp$matchResult",
  NonNullable: "$NonMaybeType",
  Partial: ([type]: any[]) => {
    return `$Rest<${printers.node.printType(
      type,
    )}, ${printers.common.printInexactObjectType([])}>`;
  },
  ReturnType: (typeArguments: any[]) => {
    return `$Call<<R>((...args: any[]) => R) => R, ${printers.node.printType(
      typeArguments[0],
    )}>`;
  },
  Record: ([keys, value]: [any, any]) => {
    const members = recordMembers(keys, value);
    return printers.common.printDefaultObjectType(members);
  },
  Omit: ([obj, keys]: [any, any]) => {
    const members = recordMembers(keys, { kind: ts.SyntaxKind.AnyKeyword });
    return `$Diff<${printers.node.printType(
      obj,
    )},${printers.common.printExactObjectType(members)}>`;
  },
};

export const print = withEnv<any, [string], IdentifierResult>((env, kind) => {
  if (env.classHeritage) return kind;
  return Object.prototype.hasOwnProperty.call(identifiers, kind)
    ? identifiers[kind]
    : kind;
});
