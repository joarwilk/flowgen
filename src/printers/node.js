/* @flow */

import * as ts from "typescript";
import printers from "./index";

import { checker } from "../checker";
import { renames, getLeftMostEntityName } from "./smart-identifiers";

type KeywordNode =
  | { kind: typeof ts.SyntaxKind.AnyKeyword }
  | { kind: typeof ts.SyntaxKind.UnknownKeyword }
  | { kind: typeof ts.SyntaxKind.NumberKeyword }
  | { kind: typeof ts.SyntaxKind.BigIntKeyword }
  | { kind: typeof ts.SyntaxKind.ObjectKeyword }
  | { kind: typeof ts.SyntaxKind.BooleanKeyword }
  | { kind: typeof ts.SyntaxKind.StringKeyword }
  | { kind: typeof ts.SyntaxKind.SymbolKeyword }
  | { kind: typeof ts.SyntaxKind.VoidKeyword }
  | { kind: typeof ts.SyntaxKind.UndefinedKeyword }
  | { kind: typeof ts.SyntaxKind.NullKeyword }
  | { kind: typeof ts.SyntaxKind.NeverKeyword }
  | { kind: typeof ts.SyntaxKind.FalseKeyword }
  | { kind: typeof ts.SyntaxKind.TrueKeyword };

type PrintNode =
  | KeywordNode
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
  | ts.MethodSignature;

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
  type: ts.PropertyAccessExpression | ts.Identifier,
): string {
  if (type.kind === ts.SyntaxKind.PropertyAccessExpression) {
    return (
      printers.relationships.namespace(
        type.expression.kind === ts.SyntaxKind.Identifier
          ? type.expression.text
          : printPropertyAccessExpression(type.expression),
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
    return type.expression.kind === ts.SyntaxKind.Identifier
      ? type.expression
      : getLeftMostPropertyAccessExpression(type.expression);
  } else if (type.kind === ts.SyntaxKind.Identifier) {
    return type;
  }
}

export function getFullyQualifiedPropertyAccessExpression(
  symbol: ts.Symbol | void,
  type: *,
  delimiter = "$",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    let isExternalSymbol = false;
    const leftMost = getLeftMostPropertyAccessExpression(type);
    if (leftMost) {
      const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
      const decl = leftMostSymbol ? leftMostSymbol.declarations[0] : {};
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
          ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
            ts.SymbolFormatFlags.AllowAnyNodeKind,
        );
  } else {
    return printPropertyAccessExpression(type);
  }
}

export function getFullyQualifiedName(
  symbol: ts.Symbol | void,
  type: *,
  checks: boolean = true,
  delimiter = "$",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    if (checks) {
      let isExternalSymbol = false;
      const leftMost = getLeftMostEntityName(type);
      if (leftMost) {
        const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
        const decl = leftMostSymbol ? leftMostSymbol.declarations[0] : {};
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
          ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
            ts.SymbolFormatFlags.AllowAnyNodeKind,
        );
  } else {
    return printEntityName(type);
  }
}

export function getTypeofFullyQualifiedName(
  symbol: ts.Symbol | void,
  type: *,
  delimiter = ".",
): string {
  if (checker.current) {
    const typeChecker = checker.current;
    let isExternalSymbol = false;
    const leftMost = getLeftMostEntityName(type);
    if (leftMost) {
      const leftMostSymbol = typeChecker.getSymbolAtLocation(leftMost);
      const decl = leftMostSymbol ? leftMostSymbol.declarations[0] : {};
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
            symbol.parent.declarations[0].parent.symbol,
            type,
          ) +
            delimiter +
            typeChecker.symbolToString(symbol)
        : typeChecker.symbolToString(
            symbol,
            undefined,
            /*meaning*/ undefined,
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
            ts.SymbolFormatFlags.DoNotIncludeSymbolChain |
              ts.SymbolFormatFlags.AllowAnyNodeKind,
          );
    }
  } else {
    return printEntityName(type);
  }
}

export function fixDefaultTypeArguments(symbol, type) {
  if (!symbol) return;
  if (!symbol.declarations) return;
  const decl = symbol.declarations[0];
  const allTypeParametersHaveDefaults =
    !!decl?.typeParameters?.length &&
    decl.typeParameters.every(param => !!param.default);
  if (allTypeParametersHaveDefaults && !type.typeArguments) {
    type.typeArguments = [];
  }
}

