/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

export default class Import extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print(): string {
    //TODO: move to printers
    if (this.raw.importClause) {
      const bindings = this.raw.importClause.namedBindings;
      const name = this.raw.importClause.name;
      if (name && bindings) {
        const elements = bindings.elements;
        if (elements) {
          return `import ${name.text}, {
          ${elements.map(node => {
            return `${node.name.text}`;
          })}
        } from '${this.raw.moduleSpecifier.text}';\n`;
        } else {
          const namespace = bindings.name.text;
          return `import ${name.text}, * as ${namespace} from '${
            this.raw.moduleSpecifier.text
          }';\n`;
        }
      }
      if (name) {
        return `import ${name.text} from '${this.raw.moduleSpecifier.text}';\n`;
      }
      if (bindings) {
        const elements = bindings.elements;
        if (elements) {
          return `import type {
          ${elements.map(node => {
            return `${node.name.text}`;
          })}
        } from '${this.raw.moduleSpecifier.text}';\n`;
        } else {
          const name = bindings.name.text;
          return `import * as ${name} from '${
            this.raw.moduleSpecifier.text
          }';\n`;
        }
      }
    }
    // TODO: Implement this.
    return ``;
  }
}
