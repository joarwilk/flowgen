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
import * as ts from "typescript";
import Node from "./node";

import printers from "../printers";
import namespaceManager from "../namespaceManager";
import { parseNameFromNode } from "../parse/ast";

type PropertyNode =
  | {
      ...$Exact<FunctionDeclaration>,
      //kind: "FunctionDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<ClassDeclaration>,
      //kind: "ClassDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<InterfaceDeclaration>,
      //kind: "InterfaceDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<TypeAliasDeclaration>,
      //kind: "TypeAliasDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<EnumDeclaration>,
      //kind: "EnumDeclaration",
      jsDoc: Array<JSDoc>,
    }
  | {
      ...$Exact<VariableStatement>,
      //kind: "VariableStatement",
      jsDoc: Array<JSDoc>,
    };

export default class Property extends Node<PropertyNode> {
  name: string;

  constructor(node: RawNode) {
    super(node);

    this.name = parseNameFromNode(node);
  }

  print(namespace: string = "", mod: string = "root"): string {
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

    const isDeclare = mod !== "root";
    const exporter = printers.relationships.exporter(this.raw);
    const modifier = exporter
      ? `${isDeclare ? "declare " : ""}${exporter}`
      : "declare ";

    switch (this.raw.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
        out += printers.functions.functionDeclaration(name, this.raw);
        break;
      case ts.SyntaxKind.ClassDeclaration:
        out += printers.declarations.classDeclaration(name, this.raw);
        break;
      case ts.SyntaxKind.InterfaceDeclaration:
        out += printers.declarations.interfaceDeclaration(
          name,
          this.raw,
          modifier,
        );
        break;
      case ts.SyntaxKind.TypeAliasDeclaration:
        out += printers.declarations.typeDeclaration(name, this.raw, modifier);
        break;
      case ts.SyntaxKind.EnumDeclaration:
        out += printers.declarations.enumDeclaration(name, this.raw);
        break;
      case ts.SyntaxKind.VariableStatement:
        for (const decl of this.raw.declarationList.declarations) {
          if (namespace && decl.name.kind === ts.SyntaxKind.Identifier) {
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
