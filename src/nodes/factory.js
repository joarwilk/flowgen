/* @flow */
import type { RawNode } from "./node";

import type Node from "./node";
import ImportNode from "./import";
import ExportNode from "./export";
import ExportDeclarationNode from "./export-declaration";
import ModuleNode from "./module";
import PropertyNode from "./property";
import NamespaceNode from "./namespace";

import { getMembersFromNode } from "../parse/ast";
import { checker } from "../checker";
import { getFullyQualifiedName } from "../printers/node";

export class Factory {
  _modules: { [key: string]: ModuleNode };
  _propDeclarations: { [key: string]: PropertyNode };
  _functionDeclarations: { [key: string]: Array<PropertyNode> };

  constructor() {
    //$todo
    this._modules = Object.create(null);
    //$todo
    this._propDeclarations = Object.create(null);
    //$todo
    this._functionDeclarations = Object.create(null);
  }

  // If multiple declarations are found for the same module name
  // return the memoized instance of the module instead
  createModuleNode(node: RawNode, name: string): ModuleNode {
    if (Object.keys(this._modules).includes(name)) {
      return this._modules[name];
    }

    const module = new ModuleNode(node, name);

    this._modules[name] = module;

    return module;
  }

  createFunctionDeclaration(
    node: RawNode,
    rawName: string,
    context: Node<>,
  ): void {
    let name = rawName;
    const propNode = new PropertyNode(node);

    if (context instanceof ModuleNode) {
      name = context.name + "$" + rawName;
    }
    if (context instanceof NamespaceNode && checker.current) {
      const symbol = checker.current.getSymbolAtLocation(node.name);
      name = getFullyQualifiedName(symbol, node, false);
    }

    if (!this._functionDeclarations[name]) {
      this._functionDeclarations[name] = [propNode];
    } else if (Object.keys(this._functionDeclarations).includes(name)) {
      this._functionDeclarations[name].push(propNode);
    }

    context.addChild(name + this._functionDeclarations[name].length, propNode);
  }

  // Some definition files (like lodash) declare the same
  // interface/type/function multiple times as a way of overloading.
  // Flow does not support that, and this is where we handle that
  createPropertyNode(
    node: RawNode,
    name?: string,
    context?: Node<>,
  ): PropertyNode {
    if (typeof name === "undefined") {
      return new PropertyNode(node);
    }

    if (context instanceof ModuleNode) {
      name = context.name + "$" + name;
    }
    if (context instanceof NamespaceNode && checker.current) {
      const symbol = checker.current.getSymbolAtLocation(node.name);
      name = getFullyQualifiedName(symbol, node, false);
    }

    if (Object.keys(this._propDeclarations).includes(name)) {
      this._propDeclarations[name].maybeAddMember(getMembersFromNode(node));

      return this._propDeclarations[name];
    }

    const propNode = new PropertyNode(node);
    this._propDeclarations[name] = propNode;
    return propNode;
  }

  createNamespaceNode = (
    node: RawNode,
    name: string,
    context: Node<>,
  ): NamespaceNode => {
    let contextName;
    if (context instanceof ModuleNode) {
      contextName = context.name + "$" + name;
    }
    if (context instanceof NamespaceNode && checker.current) {
      const symbol = checker.current.getSymbolAtLocation(node.name);
      contextName = getFullyQualifiedName(symbol, node, false);
    }
    if (typeof contextName !== "undefined") {
      if (this._functionDeclarations[contextName]) {
        for (const prop of this._functionDeclarations[contextName])
          prop.skipNode();
      }
      if (this._propDeclarations[contextName]) {
        this._propDeclarations[contextName].skipNode();
      }
      return new NamespaceNode(
        name,
        this._functionDeclarations[contextName],
        this._propDeclarations[contextName],
      );
    } else {
      return new NamespaceNode(name);
    }
  };
  createImportNode = (node: RawNode): ImportNode => new ImportNode(node);
  createExportNode = (node: RawNode): ExportNode => new ExportNode(node);
  createExportDeclarationNode = (node: RawNode): ExportDeclarationNode =>
    new ExportDeclarationNode(node);
}

export default {
  create: (): Factory => new Factory(),
};
