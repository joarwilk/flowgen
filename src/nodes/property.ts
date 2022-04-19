import type {
  FunctionDeclaration,
  ClassDeclaration,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  EnumDeclaration,
  VariableStatement,
} from "typescript";
import * as ts from "typescript";
import Node from "./node";

import * as printers from "../printers";
import namespaceManager from "../namespace-manager";
import { parseNameFromNode } from "../parse/ast";

type PropertyNode =
  | FunctionDeclaration
  | ClassDeclaration
  | InterfaceDeclaration
  | TypeAliasDeclaration
  | EnumDeclaration
  | VariableStatement;

export default class Property extends Node<PropertyNode> {
  name: string;
  skip: boolean;

  constructor(node: PropertyNode) {
    super(node);

    this.name = parseNameFromNode(node);
    this.skip = false;
  }

  skipNode() {
    this.skip = true;
  }

  print(namespace = "", mod = "root"): string {
    let out = "";
    let name = this.name;

    if (namespace) {
      namespaceManager.registerProp(namespace, this.name);
    }

    if (namespace) {
      name = namespace + "$" + name;
    }

    out += printers.common.jsdoc(this.raw);

    const isDeclare = mod !== "root";
    const exporter = printers.relationships.exporter(this.raw);
    const modifier = exporter
      ? `${isDeclare ? "declare " : ""}${exporter}`
      : "declare ";

    if (this.skip) return out;

    switch (this.raw.kind) {
      case ts.SyntaxKind.FunctionDeclaration:
        out += printers.functions.functionDeclaration(name, this.raw);
        break;
      case ts.SyntaxKind.ClassDeclaration: {
        const classChildren = this.getChildren();
        out += printers.declarations.classDeclaration(
          name,
          this.raw,
          classChildren,
        );
        if (classChildren.length) {
          out += `\n\n${classChildren
            .map(child => {
              return child.print(name, mod);
            })
            .join("\n\n")}`;
        }
        break;
      }
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
            const text = decl.name.text;
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
