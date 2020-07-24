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
      // @ts-ignore todo(flow->ts)
      const elements = this.raw.exportClause.elements;
      let specifier = "";
      if (this.raw.moduleSpecifier)
        specifier = `from '${this.raw.moduleSpecifier.text}';`;
      return `declare export {
        ${elements.map(node => printers.node.printType(node))}
      }${specifier}\n`;
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';\n`;
    }
  }
}
