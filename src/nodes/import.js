/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

export default class Import extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    if (this.raw.importClause) {
      const elements = this.raw.importClause.namedBindings.elements;
      if (elements) {
        return `import type {
          ${elements.map(node => {
            return `${node.name.text}`;
          })}
        } from '${this.raw.moduleSpecifier.text}';\n`;
      } else {
        const name = this.raw.importClause.namedBindings.name.text;
        return `import * as ${name} from '${this.raw.moduleSpecifier.text}';\n`;
      }
    }
    // TODO: Implement this.
    return ``;
  }
}
