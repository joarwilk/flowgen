import * as ts from "typescript";
import { orderBy, uniqBy, flatten } from "lodash";
import PropertyNode from "./property";
import Node from "./node";

import namespaceManager from "../namespace-manager";
import * as printers from "../printers";

export default class Namespace extends Node {
  name: string;
  functions: Array<PropertyNode>;
  property: PropertyNode | undefined;

  constructor(
    name: string,
    functions?: Array<PropertyNode>,
    property?: PropertyNode,
  ) {
    super(null);

    this.name = name;
    this.functions = functions || [];
    this.property = property;

    namespaceManager.register(name);
  }

  addChild(name: string, child: Node): void {
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

  addChildren(name: string, child: Node): void {
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

  print = (namespace = "", mod = "root", depth?: number): string => {
    const children = uniqBy(
      orderBy(this.getChildren(), [a => a.isValue], ["desc"]),
      // @ts-expect-error todo(flow->ts)
      child => child.name.text || child.name,
    );
    const functions = children.filter(
      child =>
        child.raw && child.raw.kind === ts.SyntaxKind.FunctionDeclaration,
    );
    const variables = flatten(
      children
        .filter(
          child =>
            child.raw && child.raw.kind === ts.SyntaxKind.VariableStatement,
        )
        .map(child => child.raw.declarationList.declarations),
    );
    const enums = children.filter(
      child => child.raw && child.raw.kind === ts.SyntaxKind.EnumDeclaration,
    );
    // Interfaces with type parameters are not expressible inside namespaces.
    const interfaces = children.filter(
      child =>
        child.raw &&
        child.raw.kind === ts.SyntaxKind.InterfaceDeclaration &&
        !(child.raw.typeParameters && child.raw.typeParameters.length),
    );
    const classes = children.filter(
      child => child.raw && child.raw.kind === ts.SyntaxKind.ClassDeclaration,
    );
    const namespaces = children.filter(child => {
      return child.isValue;
    });
    let name = this.name;
    if (namespace) {
      name = namespace + "$" + this.name;
    }

    const childrenNode = `${this.getChildren()
      .map(child => {
        return child.print(name, mod, depth);
      })
      .join("\n\n")}`;

    if (
      this.functions.length ||
      functions.length ||
      variables.length ||
      namespaces.length ||
      classes.length ||
      enums.length
    ) {
      let topLevel = "";
      const nsGroup = `
      declare var npm$namespace$${name}: {|
        ${this.functions
          .map(
            propNode =>
              `${printers.functions.functionType(propNode.raw, true)},`,
          )
          .join("\n")}
        ${functions
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
        ${interfaces
          .map(child => {
            return `${child.name}: Class<${name}$${child.name}>,`;
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
      |}\n`;
      if (namespace === "") {
        topLevel = `declare var ${name}: typeof npm$namespace$${name};\n`;
      }

      return topLevel + nsGroup + childrenNode;
    }

    return childrenNode;
  };
}
