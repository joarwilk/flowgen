/* @flow */

import program from "commander";
import type { RawNode } from "../nodes/node";
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

const interfaceRecordType = (
  node: RawNode,
  heritage: string,
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

  return `{${heritage}${members}}`;
};

const interfaceRecordDeclaration = (
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
          .map(type => `...$Exact<${type}>`)
          .join(",\n");
      })
      .join("");
    heritage = heritage.length > 0 ? `${heritage},\n` : "";
  }

  let str = `${printers.relationships.exporter(node) ||
    "declare "}type ${nodeName}${printers.common.generics(
    node.typeParameters,
  )} = ${interfaceRecordType(node, heritage)}\n`;

  return str;
};

export const interfaceDeclaration = (
  nodeName: string,
  node: RawNode,
): string => {
  const isRecord = program.opts().interfaceRecords;
  if (isRecord) {
    return interfaceRecordDeclaration(nodeName, node);
  }
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

export const enumStringDeclaration = (
  nodeName: string,
  node: RawNode,
): string => {
  const exporter = printers.relationships.exporter(node);
  let members = "";
  for (const [, member] of node.members.entries()) {
    members += `| ${JSON.stringify(member.name.text)}`;
  }
  return `declare ${exporter} type ${nodeName} =
  ${members}
\n`;
};

export const enumDeclaration = (nodeName: string, node: RawNode): string => {
  const isStringEnum = program.opts().stringEnums;

  if (isStringEnum) {
    return enumStringDeclaration(nodeName, node);
  }

  const exporter = printers.relationships.exporter(node);
  const constructor = `constructor(...args: empty): mixed;\n`;
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
    const left = `Class<${name}> & ${name} & ${value}`;
    instances += `declare class ${name} mixins ${nodeName} {}\n`;
    members += `static +${member.name.text}: ${left};`;
    members += `// ${value}\n`;
  }
  return `declare ${exporter} class ${nodeName} {
  ${constructor}${members}
}\n
${instances}`;
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
