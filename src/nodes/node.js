/* @flow */
export type RawNode = {
  name?: {
    text?: string
  } | string,
  type?: {
    typeName?: {
      text: string
    }
  },
  moduleSpecifier?: {
    text: string
  },
  parameters?: Array<RawNode>,
  typeParameters?: Array<RawNode>
}

import { stripDetailsFromTree } from '../parse'

import printers from '../printers';

export default class Node {
  children: Array<Node>;
  kind: string;
  raw: RawNode;

  constructor(node: ?RawNode) {
    this.children = [];

    if (node) {
      this.raw = stripDetailsFromTree(node);
    }
  }

  addChild(node: Node) {
    this.children.push(node);
  }

  print() {
    return printers.node.printType(this.raw);
  }
}
