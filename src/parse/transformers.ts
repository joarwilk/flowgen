import * as ts from "typescript";
import { stripDetailsFromTree } from "./ast";
import type { Options } from "../options";

function updatePos<T extends ts.Node>(node: T) {
  // @ts-expect-error todo: modifying "readonly" property
  node.pos = 1;
  // @ts-expect-error todo: modifying "readonly" property
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
            // @ts-expect-error todo(flow->ts)
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
          // @ts-expect-error todo: modifying "readonly" property
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

export function declarationFileTransform(options: Options) {
  function visitor(ctx: ts.TransformationContext) {
    const visitor: ts.Visitor = (node: ts.Node): ts.VisitResult<ts.Node> => {
      if (!options.asModule || !ts.isSourceFile(node)) {
        return node;
      }

      if (
        node.statements.some(statement => ts.isModuleDeclaration(statement))
      ) {
        return node;
      }

      return ctx.factory.updateSourceFile(node, [
        ctx.factory.createModuleDeclaration(
          undefined,
          undefined,
          ctx.factory.createIdentifier(options.asModule),
          ctx.factory.createModuleBlock(
            node.statements.map(statement => {
              if (statement.modifiers) {
                // @ts-expect-error
                statement.modifiers = statement.modifiers.filter(
                  modifier => modifier.kind === ts.SyntaxKind.DeclareKeyword,
                );
              }

              return statement;
            }),
          ),
        ),
      ]);
    };
    return visitor;
  }
  return (ctx: ts.TransformationContext): ts.Transformer<any> => {
    return (sf: ts.SourceFile) => ts.visitNode(sf, visitor(ctx));
  };
}
