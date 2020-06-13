/* @flow */

import type { RawNode } from "./node";
import Node from "./node";
import printers from "../printers";

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
          return `import${this.module === "root" ? "" : " type"} ${name.text}, {
          ${elements.map(node => printers.node.printType(node))}
        } from '${this.raw.moduleSpecifier.text}';\n`;
        } else {
          const namespace = bindings.name.text;
          return `import${this.module === "root" ? "" : " typeof"} ${
            name.text
          }, * as ${namespace} from '${this.raw.moduleSpecifier.text}';\n`;
        }
      }
      if (name) {
        return `import${this.module === "root" ? "" : " typeof"} ${
          name.text
        } from '${this.raw.moduleSpecifier.text}';\n`;
      }
      if (bindings) {
        const elements = bindings.elements;
        if (elements) {
          return `import${this.module === "root" ? "" : " type"} {
          ${elements.map(node => printers.node.printType(node))}
        } from '${this.raw.moduleSpecifier.text}';\n`;
        } else {
          const name = bindings.name.text;
          return `import${
            this.module === "root" ? "" : " typeof"
          } * as ${name} from '${this.raw.moduleSpecifier.text}';\n`;
        }
      }
    }
    return this.module === "root"
      ? `import '${this.raw.moduleSpecifier.text}';\n`
      : "";
  }
}
