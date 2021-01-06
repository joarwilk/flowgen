import * as ts from "typescript";
import type { RawNode } from "./node";
import * as logger from "../logger";
import Node from "./node";
import Namespace from "./namespace";

export default class Module extends Node {
  name: string;

  constructor(node: RawNode | undefined | null, name: string) {
    super(node);

    this.name = name;
  }

  addChild(name: string, child: Node): void {
    child.module = this.name;
    this.children[name] = child;
  }

  addChildren(name: string, child: Node): void {
    child.module = this.name;
    if (
      child instanceof Namespace &&
      this.children[child.name] &&
      this.children[child.name].raw &&
      this.children[child.name].raw.kind === ts.SyntaxKind.ClassDeclaration
    ) {
      name = child.name;
    }
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

  print(namespace?: string, module?: string, depth = 0): string {
    const children = this.getChildren()
      .map(child => {
        return child.print(undefined, this.name, depth + 1);
      })
      .join("\n\t");
    const node = `
    declare module '${this.name}' {
      ${children}
    }
    `;
    if (module !== undefined && depth === 1) {
      logger.error(this.raw, { type: "UnsupportedNestedModule" });
      return `/* ${node} */\n`;
    }
    return `${node}\n`;
  }
}
