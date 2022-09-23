import * as ts from "typescript";
import util from "util";
import * as printers from "./index";

import { checker } from "../checker";
import * as logger from "../logger";
import { withEnv } from "../env";
import { renames, getLeftMostEntityName } from "./smart-identifiers";
import { printErrorMessage } from "../errors/error-message";
import { opts } from "../options";

type ExpectedKeywordKind =
  | ts.SyntaxKind.AnyKeyword
  | ts.SyntaxKind.UnknownKeyword
  | ts.SyntaxKind.NumberKeyword
  | ts.SyntaxKind.BigIntKeyword
  | ts.SyntaxKind.ObjectKeyword
  | ts.SyntaxKind.BooleanKeyword
  | ts.SyntaxKind.StringKeyword
  | ts.SyntaxKind.SymbolKeyword
  | ts.SyntaxKind.VoidKeyword
  | ts.SyntaxKind.UndefinedKeyword
  | ts.SyntaxKind.NullKeyword
  | ts.SyntaxKind.NeverKeyword
  | ts.SyntaxKind.FalseKeyword
  | ts.SyntaxKind.TrueKeyword;

type PrintNode =
  | ts.KeywordToken<ExpectedKeywordKind>
  | { kind: typeof ts.SyntaxKind.FirstLiteralToken }
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
  | ts.JSDocNameReference
  | ts.ComputedPropertyName
  | ts.OptionalTypeNode
  | ts.GetAccessorDeclaration
  | ts.SetAccessorDeclaration
  | ts.InferTypeNode;

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
      // @ts-expect-error todo(flow->ts)
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
          leftMostSymbol &&
          leftMostSymbol.declarations &&
          leftMostSymbol.declarations.length
            ? leftMostSymbol.declarations[0]
            : {};
        isExternalSymbol =
          decl.kind === ts.SyntaxKind.NamespaceImport ||
          decl.kind === ts.SyntaxKind.NamedImports ||
          decl.kind === ts.SyntaxKind.TypeParameter ||
          leftMostSymbol?.parent?.escapedName === "__global";
      }
      // TODO: something here is fucky. we want to take the branch when merging namespaces
      // so that we get ns$a.b instead of ns$a$b, but we want to not take it when printing
      // globalThis.whatever; taking it will print globalThis.whatever instead of whatever
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

export function printFlowGenHelper(env): string {
  let helpers = "";
  if (env.conditionalHelpers) {
    helpers += `
// see https://gist.github.com/thecotne/6e5969f4aaf8f253985ed36b30ac9fe0
type $FlowGen$If<X: boolean, Then, Else = empty> = $Call<
  & ((true, Then, Else) => Then)
  & ((false, Then, Else) => Else),
  X,
  Then,
  Else,
>;

type $FlowGen$Assignable<A, B> = $Call<
  & ((...r: [B]) => true)
  & ((...r: [A]) => false),
  A,
>;`;
  }

  return helpers;
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

/**
 * Log an error, while returning a commented FlowFixMe type.
 *
 * This is appropriate for error conditions that indicate a bug within
 * Flowgen.
 *
 * The error uses `logger.error` for a nice message pointing at the input
 * source code corresponding to `node`, to help identify what triggered the
 * issue.
 */
const printErrorType = (description: string, node: ts.Node) => {
  logger.error(node, { type: "FlowgenInternalError", description });
  return `($FlowFixMe /* flowgen-error: ${description} */)`;
};

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
      case ts.SyntaxKind.JSDocNameReference:
        // @ts-expect-error todo(flow->ts) - 'escapedText' does not exist on type 'EntityName | JSDocMemberName'
        return type?.name?.escapedText || "";
      case ts.SyntaxKind.ConditionalType: {
        env.conditionalHelpers = true;
        return `$FlowGen$If<$FlowGen$Assignable<${printType(
          type.checkType,
        )},${printType(type.extendsType)}>,${printType(
          type.trueType,
        )},${printType(type.falseType)}>`;
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
          // @ts-expect-error todo(flow->ts)
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
        return printErrorType("Failed to transform an ImportType node", type);

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
          symbol = checker.current.getSymbolAtLocation(type.typeName);

          //$todo
          fixDefaultTypeArguments(symbol, type);
          const isRenamed = renames(symbol, type);
          if (!isRenamed) {
            //$todo weird union errors
            // @ts-expect-error todo(flow->ts)
            type.typeName.escapedText = getFullyQualifiedName(
              symbol,
              type.typeName,
            );
          }

          const getAdjustedType = targetSymbol => {
            const isTypeImport =
              symbol &&
              symbol.declarations &&
              symbol.declarations[0] &&
              ts.isTypeOnlyImportOrExportDeclaration(symbol.declarations[0]);
            if (
              targetSymbol &&
              targetSymbol.declarations &&
              targetSymbol.declarations[0].kind === ts.SyntaxKind.EnumMember
            ) {
              return `${isTypeImport ? "" : "typeof"}
                ${getTypeofFullyQualifiedName(targetSymbol, type.typeName)}`;
            } else if (
              targetSymbol &&
              targetSymbol.declarations &&
              targetSymbol.declarations[0].kind ===
                ts.SyntaxKind.EnumDeclaration
            ) {
              return `$Values<
                ${isTypeImport ? "" : "typeof "}
                ${getTypeofFullyQualifiedName(targetSymbol, type.typeName)}>`;
            }
            // double-bang fixes most tests, but also breaks some utility types,
            // esp the ones that aren't provided args when they're expected
            // need to determine exactly what the difference between these two is
            // and why they took different branches in 4.4
            return printers.declarations.typeReference(type, targetSymbol);
            // return printers.declarations.typeReference(type, !targetSymbol);
          };

          // if importing an enum, we have to change how the type is used across the file
          if (
            symbol &&
            symbol.declarations &&
            symbol.declarations[0].kind === ts.SyntaxKind.ImportSpecifier
          ) {
            return getAdjustedType(
              checker.current.getTypeAtLocation(type).symbol,
            );
          } else {
            return getAdjustedType(symbol);
          }
        }
        return printers.declarations.typeReference(type, symbol);
      }

      case ts.SyntaxKind.VariableDeclaration:
        return printers.declarations.propertyDeclaration(type, keywordPrefix);

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
        const generics = printers.common.genericsWithoutDefault(
          type.typeParameters,
        );
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

      case ts.SyntaxKind.IntersectionType: {
        // for non-class types, we can't easily just merge types together using &
        // this is because in Typescript
        // { a: number } & { b: string}
        // is NOT equivalent to {| a: number |} & {| b: string |} in Flow
        // since you can't intersect exact types in Flow
        // https://github.com/facebook/flow/issues/4946#issuecomment-331520118
        // instead, you have to use the spread notation
        // HOWEVER, you must use & to intersect classes (you can't spread a class)
        const containsClass = type.types
          .map(checker.current.getTypeAtLocation)
          .find(type => type.isClass());

        if (containsClass) {
          return type.types.map(printType).join(" & ");
        }

        const spreadType = type.types
          .map(type => `...${printType(type)}`)
          .join(",");

        const isInexact = opts().inexact;

        return isInexact ? `{ ${spreadType} }` : `{| ${spreadType} |}`;
      }

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
        return keywordPrefix + printers.common.parameter(type);

      case ts.SyntaxKind.SetAccessor:
        return printers.common.parameter(type);

      case ts.SyntaxKind.InferType:
        return printType(type.typeParameter);

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
