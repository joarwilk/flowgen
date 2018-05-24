/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

export default class Import extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    // TODO: Implement this.
  }
}
