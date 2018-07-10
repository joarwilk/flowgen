/* @flow */
import type { RawNode } from "../nodes/node";
import { SyntaxKind } from "typescript";

import _ from "lodash";

import printers from "./index";

export const printType = (type: RawNode) => {
  // debuggerif()
  //TODO: #6 No match found in SyntaxKind enum
  switch (type.kind) {
    case "FunctionTypeAnnotation":
      return printers.functions.functionType(type);

    case "LastNodeType":
      return `"${type.literal.text}"`;
  }

  switch (SyntaxKind[type.kind]) {
    case SyntaxKind.VoidKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.UndefinedKeyword:
      return printers.basics.print(type.kind);

    case SyntaxKind.FunctionType:
      return printers.functions.functionType(type);

    case SyntaxKind.TypeLiteral:
      return printers.declarations.interfaceType(type);

    case SyntaxKind.IdentifierObject:
    case SyntaxKind.Identifier:
    case SyntaxKind.StringLiteralType:
      return printers.relationships.namespace(type.text, true);

    case SyntaxKind.BindingElement:
    case SyntaxKind.TypeParameter:
      return type.name.text;

    case SyntaxKind.FirstTypeNode:
    case SyntaxKind.LastTypeNode:
    case SyntaxKind.TypePredicate:
      if (type.literal) {
        if (type.literal.kind === "StringLiteral") {
          return "'" + type.literal.text + "'";
        } else {
          return type.literal.text;
        }
      }

      if (type.type.typeName) {
        return type.type.typeName.text;
      }

      return printType(type.type);

    case SyntaxKind.QualifiedName:
      return (
        printers.relationships.namespace(type.left.text) +
        printType(type.right) +
        printers.common.generics(type.typeArguments)
      );

    case SyntaxKind.StringLiteral:
      debugger;
      return type.text;

    case SyntaxKind.TypeReference:
      return printers.declarations.typeReference(type);

    case SyntaxKind.VariableDeclaration:
    case SyntaxKind.PropertyDeclaration:
      if (
        type.modifiers &&
        type.modifiers.some(modifier => modifier.kind === "PrivateKeyword")
      ) {
        return "";
      }

      if (type.parameters) {
        return (
          type.name.text + ": " + type.parameters.map(printers.common.parameter)
        );
      }

      if (type.type) {
        return type.name.text + ": " + printType(type.type);
      }

      return type.name.text + ": ";

    case SyntaxKind.TupleType:
      return `[${type.elementTypes.map(printType).join(", ")}]`;

    case SyntaxKind.MethodSignature:
      return `${type.name.text}${printers.functions.functionType(type, true)}`;

    case SyntaxKind.ExpressionWithTypeArguments:
      return (
        printType(type.expression) +
        printers.common.generics(type.typeArguments)
      );

    case SyntaxKind.PropertyAccessExpression:
      return (
        printers.relationships.namespace(type.expression.text) +
        printType(type.name)
      );

    case SyntaxKind.NodeObject:
      return (
        printers.relationships.namespace(type.expression.text) +
        printType(type.name)
      );

    case SyntaxKind.PropertySignature:
      return printers.common.parameter(type);

    case SyntaxKind.CallSignature:
      let str = `(${type.parameters
        .map(printers.common.parameter)
        .join(", ")})`;
      return type.type ? `${str}: ${printType(type.type)}` : str;

    case SyntaxKind.UnionType:
      const join = type.types.length >= 5 ? "\n" : " ";
      // debugger
      return type.types.map(printType).join(`${join}| `);

    case SyntaxKind.ArrayType:
      return printType(type.elementType) + "[]";

    case SyntaxKind.ThisType:
      return "this";

    case SyntaxKind.IndexSignature:
      return `[${type.parameters
        .map(printers.common.parameter)
        .join(", ")}]: ${printType(type.type)}`;

    case SyntaxKind.IntersectionType:
      return type.types.map(printType).join(" & ");
      
    case SyntaxKind.LiteralType:
      return type.value;

    case SyntaxKind.SymbolKeyword:
      // TODO: What to print here?
      return "";

    case SyntaxKind.MethodDeclaration:
      // Skip methods marked as private
      if (
        type.modifiers &&
        type.modifiers.some(modifier => modifier.kind === "PrivateKeyword")
      ) {
        return "";
      }

      return type.name.text + printers.functions.functionType(type, true);

    case SyntaxKind.ConstructorType:
      // Not implemented. The return is just a guess.
      return (
        "(" +
        type.parameters.map(printers.common.parameter).join(", ") +
        ") => " +
        printers.node.printType(type.type)
      );

    case SyntaxKind.ConstructSignature:
      return "new " + printers.functions.functionType(type, true);

    case SyntaxKind.TypeQuery:
      return "typeof " + type.exprName.text;

    case SyntaxKind.Constructor:
      return (
        "constructor(" +
        type.parameters.map(printers.common.parameter).join(", ") +
        "): this"
      );

    case SyntaxKind.ParenthesizedType:
      return `(${printType(type.type)})`;
  }

  const output = `"NO PRINT IMPLEMENTED: ${type.kind}"`;
  console.log(output);
  return output;
};

export default printType;
