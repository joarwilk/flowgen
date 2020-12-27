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

    if (
      child instanceof Namespace &&
      this.children[child.name] &&
      this.children[child.name].raw &&
      this.children[child.name].raw.kind === ts.SyntaxKind.ClassDeclaration
    ) {
      name = child.name;
    }
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
    let name = this.name;
    if (namespace) {
      name = namespace + "$" + this.name;
    }

    const childrenDeclarations = this.functions
      .map(propNode => printers.functions.functionType(propNode.raw, true))
      .concat(Namespace.formatChildren(children, name));

    const childrenNode = `${this.getChildren()
      .map(child => {
        return child.print(name, mod, depth);
      })
      .join("\n\n")}`;

    if (childrenDeclarations.length > 0) {
      let topLevel = "";
      const nsGroup = `
      declare var npm$namespace$${name}: {|
        ${childrenDeclarations.map(declaration => `${declaration},`).join("\n")}
      |}\n`;
      if (namespace === "") {
        topLevel = `declare var ${name}: typeof npm$namespace$${name};\n`;
      }

      return topLevel + nsGroup + childrenNode;
    }

    return childrenNode;
  };

  static formatChildren(
    children: ReadonlyArray<Node>,
    childrenNamespace: string,
  ): string[] {
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

    return [].concat(
      functions.map(child => {
        return `${child.name}: typeof ${childrenNamespace}$${child.name}`;
      }),
      variables.map(child => {
        return `${child.name.text}: typeof ${childrenNamespace}$${child.name.text}`;
      }),
      enums.map(child => {
        return `${child.name}: typeof ${childrenNamespace}$${child.name}`;
      }),
      interfaces.map(child => {
        return `${child.name}: Class<${childrenNamespace}$${child.name}>`;
      }),
      classes.map(child => {
        return `${child.name}: typeof ${childrenNamespace}$${child.name}`;
      }),
      namespaces.map(child => {
        return `${child.name}: typeof npm$namespace$${childrenNamespace}$${child.name}`;
      }),
    );
  }
}