export const printType = (rawType: any): string => {
  // debuggerif()
  //TODO: #6 No match found in SyntaxKind enum

  const type: PrintNode = rawType;

  const keywordPrefix: string =
    type.modifiers &&
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
      console.log(
        "Flow doesn't support BigInt proposal: https://github.com/facebook/flow/issues/6639",
      );
      // TODO: What to print here?
      return "number";

    case ts.SyntaxKind.ConditionalType: {
      const line =
        "Flow doesn't support conditional types, use $Call utility type";
      console.log(line);
      return `/* ${line} */ any`;
    }

    case ts.SyntaxKind.ComputedPropertyName: {
      if (type.expression?.expression?.text === 'Symbol' && type.expression?.name?.text === 'iterator') {
        return '@@iterator'
      }
      if (type.expression?.expression?.text === 'Symbol' && type.expression?.name?.text === 'asyncIterator') {
        return '@@asyncIterator'
      }
      if (type.expression.kind === ts.SyntaxKind.StringLiteral) {
        return printType(type.expression);
      }
      const line =
        "Flow doesn't support computed property names";
      logger.error(type.expression, line);
      return `[typeof ${printType(type.expression)}]`;
    }

    case ts.SyntaxKind.FunctionType:
      //case SyntaxKind.FunctionTypeAnnotation:
      return printers.functions.functionType(type);

    case ts.SyntaxKind.TypeLiteral:
      return printers.declarations.interfaceType(type);

    //case SyntaxKind.IdentifierObject:
    //case SyntaxKind.StringLiteralType:
    case ts.SyntaxKind.Identifier: {
      return printers.relationships.namespace(
        printers.identifiers.print(type.text),
        true,
      );
    }

    case ts.SyntaxKind.BindingElement:
      return printers.common.typeParameter(type);
    case ts.SyntaxKind.TypeParameter:
      return printers.common.typeParameter(type);

    case ts.SyntaxKind.PrefixUnaryExpression:
      switch (type.operator) {
        case ts.SyntaxKind.MinusToken:
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
        type.indexType.kind === ts.SyntaxKind.LiteralType &&
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
          console.log("Flow doesn't support `unique symbol`");
          return printType(type.type);
        default:
          console.log(
            `"NO PRINT IMPLEMENTED: TypeOperator ${
              ts.SyntaxKind[type.operator]
            }"`,
          );
          return `"NO PRINT IMPLEMENTED: TypeOperator ${
            ts.SyntaxKind[type.operator]
          }"`;
      }

    case ts.SyntaxKind.MappedType: {
      const constraint = type.typeParameter.constraint;
      const typeName = printType(type.typeParameter.name);
      const value = printType(type.type);
      let source = `{[k: ${printType(constraint)}]: any}`;
      if (constraint.operator === ts.SyntaxKind.KeyOfKeyword) {
        source = printType(constraint.type);
      }
      return `$ObjMapi<${source}, <${typeName}>(${typeName}) => ${value}>`;
    }

    case ts.SyntaxKind.FirstLiteralToken:
      return type.text;

    case ts.SyntaxKind.ImportType:
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
          return `typeof ${getTypeofFullyQualifiedName(symbol, type.typeName)}`;
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
        if (!isRenamed)
          type.typeName.escapedText = getFullyQualifiedName(
            symbol,
            type.typeName,
          );
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

    case ts.SyntaxKind.OptionalType:
      return `${printType(type.type)} | void`;
    case ts.SyntaxKind.TupleType: {
      const lastElement = type.elementTypes[type.elementTypes.length - 1];
      if (lastElement.kind === ts.SyntaxKind.RestType) type.elementTypes.pop();
      let tuple = `[${type.elementTypes.map(printType).join(", ")}]`;
      if (lastElement.kind === ts.SyntaxKind.RestType) {
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

      return (
        keywordPrefix +
        printers.common.methodSignature(type)
      );

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
        const symbol = checker.current.getSymbolAtLocation(type.name);
        renames(symbol, type);
      }
      return printers.relationships.importExportSpecifier(type);

    case ts.SyntaxKind.ExportSpecifier:
      return printers.relationships.importExportSpecifier(type);
  }

  const output = `/* NO PRINT IMPLEMENTED: ${ts.SyntaxKind[type.kind]} */ any`;
  console.log(output);
  return output;
};

export default printType;
