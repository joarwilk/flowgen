/* @flow */

import type { RawNode } from "../nodes/node";
import type ImportNode from "../nodes/import";

import namespaceManager from "../namespaceManager";
import printers from "./index";

export const moduleExports = (node: RawNode): string => {
  let name = printers.node.printType(node.expression);
  if (node.isExportEquals) {
    return `declare module.exports: typeof ${name}\n`;
  } else {
    return `declare export default typeof ${name}\n`;
  }
};

export const exporter = (node: RawNode): string => {
  let str = "";

  if (
    node.modifiers &&
    node.modifiers.some(modifier => modifier.kind === "ExportKeyword")
  ) {
    str += "export ";
  }

  if (
    node.modifiers &&
    node.modifiers.some(modifier => modifier.kind === "DefaultKeyword")
  ) {
    str += "default ";
  }

  return str;
};

// TODO: move import here
// export const imports = (node: ImportNode, moduleName: string): string => {
//   let str = "import type ";

//   if (node.default) {
//     str += node.default;

//     if (node.explicit.length) {
//       str += ", ";
//     }
//   }

//   if (node.explicit.length) {
//     str += `{ ${node.explicit.join(", ")} }`;
//   }

//   str += ` from '${moduleName}'`;

//   return str;
// };

export const namespace = (
  name: string,
  hidePunctuation: boolean = false,
): string => {
  if (namespaceManager.nsExists(name)) {
    return `${name}${hidePunctuation ? "" : "$"}`;
  }

  return name + (hidePunctuation ? "" : ".");
};

export const namespaceProp = (
  name: string,
  hidePunctuation: boolean = false,
): string => {
  if (namespaceManager.nsPropExists(name)) {
    return `${namespaceManager.getNSForProp(name)}$${name}`;
  }

  return name;
};
