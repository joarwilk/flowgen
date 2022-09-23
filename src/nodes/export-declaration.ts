import type { RawNode } from "./node";
import type { Expression, ExportDeclaration as RawExport } from "typescript";
import { isNamespaceExport } from "typescript";
import * as printers from "../printers";
import Node from "./node";

type ExportDeclarationType = RawExport & {
  moduleSpecifier?: Expression & {
    text: string;
  };
};

export default class ExportDeclaration extends Node<ExportDeclarationType> {
  constructor(node: RawNode) {
    super(node);
  }

  print(): string {
    //TODO: move to printers
    if (this.raw.exportClause) {
      const isTypeImport = this.raw.isTypeOnly;

      let specifier = "";
      if (this.raw.moduleSpecifier)
        specifier = `from '${this.raw.moduleSpecifier.text}';`;

      if (isNamespaceExport(this.raw.exportClause)) {
        return `declare export * as ${this.raw.exportClause.name.escapedText} ${specifier}\n`;
      }

      // split exports into type and value exports
      const rawElements = this.raw.exportClause.elements;
      let typeExports, valueExports;
      if (isTypeImport) {
        typeExports = rawElements;
        valueExports = [];
      } else {
        typeExports = [];
        valueExports = [];
        for (const node of rawElements) {
          if (node.isTypeOnly) {
            typeExports.push(node);
          } else {
            valueExports.push(node);
          }
        }
      }

      const generateOutput = (prefix, elems) => {
        return `${prefix} {
          ${elems.map(node => printers.node.printType(node))}
        }${specifier}\n`;
      };

      let result = "";
      if (typeExports.length) {
        result += generateOutput(`export type`, typeExports);
      }
      if (valueExports.length) {
        result += generateOutput(`declare export`, valueExports);
      }
      return result;
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';\n`;
    }
  }
}
