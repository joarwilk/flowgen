import type { RawNode } from "./node";
import type { Expression, ExportDeclaration as RawExport } from "typescript";
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
      // @ts-expect-error todo(flow->ts)
      const elements = this.raw.exportClause.elements;
      const isTypeImport = this.raw.isTypeOnly;

      let specifier = "";
      if (this.raw.moduleSpecifier)
        specifier = `from '${this.raw.moduleSpecifier.text}';`;

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
