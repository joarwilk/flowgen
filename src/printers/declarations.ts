import * as ts from "typescript";
import { opts } from "../options";
import { checker } from "../checker";
import type Node from "../nodes/node";
import Namespace from "../nodes/namespace";
import * as printers from "./index";
import { withEnv } from "../env";

export const propertyDeclaration = (
  node: ts.VariableDeclaration | ts.PropertyDeclaration,
  keywordPrefix: string,
): string => {
  let left = keywordPrefix;
  const symbol = checker.current.getSymbolAtLocation(node.name);
  const name = ts.isVariableDeclaration(node)
    ? printers.node.getFullyQualifiedName(symbol, node.name)
    : printers.node.printType(node.name);
  if (
    node.modifiers &&
    node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword,
    )
  ) {
    return "";
  }
  if (
    node.modifiers &&
    node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.ReadonlyKeyword,
    )
  ) {
    left += "+";
  }

  left += name;

  if (node.type) {
    let right = printers.node.printType(node.type);
    if (ts.isPropertyDeclaration(node) && node.questionToken) {
      if (node.name.kind !== ts.SyntaxKind.ComputedPropertyName) {
        left += "?";
      } else {
        right = `(${right}) | void`;
      }
    }
    return left + ": " + right;
  }

  return left + `: ${printers.node.printType(node.initializer)}\n`;
};

export const variableDeclaration = (node: ts.VariableStatement): string => {
  const declarations = node.declarationList.declarations.map(
    printers.node.printType,
  );

  return declarations
    .map(name => `declare ${printers.relationships.exporter(node)}var ${name};`)
    .join("\n");
};

export const interfaceType = <T>(
  node: ts.InterfaceDeclaration | ts.ClassDeclaration | ts.TypeLiteralNode,
  nodeName: string,
  mergedNamespaceChildren: ReadonlyArray<Node<T>>,
  withSemicolons = false,
  isType = false,
): string => {
  const isInexact = opts().inexact;
  const members = node.members.map(member => {
    const printed = printers.node.printType(member);
    if (!printed) {
      return null;
    }
    return "\n" + printers.common.jsdoc(member) + printed;
  });

  if (mergedNamespaceChildren.length > 0) {
    for (const child of Namespace.formatChildren(
      mergedNamespaceChildren,
      nodeName,
    )) {
      members.push(`static ${child}\n`);
    }
  }

  const hasIndexSignature = node.members.some(member =>
    ts.isIndexSignatureDeclaration(member),
  );

  // If an index signature is present in our type, we probably don't want to
  // provide the trailing "...", since it will be ignored by Flow anyway.
  if (isType && isInexact && !hasIndexSignature) {
    members.push("...\n");
  } else if (members.length > 0) {
    members.push("\n");
  }

  const inner = members
    .filter(Boolean) // Filter rows which didn't print properly (private fields et al)
    .join(withSemicolons ? ";" : ",");

  // we only want type literals to be exact. i.e. class Foo {} should not be class Foo {||}
  if (!ts.isTypeLiteralNode(node)) {
    return `{${inner}}`;
  }

  // If a type contains an index signature (e.g. `[key: string]: number`), then
  // we want to treat it as inexact no matter what, otherwise we may generate a
  // Flow type like `{|[k: string]: any|}` which is invalid in Flow prior to
  // v0.126.0 (source: https://github.com/facebook/flow/blob/main/Changelog.md#01260)
  //
  // It should also be safe to assume that if an index signature is present, the
  // equivalent human-authored Flow type would be inexact.
  if (hasIndexSignature) {
    return `{${inner}}`;
  }

  return isInexact ? `{${inner}}` : `{|${inner}|}`;
};

const interfaceRecordType = (
  node: ts.InterfaceDeclaration,
  heritage: string,
  withSemicolons = false,
): string => {
  const isInexact = opts().inexact;
  let members = node.members
    .map(member => {
      const printed = printers.node.printType(member);
      if (!printed) {
        return null;
      }
      return "\n" + printers.common.jsdoc(member) + printed;
    })
    .filter(Boolean) // Filter rows which didnt print propely (private fields et al)
    .join(withSemicolons ? ";" : ",");

  if (members.length > 0) {
    members += "\n";
  }

  if (isInexact) {
    return `{${heritage}${members}}`;
  } else {
    return `{|${heritage}${members}|}`;
  }
};

const classHeritageClause = (
  classMixins: string[],
  classImplements: string[],
) =>
  withEnv<{ classHeritage?: boolean }, [ts.ExpressionWithTypeArguments], void>(
    (env, type) => {
      env.classHeritage = true;
      // TODO: refactor this
      const symbol = checker.current.getSymbolAtLocation(type.expression);
      printers.node.fixDefaultTypeArguments(symbol, type);
      if (ts.isIdentifier(type.expression) && symbol) {
        const value =
          printers.node.getFullyQualifiedPropertyAccessExpression(
            symbol,
            type.expression,
          ) + printers.common.generics(type.typeArguments);
        if (
          symbol.declarations.some(
            declaration =>
              declaration.kind === ts.SyntaxKind.InterfaceDeclaration,
          )
        ) {
          classImplements.push(value);
        } else {
          classMixins.push(value);
        }
      } else {
        classMixins.push(printers.node.printType(type));
      }
      env.classHeritage = false;
    },
  );

