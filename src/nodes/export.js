/* @flow */
import type { RawNode } from './node';
import Node from './node';

export default class Export extends Node {
  constructor(node: RawNode) {
    super(node);
  }
}
