/* @flow */
import type { RawNode } from "../nodes/node";

import printers from "./index";

export const functionType = (func: RawNode, dotAsReturn: boolean = false) => {
  const params = func.parameters.map(printers.common.parameter);
  const generics = printers.common.generics(func.typeParameters);
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

export const functionDeclaration = (nodeName: string, node: RawNode) => {
  // each functionDeclaration gets it's own line
  let str = `declare ${printers.relationships.exporter(
    node,
  )}function ${nodeName}${functionType(node, true)}\n`;

  return str;
};
