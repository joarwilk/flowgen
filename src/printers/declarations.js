/* @flow */
import type { RawNode } from "../nodes/node";
import { SyntaxKind } from "typescript";

import printers from "./index";

export const variableDeclaration = (node: RawNode): string => {
  const declarations = node.declarationList.declarations
    .map(printers.node.printType)
    .join(" ");

  return `declare ${printers.relationships.exporter(node)}var ${declarations};`;
};

export const interfaceType = (
  node: RawNode,
  withSemicolons: boolean = false,
): string => {
  let members = node.members
    .map(member => {
      const printed = printers.node.printType(member);

      if (!printed) {
        return null;
      }

      let str = "\n";

      if (member.jsDoc) {
        str += printers.common.comment(member.jsDoc);
      }

      return str + printed;
    })
    .filter(Boolean) // Filter rows which didnt print propely (private fields et al)
    .join(withSemicolons ? ";" : ",");

  if (members.length > 0) {
    members += "\n";
  }

  return `{${members}}`;
};

export const interfaceDeclaration = (
  nodeName: string,
  node: RawNode,
): string => {
  let heritage = "";

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses
      .map(clause => {
        return clause.types
          .map(type => printers.node.printType(type))
          .join(" & ");
      })
      .join("");
    heritage = heritage.length > 0 ? `& ${heritage}\n` : "";
  }

  const type = node.heritageClauses ? "type" : "interface";

  let str = `${printers.relationships.exporter(node) ||
    "declare "}${type} ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} ${type === "type" ? "= " : ""}${interfaceType(node)} ${heritage}`;

  return str;
};

export const typeDeclaration = (nodeName: string, node: RawNode): string => {
  let str = `${printers.relationships.exporter(node) ||
    "declare "}type ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} = ${printers.node.printType(node.type)};`;

  return str;
};

export const enumDeclaration = (nodeName: string, node: RawNode): string => {
  const exporter = printers.relationships.exporter(node);
  let members = "";
  let instances = "";
  for (const [index, member] of node.members.entries()) {
    let value;
    const name = `${nodeName}__${member.name.text}`;
    if (typeof member.initializer !== "undefined") {
      value = printers.node.printType(member.initializer);
    } else {
      value = index;
    }
    instances += `declare class ${name} mixins ${nodeName} {}\n`;
    members += `static +${
      member.name.text
    }: Class<${name}> & ${name} & ${value};`;
    members += `// ${value}\n`;
  }
  return `${instances}
declare ${exporter} class ${nodeName} {
  constructor(...args: empty): mixed;
  ${members}
}\n`;
};

export const typeReference = (node: RawNode): string => {
  if (node.typeName.left && node.typeName.right) {
    return (
      printers.node.printType(node.typeName) +
      printers.common.generics(node.typeArguments)
    );
  }

  return (
    printers.relationships.namespaceProp(
      printers.identifiers.print(node.typeName.text),
      true,
    ) + printers.common.generics(node.typeArguments)
  );
};

export const classDeclaration = (nodeName: string, node: RawNode): string => {
  let heritage = "";

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses
      .map(clause => {
        return clause.types.map(printers.node.printType).join(", ");
      })
      .join(", ");
    heritage = heritage.length > 0 ? `mixins ${heritage}` : "";
  }

  let str = `declare ${printers.relationships.exporter(
    node,
  )}class ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} ${heritage} ${interfaceType(node, true)}`;

  return str;
};
