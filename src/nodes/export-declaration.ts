import type { RawNode } from "./node";
import * as ts from "typescript";
import type { Expression, ExportDeclaration as RawExport } from "typescript";
import * as printers from "../printers";
import Node from "./node";
import { checker } from "../checker";

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
      // @ts-expect-error todo(flow->ts)
      const elements = this.raw.exportClause.elements;

      let specifier = "";
      if (this.raw.moduleSpecifier)
        specifier = `from '${this.raw.moduleSpecifier.text}';`;

      const typeExports = elements.filter(ts.isTypeOnlyImportOrExportDeclaration);
      const varExports = elements.filter(node => !ts.isTypeOnlyImportOrExportDeclaration(node));

      let result = "";
      if (typeExports.length > 0) {
        result += `export type {
          ${elements.map(node => printers.node.printType(node))}
        }${specifier}\n`;
      }
      if (varExports.length > 0) {
        result += `declare export {
          ${elements.map(node => printers.node.printType(node))}
        }${specifier}\n`;
      }

      return result;
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';\n`;
    }
  }
}
