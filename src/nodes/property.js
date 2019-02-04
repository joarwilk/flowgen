/* @flow */
import type { RawNode } from "./node";
import type {
  FunctionDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  VariableStatement,
  JSDoc,
} from "typescript";
import Node from "./node";

import printers from "../printers";
import namespaceManager from "../namespaceManager";
import { parseNameFromNode } from "../parse/ast";

type PropertyNode =
  | {
      ...$Exact<FunctionDeclaration>,
      kind: "FunctionDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<ClassDeclaration>,
      kind: "ClassDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<InterfaceDeclaration>,
      kind: "InterfaceDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<TypeAliasDeclaration>,
      kind: "TypeAliasDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<EnumDeclaration>,
      kind: "EnumDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<VariableStatement>,
      kind: "VariableStatement",
      jsDoc: Array<JSDoc>,
    };

export default class Property extends Node<PropertyNode> {
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
          if (namespace && decl.name.kind === "Identifier") {
            const text = (decl.name: any).text;
            namespaceManager.registerProp(namespace, text);
          }
        }
        out += printers.declarations.variableDeclaration(this.raw);
        break;
      default:
        /*::;(this.raw.kind: empty)*/
        break;
    }
    return out;
  }
}
