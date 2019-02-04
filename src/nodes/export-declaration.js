/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

export default class ExportDeclaration extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    if (this.raw.exportClause) {
      const elements = this.raw.exportClause.elements;
      if (elements) {
        let specifier = "";
        if (this.raw.moduleSpecifier)
          specifier = `from '${this.raw.moduleSpecifier.text}';`;
        return `declare export {
          ${elements.map(node => {
            return `${node.name.text}`;
          })}
        }${specifier}\n`;
      }
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';\n`;
    }
  }
}
