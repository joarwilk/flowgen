import * as ts from "typescript";
import util from "util";
import * as printers from "./index";

import { checker } from "../checker";
import * as logger from "../logger";
import { withEnv } from "../env";
import { renames, getLeftMostEntityName } from "./smart-identifiers";
import { printErrorMessage } from "../errors/error-message";

type KeywordNode =
  | {
      kind: typeof ts.SyntaxKind.AnyKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.UnknownKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.NumberKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.BigIntKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.ObjectKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.BooleanKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.StringKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.SymbolKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.VoidKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.UndefinedKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.NullKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.NeverKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.FalseKeyword;
    }
  | {
      kind: typeof ts.SyntaxKind.TrueKeyword;
    };

type PrintNode =
  | KeywordNode
  | {
      kind: typeof ts.SyntaxKind.FirstLiteralToken;
    }
  | ts.CallSignatureDeclaration
  | ts.ConstructorDeclaration
  | ts.TypeParameterDeclaration
  | ts.VariableDeclaration
  | ts.PropertyDeclaration
  | ts.ConstructSignatureDeclaration
  | ts.MethodDeclaration
  | ts.IndexSignatureDeclaration
  | ts.ConditionalTypeNode
  | ts.TypePredicateNode
  | ts.TypeOperatorNode
  | ts.TypeLiteralNode
  | ts.FunctionTypeNode
  | ts.LiteralTypeNode
  | ts.IndexedAccessTypeNode
  | ts.MappedTypeNode
  | ts.ArrayTypeNode
  | ts.TupleTypeNode
  | ts.ParenthesizedTypeNode
  | ts.UnionOrIntersectionTypeNode
  | ts.ImportTypeNode
  | ts.TypeQueryNode
  | ts.ConstructorTypeNode
  | ts.ThisTypeNode
  | ts.StringLiteral
  | ts.PrefixUnaryExpression
  | ts.PropertyAccessExpression
  | ts.Identifier
  | ts.BindingElement
  | ts.ExportSpecifier
  | ts.ImportSpecifier
  | ts.QualifiedName
  | ts.TypeReferenceType
  | ts.PropertySignature
  | ts.MethodSignature
  | ts.JSDocAllType
  | ts.JSDocUnknownType
  | ts.JSDocOptionalType
  | ts.JSDocFunctionType
  | ts.JSDocTypeLiteral
  | ts.JSDocVariadicType
  | ts.JSDocNonNullableType
  | ts.JSDocNullableType
  | ts.ComputedPropertyName
  | ts.OptionalTypeNode
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration;

export function printEntityName(type: ts.EntityName): string {
  if (type.kind === ts.SyntaxKind.QualifiedName) {
    return (
      printers.relationships.namespace(
        type.left.kind === ts.SyntaxKind.Identifier
          ? type.left.text
          : printEntityName(type.left),
      ) + printEntityName(type.right)
    );
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return printers.relationships.namespace(type.text, true);
  } else {
    return "";
  }
}

export function printPropertyAccessExpression(
  type: ts.PropertyAccessExpression | ts.Identifier | ts.PrivateIdentifier,
): string {
  if (type.kind === ts.SyntaxKind.PropertyAccessExpression) {
    return (
      printers.relationships.namespace(
        ts.isIdentifier(type.expression)
          ? type.expression.text
          : // @ts-expect-error todo(flow->ts)
            printPropertyAccessExpression(type.expression),
      ) + printPropertyAccessExpression(type.name)
    );
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return printers.relationships.namespace(
      printers.identifiers.print(type.text),
      true,
    );
  } else {
    return "";
  }
}

export function getLeftMostPropertyAccessExpression(
  type: ts.PropertyAccessExpression | ts.Identifier,
) {
  if (type.kind === ts.SyntaxKind.PropertyAccessExpression) {
    return ts.isIdentifier(type.expression)
      ? type.expression
      : // @ts-expect-error todo(flow->ts)
        getLeftMostPropertyAccessExpression(type.expression);
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return type;
  }
}

