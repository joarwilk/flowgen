/* @flow */
import type { RawNode } from './node';
import Node from './node';

import namespaceManager from '../namespaceManager';

export default class Namespace extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
    namespaceManager.register(name);
  }

  addChild(child: Node) {
    child.namespace = this.name;
    namespaceManager.registerProp(this.name, child.name);

    this.children.push(child);
  }

  print = () => {
    return this.children.map(child => {
      return child.print(this.name)
    }).join('\n\n')
  }
}
