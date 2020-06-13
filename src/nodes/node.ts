/* @flow */

import _ from "lodash";
import type { Node as TSNode } from "typescript";
import { parseNameFromNode, stripDetailsFromTree } from "../parse/ast";

import printers from "../printers";

export type RawNode = any;

export default class Node<NodeType = RawNode> {
  children: {
    [key: string]: Node<>,
  };
  kind: string;
  name: string;
  raw: NodeType;
  namespace: ?string;
  module: ?string;

  constructor(node: ?NodeType) {
    //$off
    this.children = Object.create(null);

    if (node !== null) {
      this.raw = stripDetailsFromTree(node);
      this.name = parseNameFromNode(node);
    }
  }

  addChild(name: string, node: Node<>): void {
    this.children[name] = node;
  }

  //TODO: remove this
  addChildren(name: string, node: Node<>): void {
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
  maybeAddMember(members: Object | $ReadOnlyArray<Object>): void {
    const rawMembers: Array<TSNode> | void = (this.raw: any).members;
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

  getChildren(): $ReadOnlyArray<Node<>> {
    return _.toArray(this.children);
  }

  //eslint-disable-next-line
  print(namespace?: string, module?: string, depth?: number): string {
    return printers.node.printType(this.raw);
  }
}
