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

  addChildren(name: string, child: Node<>): void {
    child.module = this.name;
    if (!this.children[name]) {
      this.children[name] = child;
      return;
    }
    if (this.children[name]) {
      for (const key in child.children) {
        this.children[name].addChildren(key, child.children[key]);
      }
      return;
    }
  }

  print = () => {
    return `declare module '${this.name}' {
        ${this.getChildren()
          .map(child => {
            return child.print(undefined, this.name);
          })
          .join("\n\t")}
    }\n`;
  };
}
