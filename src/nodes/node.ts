import _ from "lodash";
import type { Node as TSNode } from "typescript";
import { parseNameFromNode, stripDetailsFromTree } from "../parse/ast";

import * as printers from "../printers";

export type RawNode = any;

class Node<NodeType = RawNode> {
  children: {
    [key: string]: Node;
  };
  kind: string;
  name: string;
  raw: NodeType;
  namespace: string | undefined | null;
  module: string | undefined | null;

  constructor(node?: NodeType | null) {
    //$off
    this.children = Object.create(null);

    if (node !== null) {
      this.raw = stripDetailsFromTree(node);
      this.name = parseNameFromNode(node);
    }
  }

  addChild(name: string, node: Node): void {
    this.children[name] = node;
  }

  //TODO: remove this
  addChildren(name: string, node: Node): void {
    if (!this.children[name]) {
      this.children[name] = node;
      return;
    }
    if (this.children[name]) {
      for (const key in node.children) {
        this.children[name].addChildren(key, node.children[key]);
      }
      return;
    }
  }

  /**
   * Used for overloading the props of some types
   */
  maybeAddMember(members: any | ReadonlyArray<any>): void {
    const rawMembers: Array<TSNode> | void = (this.raw as any).members;
    if (!rawMembers) {
      return;
    }
    if (Array.isArray(members)) {
      members.forEach(member => {
        rawMembers.push(stripDetailsFromTree(member));
      });
    } else {
      rawMembers.push(stripDetailsFromTree(members));
    }
  }

  getChildren(): ReadonlyArray<Node> {
    return _.toArray(this.children);
  }

  //eslint-disable-next-line
  print(namespace?: string, module?: string, depth?: number): string {
    return printers.node.printType(this.raw);
  }
}
interface Node {
  [k: string]: any;
}

export default Node;
