/* @flow */

import * as ts from "typescript";
import { uniqBy, flatten } from "lodash";
import Node from "./node";

import namespaceManager from "../namespaceManager";

export default class Namespace extends Node {
  name: string;

  constructor(name: string) {
    super(null);

    this.name = name;
    namespaceManager.register(name);
  }

  addChild(name: string, child: Node<>): void {
    child.namespace = this.name;
    child.isValue = child.getChildren().some(node => {
      return (
        node instanceof Namespace ||
        node.raw.kind === ts.SyntaxKind.VariableStatement ||
        node.raw.kind === ts.SyntaxKind.ClassDeclaration ||
        node.raw.kind === ts.SyntaxKind.FunctionDeclaration ||
        node.raw.kind === ts.SyntaxKind.EnumDeclaration
      );
    });
    namespaceManager.registerProp(this.name, child.name);

    this.children[name] = child;
  }

  addChildren(name: string, child: Node<>): void {
    child.namespace = this.name;
    child.isValue = child
      .getChildren()
      .some(
        node =>
          node instanceof Namespace ||
          node.raw.kind === ts.SyntaxKind.VariableStatement ||
          node.raw.kind === ts.SyntaxKind.ClassDeclaration ||
          node.raw.kind === ts.SyntaxKind.FunctionDeclaration ||
          node.raw.kind === ts.SyntaxKind.EnumDeclaration,
      );
    namespaceManager.registerProp(this.name, child.name);

    if (!this.children[name]) {
      this.children[name] = child;
      return;
    }
    if (this.children[name]) {
      for (const key in child.children) {
        this.children[name].addChildren(key, child.children[key]);
      }
      return;
    }
  }

  print = (namespace: string = "", mod: string = "root"): string => {
    const functions = this.getChildren().filter(
      child =>
        child.raw && child.raw.kind === ts.SyntaxKind.FunctionDeclaration,
    );
    const variables = flatten(
      this.getChildren()
        .filter(
          child =>
            child.raw && child.raw.kind === ts.SyntaxKind.VariableStatement,
        )
        .map(child => child.raw.declarationList.declarations),
    );
    const enums = this.getChildren().filter(
      child => child.raw && child.raw.kind === ts.SyntaxKind.EnumDeclaration,
    );
    const classes = this.getChildren().filter(
      child => child.raw && child.raw.kind === ts.SyntaxKind.ClassDeclaration,
    );
    const namespaces = this.getChildren().filter(child => {
      return child.isValue;
    });
    let name = this.name;
    if (namespace) {
      name = namespace + "$" + this.name;
    }

    const children = `${this.getChildren()
      .map(child => {
        return child.print(name, mod);
      })
      .join("\n\n")}`;

    if (
      functions.length ||
      variables.length ||
      namespaces.length ||
      classes.length ||
      enums.length
    ) {
      let topLevel = "";
      const nsGroup = `
      declare var npm$namespace$${name}: {
        ${uniqBy(functions, child => child.name)
          .map(child => {
            return `${child.name}: typeof ${name}$${child.name},`;
          })
          .join("\n")}
        ${variables
          .map(child => {
            return `${child.name.text}: typeof ${name}$${child.name.text},`;
          })
          .join("\n")}
        ${enums
          .map(child => {
            return `${child.name}: typeof ${name}$${child.name},`;
          })
          .join("\n")}
        ${classes
          .map(child => {
            return `${child.name}: typeof ${name}$${child.name},`;
          })
          .join("\n")}
        ${namespaces
          .map(child => {
            return `${child.name}: typeof npm$namespace$${name}$${child.name},`;
          })
          .join("\n")}
      }\n`;
      if (namespace === "") {
        topLevel = `declare var ${name}: typeof npm$namespace$${name};\n`;
      }

      return topLevel + nsGroup + children;
    }

    return children;
  };
}