export function getFullyQualifiedPropertyAccessExpression(
  symbol: ts.Symbol | undefined,
  type: any,
  delimiter = "$",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    let isExternalSymbol = false;
    const leftMost = getLeftMostPropertyAccessExpression(type);
    if (leftMost) {
      //$todo Flow has problems when switching variables instead of literals
      const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
      // todo(flow->ts)
      const decl: any = leftMostSymbol ? leftMostSymbol.declarations[0] : {};
      isExternalSymbol =
        decl.kind === ts.SyntaxKind.NamespaceImport ||
        decl.kind === ts.SyntaxKind.NamedImports;
    }
    if (!symbol || typeChecker.isUnknownSymbol(symbol) || isExternalSymbol) {
      return printPropertyAccessExpression(type);
    }
    if (
      symbol.parent?.valueDeclaration?.kind === ts.SyntaxKind.SourceFile ||
      (symbol.parent?.valueDeclaration?.kind ===
        ts.SyntaxKind.ModuleDeclaration &&
        (symbol.parent?.valueDeclaration.flags & ts.NodeFlags.Namespace) === 0)
    ) {
      return typeChecker.symbolToString(symbol);
    }
    // if (
    //   (symbol.flags & ts.SymbolFlags.ValueModule) ===
    //   ts.SymbolFlags.ValueModule
    // ) {
    //   return typeChecker.symbolToString(
    //     symbol,
    //     undefined,
    //     /*meaning*/ undefined,
    //     ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
    //       ts.SymbolFormatFlags.AllowAnyNodeKind,
    //   );
    // }
    return symbol.parent
      ? getFullyQualifiedPropertyAccessExpression(
          symbol.parent,
          type,
          delimiter,
        ) +
          delimiter +
          typeChecker.symbolToString(symbol)
      : typeChecker.symbolToString(
          symbol,
          undefined,
          /*meaning*/ undefined,
          //$todo Some problem about TypeScript enums conversion and bitwise operators
          ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
            ts.SymbolFormatFlags.AllowAnyNodeKind,
        );
  } else {
    return printPropertyAccessExpression(type);
  }
}

export function getFullyQualifiedName(
  symbol: ts.Symbol | undefined,
  type: any,
  checks = true,
  delimiter = "$",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    if (checks) {
      let isExternalSymbol = false;
      const leftMost = getLeftMostEntityName(type);
      if (leftMost) {
        //$todo Flow has problems when switching variables instead of literals
        const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
        const decl: any =
          leftMostSymbol && leftMostSymbol.declarations.length
            ? leftMostSymbol.declarations[0]
            : {};
        isExternalSymbol =
          decl.kind === ts.SyntaxKind.NamespaceImport ||
          decl.kind === ts.SyntaxKind.NamedImports ||
          decl.kind === ts.SyntaxKind.TypeParameter ||
          leftMostSymbol?.parent?.escapedName === "__global";
      }
      if (!symbol || typeChecker.isUnknownSymbol(symbol) || isExternalSymbol) {
        return printEntityName(type);
      }
    }
    if (
      symbol.parent?.valueDeclaration?.kind === ts.SyntaxKind.SourceFile ||
      (symbol.parent?.valueDeclaration?.kind ===
        ts.SyntaxKind.ModuleDeclaration &&
        (symbol.parent?.valueDeclaration.flags & ts.NodeFlags.Namespace) === 0)
    ) {
      return typeChecker.symbolToString(symbol);
    }
    // if (
    //   (symbol.flags & ts.SymbolFlags.ValueModule) ===
    //   ts.SymbolFlags.ValueModule
    // ) {
    //   return typeChecker.symbolToString(
    //     symbol,
    //     undefined,
    //     /*meaning*/ undefined,
    //     ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
    //       ts.SymbolFormatFlags.AllowAnyNodeKind,
    //   );
    // }
    if (symbol.valueDeclaration?.kind === ts.SyntaxKind.EnumMember)
      delimiter = ".";
    return symbol.parent
      ? getFullyQualifiedName(symbol.parent, type, true, delimiter) +
          delimiter +
          typeChecker.symbolToString(symbol)
      : typeChecker.symbolToString(
          symbol,
          undefined,
          /*meaning*/ undefined,
          //$todo Some problem about TypeScript enums conversion and bitwise operators
          ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
            ts.SymbolFormatFlags.AllowAnyNodeKind,
        );
  } else {
    return printEntityName(type);
  }
}

