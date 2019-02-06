/* @flow */

import type { RawNode } from "../nodes/node";
import { SyntaxKind } from "typescript";
import printers from "./index";

export const printType = (type: RawNode): string => {
  // debuggerif()
  //TODO: #6 No match found in SyntaxKind enum

  const keywordPrefix: string =
    type.modifiers &&
    type.modifiers.some(modifier => modifier.kind === "StaticKeyword")
      ? "static "
      : "";

  switch (SyntaxKind[type.kind]) {
    case SyntaxKind.VoidKeyword:
    case SyntaxKind.StringKeyword:
    case SyntaxKind.AnyKeyword:
    case SyntaxKind.NumberKeyword:
    case SyntaxKind.BooleanKeyword:
    case SyntaxKind.NullKeyword:
    case SyntaxKind.UndefinedKeyword:
    case SyntaxKind.ObjectKeyword:
    case SyntaxKind.FalseKeyword:
    case SyntaxKind.TrueKeyword:
    case SyntaxKind.NeverKeyword:
    case SyntaxKind.UnknownKeyword:
      return printers.basics.print(type.kind);
    case SyntaxKind.SymbolKeyword:
      // TODO: What to print here?
      return "Symbol";

    case SyntaxKind.ConditionalType: {
      const line = `"There was Conditional Type, use $Call utility type"`;
      console.log(line);
      return line;
    }

    case SyntaxKind.FunctionType:
      //case SyntaxKind.FunctionTypeAnnotation:
      return printers.functions.functionType(type);

    case SyntaxKind.TypeLiteral:
      return printers.declarations.interfaceType(type);

    //case SyntaxKind.IdentifierObject:
    case SyntaxKind.Identifier:
      //case SyntaxKind.StringLiteralType:
      return printers.relationships.namespace(
        printers.relationships.namespaceProp(
          printers.identifiers.print(type.text),
        ),
        true,
      );

    case SyntaxKind.BindingElement:
    case SyntaxKind.TypeParameter: {
      let defaultType = "";
      let constraint = "";
      if (type.constraint) {
        constraint = `: ${printType(type.constraint)}`;
      }
      if (type.default) {
        defaultType = `= ${printType(type.default)}`;
      }
      return `${type.name.text}${constraint}${defaultType}`;
    }

    case SyntaxKind.PrefixUnaryExpression:
      switch (type.operator) {
        case SyntaxKind.MinusToken:
          return `-${type.operand.text}`;
        default:
          console.log('"NO PRINT IMPLEMENTED: PrefixUnaryExpression"');
          return '"NO PRINT IMPLEMENTED: PrefixUnaryExpression"';
      }

    case SyntaxKind.TypePredicate:
      //TODO: replace with boolean %checks when supported in class declarations
      return "boolean";

    case SyntaxKind.IndexedAccessType:
      return `$ElementType<${printType(type.objectType)}, ${printType(
        type.indexType,
      )}>`;

    case SyntaxKind.TypeOperator:
      switch (type.operator) {
        case SyntaxKind.KeyOfKeyword:
          return `$Keys<${printType(type.type)}>`;
        default:
          console.log(
            `"NO PRINT IMPLEMENTED: TypeOperator ${SyntaxKind[type.operator]}"`,
          );
          return `"NO PRINT IMPLEMENTED: TypeOperator ${
            SyntaxKind[type.operator]
          }"`;
      }

    case SyntaxKind.MappedType: {
      const constraint = type.typeParameter.constraint;
      const typeName = printType(type.typeParameter.name);
      const value = printType(type.type);
      let source = `{[k: ${printType(constraint)}]: any}`;
      if (constraint.operator === SyntaxKind.KeyOfKeyword) {
        source = printType(constraint.type);
      }
      return `$ObjMapi<${source}, <${typeName}>(${typeName}) => ${value}>`;
    }

    case SyntaxKind.FirstLiteralToken:
      return type.text;

    case SyntaxKind.FirstTypeNode:
    case SyntaxKind.LastTypeNode:
    case SyntaxKind.LiteralType:
      if (type.literal) {
        if (type.literal.kind === "StringLiteral") {
          return printType(type.literal);
        } else if (type.literal.text) {
          return type.literal.text;
        } else {
          return printType(type.literal);
        }
      }

      if (type.type.typeName) {
        return type.type.typeName.text;
      }
      return printType(type.type);

    case SyntaxKind.QualifiedName:
      return (
        printers.relationships.namespace(
          type.left.text
            ? printers.relationships.namespaceProp(type.left.text)
            : printType(type.left),
        ) +
        printType(type.right) +
        printers.common.generics(type.typeArguments)
      );

    case SyntaxKind.StringLiteral:
      return JSON.stringify(type.text);

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
          keywordPrefix +
          type.name.text +
          ": " +
          type.parameters.map(printers.common.parameter)
        );
      }

      if (type.type) {
        return (
          keywordPrefix +
          printers.relationships.namespaceProp(type.name.text) +
          ": " +
          printType(type.type)
        );
      }

      return (
        keywordPrefix +
        printers.relationships.namespaceProp(type.name.text) +
        ": "
      );

    case SyntaxKind.TupleType:
      return `[${type.elementTypes.map(printType).join(", ")}]`;

    case SyntaxKind.MethodSignature:
      return printers.common.methodSignature(type);

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

    // case SyntaxKind.NodeObject:
    //   return (
    //     printers.relationships.namespace(type.expression.text) +
    //     printType(type.name)
    //   );

    case SyntaxKind.PropertySignature:
      return printers.common.parameter(type);

    case SyntaxKind.CallSignature: {
      const generics = printers.common.generics(type.typeParameters);
      const str = `${generics}(${type.parameters
        .map(printers.common.parameter)
        .join(", ")})`;
      return type.type ? `${str}: ${printType(type.type)}` : str;
    }

    case SyntaxKind.UnionType: {
      const join = type.types.length >= 5 ? "\n" : " ";
      // debugger
      return type.types.map(printType).join(`${join}| `);
    }

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

    case SyntaxKind.MethodDeclaration:
      // Skip methods marked as private
      if (
        type.modifiers &&
        type.modifiers.some(modifier => modifier.kind === "PrivateKeyword")
      ) {
        return "";
      }

      return (
        keywordPrefix +
        type.name.text +
        printers.functions.functionType(type, true)
      );

    case SyntaxKind.ConstructorType:
      // Not implemented. The return is just a guess.
      return (
        "(" +
        type.parameters.map(printers.common.parameter).join(", ") +
        ") => " +
        printType(type.type)
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

    case SyntaxKind.ImportSpecifier:
    case SyntaxKind.ExportSpecifier:
      if (type.propertyName) {
        return `${printType(type.propertyName)} as ${printType(type.name)}`;
      }
      return printType(type.name);
  }

  const output = `"NO PRINT IMPLEMENTED: ${type.kind}"`;
  console.log(output);
  return output;
};

export default printType;
