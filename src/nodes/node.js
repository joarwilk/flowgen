/* @flow */
export type RawNode = any;

import { stripDetailsFromTree, parseNameFromNode } from '../parse'

import printers from '../printers';

export default class Node {
  children: Array<Node>;
  kind: string;
  name: string;
  raw: RawNode;
  namespace: ?string;

  constructor(node: ?RawNode) {
    this.children = [];

    if (node) {
      this.raw = stripDetailsFromTree(node);
      this.name = parseNameFromNode(node);
    }
  }

  addChild(node: Node) {
    this.children.push(node);
  }

  print() {
    return printers.node.printType(this.raw);
  }
}
