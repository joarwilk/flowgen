import type { RawNode } from "../nodes/node";

import * as ts from "typescript";

import Node from "../nodes/node";
import type ModuleNode from "../nodes/module";
import NodeFactory from "../nodes/factory";
import type { Factory } from "../nodes/factory";
import { parseNameFromNode, stripDetailsFromTree } from "./ast";
import * as logger from "../logger";
import { checker } from "../checker";

const collectNode = (node: RawNode, context: Node, factory: Factory): void => {
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
          const globalAugmentation = factory.createModuleNode(
            node,
            node.name.text,
          );
          context.addChild("module" + node.name.text, globalAugmentation);
          traverseNode(node.body, globalAugmentation, factory);
          break;
        }
        const namespace = factory.createNamespaceNode(
          node,
          node.name.text,
          context,
        );

        traverseNode(node.body, namespace, factory);

        context.addChildren("namespace" + node.name.text, namespace);
        break;
      } else {
        const module = factory.createModuleNode(node, node.name.text);

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
const traverseNode = (node, context: Node, factory: Factory): void => {
  if (!node.statements) {
    collectNode(node, context, factory);
  } else {
    node.statements.forEach(n => collectNode(n, context, factory));
  }
};

function findDuplicatedSymbolsAndUsedNames(
  node: ts.Node,
): [ts.Symbol[], string[]] {
  if (ts.isIdentifier(node)) {
    const s = checker.current.getSymbolAtLocation(node);
    if (!s) {
      return [[], []];
    }

    if (ts.isTypeAliasDeclaration(node.parent) && s.declarations.length > 1) {
      return [[s], [s.getName()]];
    } else {
      return [[], [s.getName()]];
    }
  }

  const childResult: [ts.Symbol[], string[]] = [[], []];
  ts.forEachChild(node, child => {
    ts.visitNode(child, (n: ts.Node) => {
      const r = findDuplicatedSymbolsAndUsedNames(n);
      const duplicatedSymbols = r[0];
      const names = r[1];
      childResult[0].push(...duplicatedSymbols);
      childResult[1].push(...names);
      return n;
    });
  });

  return childResult;
}

function generateUniqueName(name: string, usedNames: Set<string>): string {
  if (!usedNames.has(name)) {
    return name;
  }
  let i = 1;
  // Just make sure we won't endup with infinite loop
  while (i < 10_000) {
    const r = `${name}${i}`;
    if (!usedNames.has(r)) {
      return r;
    }
    i++;
  }

  return name;
}

function createMakeNameCompatibleWithFlowTransformer(
  duplicatedSymbols: Set<ts.Symbol>,
  usedNames: Set<string>,
) {
  const renameMap = new Map();

  function makeNameCompatibleWithFlowTransformer(
    context: ts.TransformationContext,
  ) {
    const { factory } = context;
    const visitor = (node: ts.Node): ts.Node | ts.Node[] => {
      if (ts.isTypeAliasDeclaration(node)) {
        const s = checker.current.getSymbolAtLocation(node.name);
        if (duplicatedSymbols.has(s)) {
          const id =
            renameMap.get(s) ??
            factory.createIdentifier(
              generateUniqueName(`${s.getName()}Type`, usedNames),
            );
          renameMap.set(s, id);
          return factory.createTypeAliasDeclaration(
            node.decorators,
            node.modifiers,
            id,
            node.typeParameters,
            node.type,
          );
        }
      }

      if (ts.isTypeReferenceNode(node)) {
        if (ts.isIdentifier(node.typeName)) {
          const s = checker.current.getSymbolAtLocation(node.typeName);
          if (duplicatedSymbols.has(s)) {
            const id =
              renameMap.get(s) ??
              factory.createIdentifier(
                generateUniqueName(`${s.getName()}Type`, usedNames),
              );
            renameMap.set(s, id);
            return factory.createTypeReferenceNode(id.text, node.typeArguments);
          }
        }
      }

      if (!ts.isIdentifier(node)) {
        return ts.visitEachChild(node, visitor, context);
      }

      return node;
    };

    return visitor;
  }

  return makeNameCompatibleWithFlowTransformer;
}

// In TypeScript you can have the same name for a variable and a type but not in FlowJs
function makeNameCompatibleWithFlow(ast: any) {
  const [duplicatedSymbols, usedNames] = findDuplicatedSymbolsAndUsedNames(ast);
  return ts.transform(ast, [
    createMakeNameCompatibleWithFlowTransformer(
      new Set(duplicatedSymbols),
      new Set(usedNames),
    ),
  ]).transformed[0];
}

export function recursiveWalkTree(ast: any): ModuleNode {
  const factory = NodeFactory.create();

  const root = factory.createModuleNode(null, "root");

  traverseNode(makeNameCompatibleWithFlow(ast), root, factory);

  return root;
}
