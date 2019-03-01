// @flow

import * as ts from "typescript";
import { stripDetailsFromTree } from "./ast";

function updatePos<T: ts.Node>(node: T) {
  node.pos = 1;
  node.end = 2;
  return node;
}

export function importEqualsTransformer(/*opts?: Opts*/) {
  function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      switch (node.kind) {
        case ts.SyntaxKind.ImportEqualsDeclaration: {
          if (
            node.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference
          ) {
            const importClause = ts.createImportClause(
              undefined,
              ts.createNamespaceImport(ts.createIdentifier(node.name.text)),
            );
            const moduleSpecifier = ts.createLiteral(
              node.moduleReference.expression.text,
            );
            const importNode = updatePos(
              ts.createImportDeclaration(
                undefined,
                undefined,
                updatePos(importClause),
                updatePos(moduleSpecifier),
              ),
            );
            return importNode;
          } else if (
            node.moduleReference.kind === ts.SyntaxKind.QualifiedName
          ) {
            const varNode = updatePos(
              ts.createVariableStatement(node.modifiers, [
                ts.createVariableDeclaration(
                  node.name,
                  ts.createTypeQueryNode(node.moduleReference),
                  undefined,
                ),
              ]),
            );
            return varNode;
          }
        }
        default:
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf));
  };
}

export function legacyModules() {
  function visitor(ctx: ts.TransformationContext, sf: ts.SourceFile) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      stripDetailsFromTree(node);
      switch (node.kind) {
        case ts.SyntaxKind.ModuleDeclaration: {
          if (node.name.kind === ts.SyntaxKind.Identifier) {
            node.flags |= ts.NodeFlags.Namespace;
          }
          visitor(node.body);
          return node;
        }
        default:
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx, sf));
  };
}
