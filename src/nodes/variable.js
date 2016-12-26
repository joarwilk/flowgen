/* @flow */
import type { RawNode } from './node';
import Node from './node';

export default class Variable extends Node {
  constructor(node: RawNode) {
    super(node);
  }

  print() {
    return 'declare var asd = 123'
  }
}
