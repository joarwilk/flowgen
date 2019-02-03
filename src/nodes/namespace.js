/* @flow */
import { uniqBy, flatten } from "lodash";
import Node from "./node";

import namespaceManager from "../namespaceManager";

export default class Namespace extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
    namespaceManager.register(name);
  }

  addChild(name: string, child: Node<>): void {
    child.namespace = this.name;
    namespaceManager.registerProp(this.name, child.name);

    this.children[name] = child;
  }

  print = (): string => {
    const functions = this.getChildren().filter(
      child => child.raw && child.raw.kind === "FunctionDeclaration",
    );
    const variables = flatten(
      this.getChildren()
        .filter(child => child.raw && child.raw.kind === "VariableStatement")
        .map(child => child.raw.declarationList.declarations),
    );

    const children = `${this.getChildren()
      .map(child => {
        return child.print(this.name);
      })
      .join("\n\n")}`;

    if (functions.length || variables.length) {
      const nsGroup = `
      declare var npm$namespace$${this.name}: {
        ${uniqBy(functions, child => child.name)
          .map(child => {
            return `${child.name}: typeof ${this.name}$${child.name},`;
          })
          .join("\n")}
        ${variables
          .map(child => {
            return `${child.name.text}: typeof ${this.name}$${
              child.name.text
            },`;
          })
          .join("\n")}
      }\n`;

      return nsGroup + children;
    }

    return children;
  };
}
