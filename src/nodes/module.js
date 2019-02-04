/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

export default class Module extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
  }

  addChild(name: string, child: Node<>): void {
    child.module = this.name;
    this.children[name] = child;
  }

  print = () => {
    return `declare module '${this.name}' {
        ${this.getChildren()
          .map(child => {
            return child.print();
          })
          .join("\n\t")}
    }\n`;
  };
}
