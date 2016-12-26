/* @flow */
import type { RawNode } from './node';
import Node from './node';

export default class Module extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
  }

  addChild = (node: Node) => {
    this.children.push(node)
  }

  print = () => {
    console.log(this)
    return this.children.map(child => {
      console.log(child.print());
      child.print()
    }).join('\n')
  }
}
