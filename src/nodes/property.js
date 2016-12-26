/* @flow */
import type { RawNode } from '../parse';
import Node from './node';

export default class Property extends Node {
  constructor(node: RawNode) {
    super(node);
  }
}
