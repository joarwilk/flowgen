/* @flow */
import type { RawNode } from "./node";
import Node from "./node";

import printers from "../printers";

import namespaceManager from "../namespaceManager";
import { parseNameFromNode } from "../parse";

export default class Property extends Node {
  name: string;

  constructor(node: RawNode) {
    super(node);

    this.name = parseNameFromNode(node);
  }

  print(namespace: string = "") {
    let out = "";
    let name = this.name;

    if (namespace) {
      namespaceManager.registerProp(namespace, this.name);
    }

    if (namespace) {
      name = namespace + "$" + name;
    }

    if (this.raw.jsDoc) {
      out += printers.common.comment(this.raw.jsDoc);
    }

    switch (this.raw.kind) {
      case "FunctionDeclaration":
        out += printers.functions.functionDeclaration(name, this.raw);
        break;
      case "ClassDeclaration":
        out += printers.declarations.classDeclaration(this.raw);
        break;
      case "InterfaceDeclaration":
        out += printers.declarations.interfaceDeclaration(name, this.raw);
        break;
      case "TypeAliasDeclaration":
        out += printers.declarations.typeDeclaration(name, this.raw);
        break;
    }

    return out;
  }
}
