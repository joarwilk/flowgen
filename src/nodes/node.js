/* @flow */
export type RawNode = any;

import _ from "lodash";
import { stripDetailsFromTree, parseNameFromNode } from "../parse";

import printers from "../printers";

export default class Node<NodeType = RawNode> {
  children: {
    [key: string]: Node,
  };
  kind: string;
  name: string;
  raw: NodeType;
  namespace: ?string;

  constructor(node: ?NodeType) {
    this.children = {};

    if (node) {
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
        this.children[name].addChild(key, node.children[key]);
      }
      return;
    }
  }

  /**
   * Used for overloading the props of some types
   */
  maybeAddMember(members: Object | Array<Object>): void {
    if (!this.raw.members) {
      return;
    }

    if (Array.isArray(members)) {
      members.forEach(member => {
        this.raw.members.push(stripDetailsFromTree(member));
      });
    } else {
      this.raw.members.push(stripDetailsFromTree(members));
    }
  }

  getChildren(): Array<Node> {
    return _.toArray(this.children);
  }

  print(namespace?: string): string {
    return printers.node.printType(this.raw);
  }
}