export function getTypeofFullyQualifiedName(
  symbol: ts.Symbol | undefined,
  type: any,
  delimiter = ".",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    let isExternalSymbol = false;
    const leftMost = getLeftMostEntityName(type);
    if (leftMost) {
      //$todo Flow has problems when switching variables instead of literals
      const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
      // todo(flow->ts)
      const decl: any = leftMostSymbol ? leftMostSymbol.declarations[0] : {};
      isExternalSymbol =
        decl.kind === ts.SyntaxKind.NamespaceImport ||
        decl.kind === ts.SyntaxKind.NamedImports;
    }
    if (!symbol || typeChecker.isUnknownSymbol(symbol) || isExternalSymbol) {
      return printEntityName(type);
    }
    if (
      symbol.parent?.valueDeclaration?.kind === ts.SyntaxKind.SourceFile ||
      (symbol.parent?.valueDeclaration?.kind ===
        ts.SyntaxKind.ModuleDeclaration &&
        (symbol.parent?.valueDeclaration.flags & ts.NodeFlags.Namespace) === 0)
    ) {
      return typeChecker.symbolToString(symbol);
    }
    if (symbol.parent?.escapedName === "__type") {
      return symbol.parent
        ? getTypeofFullyQualifiedName(
            // @ts-expect-error todo(flow->ts)
            symbol.parent.declarations[0].parent.symbol,
            type,
          ) +
            delimiter +
            typeChecker.symbolToString(symbol)
        : typeChecker.symbolToString(
            symbol,
            undefined,
            /*meaning*/ undefined,
            //$todo Some problem about TypeScript enums conversion and bitwise operators
            ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
              ts.SymbolFormatFlags.AllowAnyNodeKind,
          );
    } else {
      let delimiter = "$";
      if (symbol.valueDeclaration?.kind === ts.SyntaxKind.EnumMember) {
        delimiter = ".";
      }
      return symbol.parent
        ? getTypeofFullyQualifiedName(symbol.parent, type, delimiter) +
            delimiter +
            typeChecker.symbolToString(symbol)
        : typeChecker.symbolToString(
            symbol,
            undefined,
            /*meaning*/ undefined,
            //$todo Some problem about TypeScript enums conversion and bitwise operators
            ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
              ts.SymbolFormatFlags.AllowAnyNodeKind,
          );
    }
  } else {
    return printEntityName(type);
  }
}

export function fixDefaultTypeArguments(
  symbol: ts.Symbol | undefined,
  type: any,
): void {
  if (!symbol) return;
  if (!symbol.declarations) return;
  const decl = symbol.declarations[0];
  const allTypeParametersHaveDefaults =
    // @ts-expect-error todo(flow->ts)
    !!decl?.typeParameters?.length &&
    // @ts-expect-error todo(flow->ts)
    decl.typeParameters.every(param => !!param.default);
  if (allTypeParametersHaveDefaults && !type.typeArguments) {
    type.typeArguments = [];
  }
}

