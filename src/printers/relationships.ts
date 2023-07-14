import * as ts from "typescript";
import { opts } from "../options";
import type { RawNode } from "../nodes/node";

import namespaceManager from "../namespace-manager";
import * as printers from "./index";

export const moduleExports = (node: RawNode): string => {
  const name = printers.node.printType(node.expression);
  if (node.isExportEquals && opts().moduleExports) {
    return `declare module.exports: typeof ${name}\n`;
  } else {
    return `declare export default typeof ${name}\n`;
  }
};

export const exporter = (node: RawNode): string => {
  let str = "";

  if (
    node.modifiers &&
    node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.ExportKeyword,
    )
  ) {
    str += "export ";
  }

  if (
    node.modifiers &&
    node.modifiers.some(
      modifier => modifier.kind === ts.SyntaxKind.DefaultKeyword,
    )
  ) {
    str += "default ";
  }

  return str;
};

export const importExportSpecifier = (
  node: ts.ImportSpecifier | ts.ExportSpecifier,
): string => {
  if (node.propertyName) {
    return `${printers.node.printType(
      node.propertyName,
    )} as ${printers.node.printType(node.name)}`;
  }

  if (node.name.escapedText === "Record") {
    return "Record";
  }

  return printers.node.printType(node.name);
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

export const namespace = (name: string, hidePunctuation = false): string => {
  if (namespaceManager.nsExists(name)) {
    return `${name}${hidePunctuation ? "" : "$"}`;
  }

  return name + (hidePunctuation ? "" : ".");
};

export const namespaceProp = (
  name: string,
  hidePunctuation = false,
): string => {
  if (namespaceManager.nsPropExists(name)) {
    return `${namespaceManager.getNSForProp(name)}${
      hidePunctuation ? "" : "$"
    }${name}`;
  }

  return name;
};
