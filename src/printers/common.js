/* @flow */

import * as ts from "typescript";
import { opts } from "../options";
import type { RawNode } from "../nodes/node";

import printers from "./index";

export const literalType = (node: RawNode) => {
  if (node.literal) {
    if (node.literal.kind === ts.SyntaxKind.StringLiteral) {
      return printers.node.printType(node.literal);
    } else if (node.literal.text) {
      return node.literal.text;
    } else {
      return printers.node.printType(node.literal);
    }
  }

  if (node.type.typeName) {
    return node.type.typeName.text;
  }
  return printers.node.printType(node.type);
};

export const typeParameter = (
  node: ts.TypeParameterDeclaration & { withoutDefault: boolean },
) => {
  let defaultType = "";
  let constraint = "";
  if (node.constraint) {
    constraint = `: ${printers.node.printType(node.constraint)}`;
  }
  if (!node.withoutDefault && node.default) {
    defaultType = `= ${printers.node.printType(node.default)}`;
  }
  return `${node.name.text}${constraint}${defaultType}`;
};

export const parameter = (param: RawNode): string => {
  let left = "";
  if (param.modifiers) {
    for (const modifier of param.modifiers) {
      if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) left += "+";
    }
  }
  let right;

  if (param.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
    left = `x`;
  } else {
    left += printers.node.printType(param.name);
  }

  if (!param.type) {
    if (param.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
      if (param.name.elements.length > 0) {
        right = `{${param.name.elements
          .map(element => `${printers.node.printType(element)}: any`)
          .join(", ")}}`;
      } else {
        right = "{}";
      }
    } else {
      right = "any";
    }
  } else {
    right = printers.node.printType(param.type);
  }

  if (param.questionToken) {
    left += "?";
  }

  if (param.dotDotDotToken) {
    left = "..." + left;
  }

  return `${left}: ${right}`;
};

export const methodSignature = (param: RawNode) => {
  let left = "";
  let isMethod = true;
  if (param.modifiers) {
    for (const modifier of param.modifiers) {
      if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) {
        left += "+";
        isMethod = false;
      }
    }
  }
  left += printers.node.printType(param.name);
  let right;

  if (param.questionToken) {
    left += "?";
    isMethod = false;
  }

  right = printers.functions.functionType(param, isMethod);

  return `${left}${isMethod ? "" : ": "}${right}`;
};

export const parseTypeReference = (node: RawNode): string => {
  if (node.typeName.left && node.typeName.right) {
    return (
      printers.node.printType(node.typeName) + generics(node.typeArguments)
    );
  }

  return node.typeName.text + generics(node.typeArguments);
};

export const generics = (
  types: ?$ReadOnlyArray<RawNode>,
  map?: (node: RawNode) => RawNode = node => node,
): string => {
  if (types && typeof types.length !== "undefined") {
    return `<${types
      .map(map)
      .map(printers.node.printType)
      .join(", ")}>`;
  }

  return "";
};

export const comment = (jsdoc: Array<any>): string => {
  if (!opts().jsdoc) return "";
  const blocks = jsdoc
    .map(doc => {
      const comment = (doc.comment ? `\n${doc.comment}` : "").replace(
        /\n/g,
        "\n * ",
      );

      const tags = (doc.tags || []).map(tag => {
        const typeName =
          tag.typeExpression && tag.typeExpression.type
            ? ` {${printers.node.printType(tag.typeExpression.type)}}`
            : "";
        const parameterName = (tag.name || tag.preParameterName || {}).text
          ? ` ${(tag.name || tag.preParameterName || {}).text}`
          : "";
        const comment = tag.comment
          ? ` ${tag.comment}`.replace(/\n/g, "\n * ")
          : "";
        return `\n * @${tag.tagName.text}${typeName}${parameterName}${comment}`;
      });

      return comment + tags.join("");
    })
    .join("");

  return `\n/**${blocks}\n */\n`;
};
