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

  print = () => {
    return this.children.map(child => {
      return child.print(this.name)
    }).join('\n\n')
  }
}
