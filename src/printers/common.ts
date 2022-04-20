import * as ts from "typescript";
import { opts } from "../options";
import type { RawNode } from "../nodes/node";

import * as printers from "./index";
import { withEnv } from "../env";

export const literalType = (node: RawNode): string => {
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

/** Print as a Flow exact object type. */
export const printExactObjectType = (members: string[]) => {
  if (members.length === 0) {
    return `{||}`;
  } else if (members.length === 1) {
    return `{|${members[0]}|}`;
  } else {
    return `{|\n${members.join(",\n")}\n|}`;
  }
};

/** Print as a Flow inexact object type. */
export const printInexactObjectType = (members: string[]) => {
  if (members.length === 0) {
    return `{...}`;
  } else if (members.length === 1) {
    return `{${members[0]}, ...}`;
  } else {
    return `{\n${members.join(",\n")},\n...\n}`;
  }
};

/** Print as a Flow object type, applying the option `inexact`. */
export const printDefaultObjectType = (members: string[]) => {
  return opts().inexact
    ? printInexactObjectType(members)
    : printExactObjectType(members);
};

export const typeParameter = (
  node: ts.TypeParameterDeclaration & {
    withoutDefault: boolean;
  },
): string => {
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

export const parameter = (
  param:
    | ts.ParameterDeclaration
    | ts.PropertySignature
    | ts.GetAccessorDeclaration
    | ts.SetAccessorDeclaration,
): string => {
  let left = "";
  if (param.modifiers) {
    for (const modifier of param.modifiers) {
      if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) left += "+";
    }
  }
  if (param.kind === ts.SyntaxKind.SetAccessor) {
    left += "-";
  }
  let right: string;

  if (
    param.name.kind === ts.SyntaxKind.ObjectBindingPattern ||
    param.name.kind === ts.SyntaxKind.ArrayBindingPattern
  ) {
    left = `x`;
  } else {
    left += printers.node.printType(param.name);
  }

  if (!param.type) {
    if (param.name.kind === ts.SyntaxKind.ObjectBindingPattern) {
      right = printInexactObjectType(
        param.name.elements.map(
          element => `${printers.node.printType(element)}: any`,
        ),
      );
    } else {
      right = "any";
    }
  } else {
    right = printers.node.printType(param.type);
  }

  if (
    param.questionToken &&
    param.name.kind !== ts.SyntaxKind.ComputedPropertyName
  ) {
    left += "?";
  }

  if (
    param.questionToken &&
    param.name.kind === ts.SyntaxKind.ComputedPropertyName
  ) {
    right = `(${right}) | void`;
  }

  if (ts.isParameter(param) && param.dotDotDotToken) {
    left = "..." + left;
  }

  return `${left}: ${right}`;
};

export const methodSignature = (
  param: ts.MethodSignature | ts.MethodDeclaration,
): string => {
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

  if (
    param.questionToken &&
    param.name.kind !== ts.SyntaxKind.ComputedPropertyName
  ) {
    left += "?";
    isMethod = false;
  }
  if (param.name.kind === ts.SyntaxKind.ComputedPropertyName) {
    isMethod = false;
  }

  right = printers.functions.functionType(param, isMethod);

  if (
    param.questionToken &&
    param.name.kind === ts.SyntaxKind.ComputedPropertyName
  ) {
    right = `(${right}) | void`;
  }

  return `${left}${isMethod ? "" : ": "}${right}`;
};

export const generics = (types?: ReadonlyArray<RawNode> | null): string => {
  if (types && typeof types.length !== "undefined") {
    return `<${types.map(printers.node.printType).join(", ")}>`;
  }
  return "";
};

export const genericsWithoutDefault = (
  types?: ReadonlyArray<RawNode> | null,
): string => {
  if (types && typeof types.length !== "undefined") {
    return `<${types
      .map(node => {
        node.withoutDefault = true;
        return printers.node.printType(node);
      })
      .join(", ")}>`;
  }
  return "";
};

const jsDocPrintTag = (tag): string => {
  const typeNameValue = tag.typeExpression && tag.typeExpression.type;
  const parameterNameValue = tag.name || tag.preParameterName;
  const typeName = typeNameValue
    ? ` {${printers.node.printType(typeNameValue)}}`
    : "";
  const parameterName = parameterNameValue
    ? ` ${
        tag.isBracketed
          ? `[${printers.node.printType(parameterNameValue)}]`
          : printers.node.printType(parameterNameValue)
      }`
    : "";
  const comment = tag.comment ? ` ${tag.comment}`.replace(/\n/g, "\n * ") : "";
  if (typeNameValue && typeNameValue.kind === ts.SyntaxKind.JSDocTypeLiteral) {
    let output = `\n * @${tag.tagName.text}${typeName}${parameterName}${comment}`;
    for (const jsDocPropertyTag of typeNameValue.jsDocPropertyTags) {
      output += jsDocPrintTag(jsDocPropertyTag);
    }
    return output;
  }
  if (tag && tag.kind === ts.SyntaxKind.JSDocCallbackTag) {
    const parameterName = parameterNameValue
      ? printers.node.printType(parameterNameValue)
      : "";
    let output = `\n * @${tag.tagName.text} ${parameterName}${tag.comment}`;
    for (const param of tag.typeExpression.parameters) {
      output += jsDocPrintTag(param);
    }
    if (typeNameValue) output += jsDocPrintTag(typeNameValue);
    return output;
  }
  return `\n * @${tag.tagName.text}${typeName}${parameterName}${comment}`;
};

/** The node's jsdoc comments, if any and if the `jsdoc` option is enabled. */
export const jsdoc = withEnv<any, [ts.Node], string>((env, node): string => {
  if (!opts().jsdoc) return "";

  // @ts-expect-error The jsDoc property is internal, on ts.JSDocContainer.
  const jsDoc = node.jsDoc as void | ts.JSDoc[];
  if (!jsDoc) return "";

  const blocks = jsDoc
    .map(doc => {
      const comment = (doc.comment ? `\n${doc.comment}` : "").replace(
        /\n/g,
        "\n * ",
      );

      env.tsdoc = true;
      const tags = (doc.tags || []).map(jsDocPrintTag);
      env.tsdoc = false;

      return `/**${comment + tags.join("")}\n */\n`;
    })
    .join("");
  return `\n${blocks}`;
});
