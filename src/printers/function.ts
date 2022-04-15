import * as ts from "typescript";
import type { RawNode } from "../nodes/node";
import * as printers from "./index";

export const functionType = (func: RawNode, dotAsReturn = false): string => {
  const params = func.parameters
    .filter(param => param.name.text !== "this")
    .map(printers.common.parameter);
  const generics = printers.common.genericsWithoutDefault(func.typeParameters);
  const returns = func.type ? printers.node.printType(func.type) : "void";

  const firstPass = `${generics}(${params.join(", ")})${
    dotAsReturn ? ":" : " =>"
  } ${returns}`;

  // Make sure our functions aren't too wide
  if (firstPass.length > 80) {
    // break params onto a new line for better formatting
    const paramsWithNewlines = `\n${params.join(",\n")}`;

    return `${generics}(${paramsWithNewlines})${
      dotAsReturn ? ":" : " =>"
    } ${returns}`;
  }

  return firstPass;
};

export const functionDeclaration = (
  nodeName: string,
  node: RawNode,
): string => {
  const exporter = printers.relationships.exporter(node);
  let name = nodeName;
  if (
    node.modifiers &&
    node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword,
    )
  ) {
    name = nodeName === "INVALID NAME REF" ? "fn" : nodeName;
  }
  // each functionDeclaration gets it's own line
  const str = `declare ${exporter}function ${name}${functionType(
    node,
    true,
  )}\n`;

  return str;
};