export const printType = withEnv<any, [any], string>(
  (env: any, rawType: any): string => {
    // debuggerif()
    //TODO: #6 No match found in SyntaxKind enum

    const type: PrintNode = rawType;

    const keywordPrefix: string =
      // @ts-expect-error todo(flow->ts)
      type.modifiers &&
      // @ts-expect-error todo(flow->ts)
      type.modifiers.some(
        modifier => modifier.kind === ts.SyntaxKind.StaticKeyword,
      )
        ? "static "
        : "";

    const kind = ts.SyntaxKind[type.kind].toString();
    switch (type.kind) {
      case ts.SyntaxKind.VoidKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.StringKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.AnyKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.NumberKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.BooleanKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.NullKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.UndefinedKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.ObjectKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.FalseKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.TrueKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.NeverKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.UnknownKeyword:
        return printers.basics.print(kind);
      case ts.SyntaxKind.SymbolKeyword:
        // TODO: What to print here?
        return "Symbol";
      case ts.SyntaxKind.BigIntKeyword:
        logger.error(type, { type: "UnsupportedBigInt" });
        // TODO: What to print here?
        return "number";

      // JSDoc types
      case ts.SyntaxKind.JSDocAllType:
        return "*";
      case ts.SyntaxKind.JSDocUnknownType:
        return "?";
      case ts.SyntaxKind.JSDocOptionalType:
        return printType(type.type) + "=";
      case ts.SyntaxKind.JSDocFunctionType: {
        const params = type.parameters
          .map(param => printType(param.type))
          .join(", ");
        const ret = type.type ? `: ${printType(type.type)}` : "";
        return `function(${params})${ret}`;
      }
      case ts.SyntaxKind.JSDocTypeLiteral:
        return "object";
      case ts.SyntaxKind.JSDocVariadicType:
        return "..." + printType(type.type);
      case ts.SyntaxKind.JSDocNonNullableType:
        return "!" + printType(type.type);
      case ts.SyntaxKind.JSDocNullableType:
        return "?" + printType(type.type);

      case ts.SyntaxKind.ConditionalType: {
        const error = { type: "UnsupportedConditionalType" as const };
        logger.error(type, error);
        if (env && env.tsdoc) {
          return `any`;
        }
        return `/* ${printErrorMessage(error)} */ any`;
      }

      case ts.SyntaxKind.ComputedPropertyName: {
        if (
          // @ts-expect-error todo(flow->ts)
          type.expression?.expression?.text === "Symbol" &&
          // @ts-expect-error todo(flow->ts)
          type.expression?.name?.text === "iterator"
        ) {
          return "@@iterator";
        }
        if (
          // @ts-expect-error todo(flow->ts)
          type.expression?.expression?.text === "Symbol" &&
          // @ts-expect-error todo(flow->ts)
          type.expression?.name?.text === "asyncIterator"
        ) {
          return "@@asyncIterator";
        }
        if (type.expression.kind === ts.SyntaxKind.StringLiteral) {
          return printType(type.expression);
        }
        logger.error(type.expression, { type: "UnsupportedComputedProperty" });
        return `[typeof ${printType(type.expression)}]`;
      }

      case ts.SyntaxKind.FunctionType:
        //case SyntaxKind.FunctionTypeAnnotation:
        return printers.functions.functionType(type);

      case ts.SyntaxKind.TypeLiteral:
        return printers.declarations.interfaceType(type, "", [], false, true);

      //case SyntaxKind.IdentifierObject:
      //case SyntaxKind.StringLiteralType:
      case ts.SyntaxKind.Identifier: {
        return printers.relationships.namespace(
          printers.identifiers.print(type.text),
          true,
        );
      }

      case ts.SyntaxKind.BindingElement:
        // @ts-expect-error todo(flow->ts)
        return printers.common.typeParameter(type);
      case ts.SyntaxKind.TypeParameter:
        // @ts-expect-error todo(flow->ts)
        return printers.common.typeParameter(type);

      case ts.SyntaxKind.PrefixUnaryExpression:
        switch (type.operator) {
          case ts.SyntaxKind.MinusToken:
            // @ts-expect-error todo(flow->ts)
            return `-${type.operand.text}`;
          default:
            console.log('"NO PRINT IMPLEMENTED: PrefixUnaryExpression"');
            return '"NO PRINT IMPLEMENTED: PrefixUnaryExpression"';
        }

      case ts.SyntaxKind.TypePredicate:
        //TODO: replace with boolean %checks when supported in class declarations
        return "boolean";

      case ts.SyntaxKind.IndexedAccessType: {
        let fn = "$ElementType";
        if (
          ts.isLiteralTypeNode(type.indexType) &&
          type.indexType.literal.kind === ts.SyntaxKind.StringLiteral
        ) {
          fn = "$PropertyType";
        }
        return `${fn}<${printType(type.objectType)}, ${printType(
          type.indexType,
        )}>`;
      }

      case ts.SyntaxKind.TypeOperator:
        switch (type.operator) {
          case ts.SyntaxKind.KeyOfKeyword:
            return `$Keys<${printType(type.type)}>`;
          case ts.SyntaxKind.UniqueKeyword:
            logger.error(type, { type: "UnsupportedUniqueSymbol" });
            return printType(type.type);
          case ts.SyntaxKind.ReadonlyKeyword:
            if (ts.isArrayTypeNode(type.type)) {
              return `$ReadOnlyArray<${printType(type.type.elementType)}>`;
            } else if (type.type.kind === ts.SyntaxKind.TupleType) {
              return printType(type.type);
            } else {
              const error = {
                type: "UnsupportedTypeOperator" as const,
                operator: type.operator,
              };
              logger.error(type, error);
              return `/* ${printErrorMessage(error)} */ any`;
            }
          default: {
            const error = {
              type: "UnsupportedTypeOperator" as const,
              // @ts-expect-error
              operator: type.operator,
            };
            logger.error(type, error);
            return `/* ${printErrorMessage(error)} */ any`;
          }
        }

      case ts.SyntaxKind.MappedType: {
        const constraint = type.typeParameter.constraint;
        const typeName = printType(type.typeParameter.name);
        const value = printType(type.type);
        let source = `{[k: ${printType(constraint)}]: any}`;
        // @ts-expect-error todo(flow->ts)
        if (constraint.operator === ts.SyntaxKind.KeyOfKeyword) {
          // @ts-expect-error todo(flow->ts)
          source = printType(constraint.type);
        }
        return `$ObjMapi<${source}, <${typeName}>(${typeName}) => ${value}>`;
      }

      case ts.SyntaxKind.FirstLiteralToken:
        // @ts-expect-error todo(flow->ts)
        return type.text;

      case ts.SyntaxKind.ImportType:
        // @ts-expect-error todo(flow->ts)
        if (type.qualifier?.escapedText) {
          return `$PropertyType<$Exports<${printType(
            type.argument,
            // @ts-expect-error todo(flow->ts)
          )}>, ${JSON.stringify(type.qualifier.escapedText)}>`;
        }
        return `$Exports<${printType(type.argument)}>`;

      case ts.SyntaxKind.FirstTypeNode:
        return printers.common.literalType(type);
      case ts.SyntaxKind.LastTypeNode:
        return printers.common.literalType(type);
      case ts.SyntaxKind.LiteralType:
        return printers.common.literalType(type);

      case ts.SyntaxKind.QualifiedName: {
        let symbol;
        if (checker.current) {
          //$todo
          symbol = checker.current.getSymbolAtLocation(type);
        }
        return getFullyQualifiedName(symbol, type);
      }

      case ts.SyntaxKind.StringLiteral:
        return JSON.stringify(type.text);

      case ts.SyntaxKind.TypeReference: {
        let symbol;
        if (checker.current) {
          //$todo
          symbol = checker.current.getSymbolAtLocation(type.typeName);
          fixDefaultTypeArguments(symbol, type);
          const isRenamed = renames(symbol, type);
          if (
            symbol &&
            symbol.declarations &&
            symbol.declarations[0].kind === ts.SyntaxKind.EnumMember
          ) {
            return `typeof ${getTypeofFullyQualifiedName(
              symbol,
              type.typeName,
            )}`;
          } else if (
            symbol &&
            symbol.declarations &&
            symbol.declarations[0].kind === ts.SyntaxKind.EnumDeclaration
          ) {
            return `$Values<typeof ${getTypeofFullyQualifiedName(
              symbol,
              type.typeName,
            )}>`;
          }
          if (!isRenamed) {
            //$todo weird union errors
            // @ts-expect-error todo(flow->ts)
            type.typeName.escapedText = getFullyQualifiedName(
              symbol,
              type.typeName,
            );
          }
        }
        return printers.declarations.typeReference(type, !symbol);
      }

      case ts.SyntaxKind.VariableDeclaration:
        return printers.declarations.propertyDeclaration(
          type,
          keywordPrefix,
          true,
        );
      case ts.SyntaxKind.PropertyDeclaration:
        return printers.declarations.propertyDeclaration(type, keywordPrefix);

      //$todo some weird union errors
      case ts.SyntaxKind.OptionalType:
        return `${printType(type.type)} | void`;
      case ts.SyntaxKind.TupleType: {
        const lastElement = type.elements[type.elements.length - 1];
        if (lastElement && ts.isRestTypeNode(lastElement))
          // @ts-expect-error todo(flow->ts)
          type.elements.pop();
        let tuple = `[${type.elements.map(printType).join(", ")}]`;
        if (lastElement && ts.isRestTypeNode(lastElement)) {
          tuple += ` & ${printType(lastElement.type)}`;
        }
        return tuple;
      }

      case ts.SyntaxKind.MethodSignature:
        return printers.common.methodSignature(type);

      case ts.SyntaxKind.ExpressionWithTypeArguments:
        return (
          printType(type.expression) +
          printers.common.generics(type.typeArguments)
        );

      case ts.SyntaxKind.PropertyAccessExpression:
        return getFullyQualifiedPropertyAccessExpression(
          //$todo some weird union errors
          checker.current.getSymbolAtLocation(type),
          type,
        );

      // case SyntaxKind.NodeObject:
      //   return (
      //     printers.relationships.namespace(type.expression.text) +
      //     printType(type.name)
      //   );

      case ts.SyntaxKind.PropertySignature:
        return printers.common.parameter(type);

      case ts.SyntaxKind.CallSignature: {
        // TODO: rewrite to printers.functions.functionType
        const generics = printers.common.generics(type.typeParameters, node => {
          node.withoutDefault = true;
          return node;
        });
        const str = `${generics}(${type.parameters
          // @ts-expect-error todo(flow->ts)
          .filter(param => param.name.text !== "this")
          .map(printers.common.parameter)
          .join(", ")})`;
        // TODO: I can't understand this
        return type.type ? `${str}: ${printType(type.type)}` : `${str}: any`;
      }

      case ts.SyntaxKind.UnionType: {
        const join = type.types.length >= 5 ? "\n" : " ";
        // debugger
        return type.types.map(printType).join(`${join}| `);
      }

      case ts.SyntaxKind.ArrayType:
        return printType(type.elementType) + "[]";

      case ts.SyntaxKind.ThisType:
        return "this";

      case ts.SyntaxKind.IndexSignature:
        if (type.type) {
          return `[${type.parameters
            .map(printers.common.parameter)
            .join(", ")}]: ${printType(type.type)}`;
        }
        return "";

      case ts.SyntaxKind.IntersectionType:
        return type.types.map(printType).join(" & ");

      case ts.SyntaxKind.MethodDeclaration:
        // Skip methods marked as private
        if (
          type.modifiers &&
          type.modifiers.some(
            modifier => modifier.kind === ts.SyntaxKind.PrivateKeyword,
          )
        ) {
          return "";
        }

        return keywordPrefix + printers.common.methodSignature(type);

      case ts.SyntaxKind.ConstructorType:
        // Not implemented. The return is just a guess.
        return (
          "(" +
          type.parameters.map(printers.common.parameter).join(", ") +
          ") => " +
          printType(type.type)
        );

      case ts.SyntaxKind.ConstructSignature:
        return "new " + printers.functions.functionType(type, true);

      case ts.SyntaxKind.TypeQuery: {
        //$todo some weird union errors
        const symbol = checker.current.getSymbolAtLocation(type.exprName);
        return "typeof " + getTypeofFullyQualifiedName(symbol, type.exprName);
      }

      case ts.SyntaxKind.Constructor:
        return (
          "constructor(" +
          type.parameters.map(printers.common.parameter).join(", ") +
          "): this"
        );

      case ts.SyntaxKind.ParenthesizedType:
        return `(${printType(type.type)})`;

      case ts.SyntaxKind.ImportSpecifier:
        if (checker.current) {
          //$todo some weird union errors
          const symbol = checker.current.getSymbolAtLocation(type.name);
          renames(symbol, type);
        }
        return printers.relationships.importExportSpecifier(type);

      case ts.SyntaxKind.ExportSpecifier:
        return printers.relationships.importExportSpecifier(type);

      case ts.SyntaxKind.GetAccessor:
        return printers.common.parameter(type);

      case ts.SyntaxKind.SetAccessor:
        return printers.common.parameter(type);

      default:
    }
    console.log(`
    ts.SyntaxKind[type.kind]: ${ts.SyntaxKind[(type as any).kind]}
    name: ${(type as any)?.name?.escapedText}
    kind: ${(type as any).kind}
    type: ${util.inspect(type)}
    `);

    // @ts-expect-error todo(flow->ts)
    const output = `${type.name?.escapedText}: /* NO PRINT IMPLEMENTED: ${
      // @ts-expect-error todo(flow->ts)
      ts.SyntaxKind[type.kind]
    } */ any`;
    console.log(output);
    return output;
  },
);

export default printType;
