/* @flow */
import type { RawNode } from "../nodes/node";

import * as ts from "typescript";

import Node from "../nodes/node";
import type ModuleNode from "../nodes/module";
import NodeFactory, { type Factory } from "../nodes/factory";
import namespaceManager from "../namespace-manager";
import { parseNameFromNode, stripDetailsFromTree } from "./ast";
import * as logger from "../logger";

const collectNode = (
  node: RawNode,
  context: Node<>,
  factory: Factory,
): void => {
  stripDetailsFromTree(node);
  switch (node.kind) {
    case ts.SyntaxKind.ModuleDeclaration:
      if (
        node.flags === 4098 ||
        (node.flags & ts.NodeFlags.Namespace) === ts.NodeFlags.Namespace
      ) {
        if (
          (node.flags & ts.NodeFlags.GlobalAugmentation) ===
          ts.NodeFlags.GlobalAugmentation
        ) {
          logger.error(node, { type: "UnsupportedGlobalAugmentation" });
          const globalAugmentation = factory.createModuleNode(node.name.text);
          context.addChild("module" + node.name.text, globalAugmentation);
          traverseNode(node.body, globalAugmentation, factory);
          break;
        }
        const namespace = factory.createNamespaceNode(
          node,
          node.name.text,
          context,
        );

        namespaceManager.setContext(node.name.text);

        traverseNode(node.body, namespace, factory);

        context.addChildren("namespace" + node.name.text, namespace);
        break;
      } else {
        const module = factory.createModuleNode(node.name.text);

        context.addChild("module" + node.name.text, module);

        traverseNode(node.body, module, factory);
        break;
      }

    case ts.SyntaxKind.FunctionDeclaration:
      // TODO: rewrite this
      factory.createFunctionDeclaration(node, parseNameFromNode(node), context);
      break;

    case ts.SyntaxKind.InterfaceDeclaration:
      context.addChild(
        parseNameFromNode(node),
        factory.createPropertyNode(node, parseNameFromNode(node), context),
      );
      break;

    case ts.SyntaxKind.TypeAliasDeclaration:
      context.addChild(
        parseNameFromNode(node),
        factory.createPropertyNode(node, parseNameFromNode(node), context),
      );
      break;

    case ts.SyntaxKind.ClassDeclaration:
      context.addChild(
        parseNameFromNode(node),
        factory.createPropertyNode(node),
      );
      break;

    case ts.SyntaxKind.VariableStatement:
      context.addChild(
        parseNameFromNode(node),
        factory.createPropertyNode(node),
      );
      break;

    case ts.SyntaxKind.ExportAssignment:
      context.addChild(
        "exportassign" + parseNameFromNode(node),
        factory.createExportNode(node),
      );
      break;

    case ts.SyntaxKind.ImportDeclaration:
      context.addChild(parseNameFromNode(node), factory.createImportNode(node));
      break;

    case ts.SyntaxKind.ExportDeclaration:
      context.addChild(
        "exportdecl" + parseNameFromNode(node),
        factory.createExportDeclarationNode(node),
      );
      break;

    case ts.SyntaxKind.ImportEqualsDeclaration:
      // see transformers
      break;

    case ts.SyntaxKind.NamespaceExportDeclaration:
      // TODO: unimplemented;
      break;

    case ts.SyntaxKind.EnumDeclaration:
      context.addChild(
        parseNameFromNode(node),
        factory.createPropertyNode(node),
      );
      break;

    case ts.SyntaxKind.EmptyStatement:
      // This should be empty
      break;

    default:
      console.log("Missing node parse", ts.SyntaxKind[node.kind]);
  }
};

// Walk the AST and extract all the definitions we care about
const traverseNode = (node, context: Node<>, factory: Factory): void => {
  if (!node.statements) {
    collectNode(node, context, factory);
  } else {
    node.statements.forEach(n => collectNode(n, context, factory));
  }
};

export function recursiveWalkTree(ast: any): ModuleNode {
  const factory = NodeFactory.create();

  const root = factory.createModuleNode("root");

  traverseNode(ast, root, factory);

  return root;
}