const interfaceHeritageClause = (type: ts.ExpressionWithTypeArguments) => {
  // TODO: refactor this
  const symbol = checker.current.getSymbolAtLocation(type.expression);
  printers.node.fixDefaultTypeArguments(symbol, type);
  if (ts.isIdentifier(type.expression) && symbol) {
    const name = printers.node.getFullyQualifiedPropertyAccessExpression(
      symbol,
      type.expression,
    );
    return name + printers.common.generics(type.typeArguments);
  } else if (ts.isIdentifier(type.expression)) {
    const name = printers.identifiers.print(type.expression.text);
    if (typeof name === "function") {
      return name(type.typeArguments);
    } else {
      return name;
    }
  } else {
    return printers.node.printType(type);
  }
};

const interfaceRecordDeclaration = (
  nodeName: string,
  node: ts.InterfaceDeclaration,
  modifier: string,
): string => {
  let heritage = "";

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses
      .map(clause => {
        return clause.types
          .map(interfaceHeritageClause)
          .map(type => `...$Exact<${type}>`)
          .join(",\n");
      })
      .join("");
    heritage = heritage.length > 0 ? `${heritage},\n` : "";
  }

  const str = `${modifier}type ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} = ${interfaceRecordType(node, heritage)}\n`;

  return str;
};

export const interfaceDeclaration = (
  nodeName: string,
  node: ts.InterfaceDeclaration,
  modifier: string,
): string => {
  const isRecord = opts().interfaceRecords;
  if (isRecord) {
    return interfaceRecordDeclaration(nodeName, node, modifier);
  }
  let heritage = "";

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses
      .map(clause => {
        return clause.types.map(interfaceHeritageClause).join(" & ");
      })
      .join("");
    heritage = heritage.length > 0 ? `& ${heritage}\n` : "";
  }

  const type = node.heritageClauses ? "type" : "interface";

  const str = `${modifier}${type} ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} ${type === "type" ? "= " : ""}${interfaceType(
    node,
    nodeName,
    [],
    false,
    type === "type",
  )} ${heritage}`;

  return str;
};

export const typeDeclaration = (
  nodeName: string,
  node: ts.TypeAliasDeclaration,
  modifier: string,
): string => {
  const str = `${modifier}type ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} = ${printers.node.printType(node.type)};`;

  return str;
};

export const enumDeclaration = (
  nodeName: string,
  node: ts.EnumDeclaration,
): string => {
  const exporter = printers.relationships.exporter(node);
  let members = "";
  // @ts-expect-error iterating over an iterator
  for (const [index, member] of node.members.entries()) {
    let value;
    if (typeof member.initializer !== "undefined") {
      value = printers.node.printType(member.initializer);
    } else {
      value = index;
    }
    members += `+${member.name.text}: ${value},`;
    members += `// ${value}\n`;
  }
  return `
declare ${exporter} var ${nodeName}: {|
  ${members}
|};\n`;
};

export const typeReference = (
  node: ts.TypeReferenceNode,
  identifier: boolean,
): string => {
  if (ts.isQualifiedName(node.typeName)) {
    return (
      printers.node.printType(node.typeName) +
      printers.common.generics(node.typeArguments)
    );
  }
  let name = node.typeName.text;
  if (identifier) {
    const replaced = printers.identifiers.print(node.typeName.text);
    if (typeof replaced === "function") {
      return replaced(node.typeArguments);
    }
    name = replaced;
  }
  // If the type reference name is broken in the format of `"string"$Name`,
  // strip the prefixed quoted string from "Name":
  name = name.replace(/^['"]@?[-\w/]+['"]\$(\w+)$/, "$1");
  return (
    printers.relationships.namespaceProp(name) +
    printers.common.generics(node.typeArguments)
  );
};

export const classDeclaration = <T>(
  nodeName: string,
  node: ts.ClassDeclaration,
  mergedNamespaceChildren: ReadonlyArray<Node<T>>,
): string => {
  let heritage = "";

  // If the class is extending something
  if (node.heritageClauses) {
    const classMixins = [];
    const classImplements = [];
    node.heritageClauses.forEach(clause => {
      clause.types.forEach(classHeritageClause(classMixins, classImplements));
    });
    const mixinsMessage =
      classMixins.length > 0 ? `mixins ${classMixins.join(",")}` : "";
    const classImplementsMessage =
      classImplements.length > 0
        ? ` implements ${classImplements.join(",")}`
        : "";
    heritage += mixinsMessage;
    heritage += classImplementsMessage;
  }

  const str = `declare ${printers.relationships.exporter(
    node,
  )}class ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} ${heritage} ${interfaceType(
    node,
    nodeName,
    mergedNamespaceChildren,
    true,
  )}`;

  return str;
};
