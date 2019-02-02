/* @flow */
import type { RawNode } from "./node";
import type {
  FunctionDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  JSDoc,
} from "typescript";
import Node from "./node";

import printers from "../printers";

import namespaceManager from "../namespaceManager";
import { parseNameFromNode } from "../parse";

// TODO: why typescript doesn't describe jsDoc property
// type RawFunctionDeclaration = {|
//   ...$Exact<FunctionDeclaration>,
//   jsDoc: Array<JSDoc>,
//   kind: "FunctionDeclaration",
// |};
// type RawClassDeclaration = {|
//   ...$Exact<ClassDeclaration>,
//   jsDoc: Array<JSDoc>,
//   kind: "ClassDeclaration",
// |};
// type RawInterfaceDeclaration = {|
//   ...$Exact<InterfaceDeclaration>,
//   jsDoc: Array<JSDoc>,
//   kind: "InterfaceDeclaration",
// |};
// type RawTypeAliasDeclaration = {|
//   ...$Exact<TypeAliasDeclaration>,
//   jsDoc: Array<JSDoc>,
//   kind: "TypeAliasDeclaration",
// |};
// type RawEnumDeclaration = {|
//   ...$Exact<EnumDeclaration>,
//   jsDoc: Array<JSDoc>,
//   kind: "EnumDeclaration",
// |};

export default class Property extends Node<
  | FunctionDeclaration
  | ClassDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration,
> {
  name: string;

  constructor(node: RawNode) {
    super(node);

    this.name = parseNameFromNode(node);
  }

  print(namespace: string = ""): string {
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
        out += printers.declarations.classDeclaration(name, this.raw);
        break;
      case "InterfaceDeclaration":
        out += printers.declarations.interfaceDeclaration(name, this.raw);
        break;
      case "TypeAliasDeclaration":
        out += printers.declarations.typeDeclaration(name, this.raw);
        break;
      case "EnumDeclaration":
        out += printers.declarations.enumDeclaration(name, this.raw);
        break;
      case "VariableStatement":
        for (const decl of this.raw.declarationList.declarations) {
          if (namespace)
            namespaceManager.registerProp(namespace, decl.name.text);
        }
        out += printers.declarations.variableDeclaration(this.raw);
        break;
    }

    return out;
  }
}
