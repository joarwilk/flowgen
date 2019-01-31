/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

import printers from "../printers";

export default class ExportDeclaration extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    if (this.raw.exportClause) {
      return `declare export {
        ${this.raw.exportClause.elements.map(node => {
          return `${node.name.text}`;
        })}
      };`;
    } else {
      return `declare export * from '${this.raw.moduleSpecifier.text}';`;
    }
  }
}
