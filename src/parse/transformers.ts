import * as ts from "typescript";
import { stripDetailsFromTree } from "./ast";

function updatePos<T extends ts.Node>(node: T) {
  node.pos = 1;
  node.end = 2;
  return node;
}

export function importEqualsTransformer /*opts?: Opts*/() {
  function visitor(ctx: ts.TransformationContext) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (ts.isImportEqualsDeclaration(node)) {
        if (
          node.moduleReference.kind === ts.SyntaxKind.ExternalModuleReference
        ) {
          const importClause = ts.createImportClause(
            undefined,
            ts.createNamespaceImport(ts.createIdentifier(node.name.text)),
          );
          const moduleSpecifier = ts.createLiteral(
            // @ts-ignore todo(flow->ts)
            node.moduleReference.expression.text,
          );
          const importNode = updatePos(
            //$todo Flow has problems when switching variables instead of literals
            ts.createImportDeclaration(
              undefined,
              undefined,
              //$todo Flow has problems when switching variables instead of literals
              updatePos(importClause),
              //$todo Flow has problems when switching variables instead of literals
              updatePos(moduleSpecifier),
            ),
          );
          return importNode;
        } else if (node.moduleReference.kind === ts.SyntaxKind.QualifiedName) {
          const varNode = updatePos(
            //$todo Flow has problems when switching variables instead of literals
            ts.createVariableStatement(node.modifiers, [
              ts.createVariableDeclaration(
                node.name,
                //$todo Flow has problems when switching variables instead of literals
                ts.createTypeQueryNode(node.moduleReference),
                undefined,
              ),
            ]),
          );
          return varNode;
        }
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx));
  };
}

export function legacyModules() {
  function visitor(ctx: ts.TransformationContext) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      stripDetailsFromTree(node);
      if (ts.isModuleDeclaration(node)) {
        if (node.name.kind === ts.SyntaxKind.Identifier) {
          node.flags |= ts.NodeFlags.Namespace;
        }
        visitor(node.body);
        return node;
      }
      return ts.visitEachChild(node, visitor, ctx);
    };
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx));
  };
}
