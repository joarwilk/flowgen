// @flow

import * as ts from "typescript";
import {checker} from '../checker'

const setImportedName = (name: string, type, symbol, decl) => {
  const specifiers = ["react"];
  const namespaces = ["React"];
  const paths = (name: string) => {
    if (name === "react" || name === "React") {
      return {
        ReactNode: "Node",
      };
    }
    return {};
  };
  if (namespaces.includes(symbol.parent?.escapedName)) {
    type.escapedText = paths(symbol.parent?.escapedName)[name] || name;
  } else if (
    specifiers.includes(decl.parent?.parent?.parent?.moduleSpecifier?.text)
  ) {
    type.escapedText =
      paths(decl.parent.parent.parent.moduleSpecifier.text)[name] || name;
  }
};
const setGlobalName = (type, symbol) => {
  const globals = [
    {
      from: ts.createQualifiedName(ts.createIdentifier("JSX"), "Element"),
      to: ts.createIdentifier("React$Node"),
    },
  ];
  if (checker.current) {
    for (const { from, to } of globals) {
      if (compareQualifiedName(type.typeName, from)) {
        type.typeName = to;
      }
    }
  }
};

export function renames(symbol: ts.Symbol | void, type) {
  if (!symbol) return;
  if (!symbol.declarations) return;
  let decl = symbol.declarations[0];
  if (type.parent.kind === ts.SyntaxKind.NamedImports) {
    setImportedName(decl.name.escapedText, decl.name, symbol, decl);
  } else if (type.kind === ts.SyntaxKind.TypeReference) {
    const leftMost = getLeftMostEntityName(type.typeName);
    if (leftMost && checker.current) {
      const leftMostSymbol = checker.current.getSymbolAtLocation(leftMost);
      const isGlobal = leftMostSymbol?.parent?.escapedName === "__global";
      if (isGlobal) {
        setGlobalName(type, symbol);
        return;
      }
    }
    if (type.typeName.right) {
      setImportedName(symbol.escapedName, type.typeName.right, symbol, decl);
    } else {
      setImportedName(symbol.escapedName, type.typeName, symbol, decl);
    }
  }
}

export function getLeftMostEntityName(type: ts.EntityName) {
  if (type.kind === ts.SyntaxKind.QualifiedName) {
    return type.left.kind === ts.SyntaxKind.Identifier
      ? type.left
      : getLeftMostEntityName(type.left);
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return type;
  }
}

function compareIdentifier(a: ts.Identifier, b: ts.Identifier) {
  if (a.kind !== b.kind) return false;
  if (a.escapedText === b.escapedText && a.text === b.text) return true;
  return false;
}

function compareEntityName(a: ts.EntityName, b: ts.EntityName) {
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

function compareQualifiedName(a: ts.QualifiedName, b: ts.QualifiedName) {
  if (a.kind !== b.kind) return false;
  return (
    compareEntityName(a.left, b.left) && compareIdentifier(a.right, b.right)
  );
}
