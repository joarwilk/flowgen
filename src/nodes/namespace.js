/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

import namespaceManager from "../namespaceManager";

export default class Namespace extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
    namespaceManager.register(name);
  }

  addChild(name: string, child: Node) {
    child.namespace = this.name;
    namespaceManager.registerProp(this.name, child.name);

    this.children[name] = child;
  }

  print = () => {
    const functions = this.getChildren().filter(
      child => child.raw && child.raw.kind === "FunctionDeclaration",
    );

    const children = `${this.getChildren()
      .map(child => {
        return child.print(this.name);
      })
      .join("\n\n")}`;

    if (functions.length) {
      const nsGroup = `
      declare var npm$namespace$${this.name}: {
        ${functions
          .map(child => {
            return `${child.name}: typeof ${this.name}$${child.name},`;
          })
          .join("\n")}
      }`;

      return nsGroup + children;
    }

    return children;
  };
}
