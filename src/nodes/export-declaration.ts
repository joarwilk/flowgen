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
      const elements = this.raw.exportClause.elements;

      const generateOutput = prefix => {
        return `${prefix} {
          ${elements.map(node => printers.node.printType(node))}
        }${specifier}\n`;
      };

      return isTypeImport
        ? generateOutput(`export type`)
        : generateOutput(`declare export`);
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';\n`;
    }
  }
}
