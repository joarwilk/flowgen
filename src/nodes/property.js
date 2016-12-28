/* @flow */
import type { RawNode } from './node';
import Node from './node';

import printers from '../printers';

import namespaceManager from '../namespaceManager';

export default class Property extends Node {
  namespace: string;
  name: string;

  constructor(node: RawNode, namespace: string = '') {
    super(node);

    this.namespace = namespace;
    this.name = this.raw.name.text;

    if (namespace) {
      console.log('registering ', namespace, this.name)
      namespaceManager.registerProp(namespace, this.name);
    }
  }

  print(namespace: string = '') {
    let out = '';
    let name = this.name;

    if (namespace) {
      namespaceManager.registerProp(namespace, this.name);
    }

    if (namespace) {
      name = namespace + '$' + name;
    }

    if (this.raw.jsDoc) {

      out += printers.common.comment(this.raw.jsDoc);
    }

    switch (this.raw.kind) {
      case 'ClassDeclaration':
      out += printers.declarations.classDeclaration( this.raw); break;
      case 'InterfaceDeclaration':
      out += printers.declarations.interfaceDeclaration(name, this.raw); break;
      case 'TypeAliasDeclaration':
      out += printers.declarations.typeDeclaration(name, this.raw); break;
    }

    return '\t' + out;
  }
}
