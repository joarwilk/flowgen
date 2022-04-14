import * as ts from "typescript";
import { checker } from "../checker";

const setImportedName = (
  name: ts.__String,
  type: any,
  symbol: ts.Symbol,
  decl: ts.Declaration,
): boolean => {
  const specifiers = ["react"];
  const namespaces = ["React"];
  const paths = (name: string) => {
    if (name === "react" || name === "React") {
      return {
        ReactNode: "Node",
        ReactElement: "Element",
      };
    }
    return {};
  };
  // @ts-expect-error todo(flow->ts)
  if (namespaces.includes(symbol.parent?.escapedName)) {
    // @ts-expect-error todo(flow->ts)
    type.escapedText = paths(symbol.parent?.escapedName)[name] || name;
    return true;
  } else if (
    // @ts-expect-error todo(flow->ts)
    specifiers.includes(decl.parent?.parent?.parent?.moduleSpecifier?.text)
  ) {
    type.escapedText =
      // @ts-expect-error todo(flow->ts)
      paths(decl.parent.parent.parent.moduleSpecifier.text)[name] || name;
    return true;
  }
  return false;
};

const setGlobalName = (
  type: ts.TypeReferenceNode,
  _symbol: ts.Symbol,
): boolean => {
  const globals = [
    {
      from: ts.createQualifiedName(ts.createIdentifier("JSX"), "Element"),
      to: ts.createIdentifier("React$Node"),
    },
  ];
  if (checker.current) {
    const bools = [];
    for (const { from, to } of globals) {
      if (
        ts.isQualifiedName(type.typeName) &&
        compareQualifiedName(type.typeName, from)
      ) {
        // @ts-expect-error readonly property, but we write to it
        type.typeName = to;
        bools.push(true);
      }
    }
    return bools.length > 0;
  }
  return false;
};

export function renames(
  symbol: ts.Symbol | void,
  type: ts.TypeReferenceNode | ts.ImportSpecifier,
): boolean {
  if (!symbol) return false;
  if (!symbol.declarations) return false;
  // todo(flow->ts)
  const decl: any = symbol.declarations[0];
  if (ts.isImportSpecifier(type)) {
    setImportedName(decl.name.escapedText, decl.name, symbol, decl);
  } else if (type.kind === ts.SyntaxKind.TypeReference) {
    const leftMost = getLeftMostEntityName(type.typeName);
    if (leftMost && checker.current) {
      const leftMostSymbol = checker.current.getSymbolAtLocation(leftMost);
      const isGlobal = leftMostSymbol?.parent?.escapedName === "__global";
      if (isGlobal) {
        return setGlobalName(type, symbol);
      }
    }
    if (ts.isQualifiedName(type.typeName)) {
      return setImportedName(
        symbol.escapedName,
        type.typeName.right,
        symbol,
        decl,
      );
    } else {
      return setImportedName(symbol.escapedName, type.typeName, symbol, decl);
    }
  }
  return false;
}

export function getLeftMostEntityName(type: ts.EntityName): ts.Identifier {
  if (type.kind === ts.SyntaxKind.QualifiedName) {
    return type.left.kind === ts.SyntaxKind.Identifier
      ? type.left
      : getLeftMostEntityName(type.left);
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return type;
  }
}

function compareIdentifier(a: ts.Identifier, b: ts.Identifier): boolean {
  if (a.kind !== b.kind) return false;
  if (a.escapedText === b.escapedText && a.text === b.text) return true;
  return false;
}

function compareEntityName(a: ts.EntityName, b: ts.EntityName): boolean {
  if (
    a.kind === ts.SyntaxKind.Identifier &&
    b.kind === ts.SyntaxKind.Identifier
  ) {
    return compareIdentifier(a, b);
  }
  if (
    a.kind === ts.SyntaxKind.QualifiedName &&
    b.kind === ts.SyntaxKind.QualifiedName
  ) {
    return compareQualifiedName(a, b);
  }
  return false;
}

function compareQualifiedName(
  a: ts.QualifiedName,
  b: ts.QualifiedName,
): boolean {
  return (
    compareEntityName(a.left, b.left) && compareIdentifier(a.right, b.right)
  );
}
