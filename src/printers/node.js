/* @flow */
import type { RawNode } from '../nodes/node'

import _ from 'lodash';

import printers from './index';

export const printType = (type: RawNode) => {
  switch (type.kind) {
    case 'VoidKeyword':
    case 'StringKeyword':
    case 'AnyKeyword':
    case 'NumberKeyword':
    case 'BooleanKeyword':
      return printers.basics.print(type.kind);

    case "FunctionType":
    case "FunctionTypeAnnotation":
      return printers.functions.functionType(type);

    case "TypeLiteral":
      return printers.declarations.interfaceType(type);

    case 'IdentifierObject':
    case 'Identifier':
    case 'StringLiteralType':
      return printers.relationships.namespace(type.text, true);

    case 'BindingElement':
    case 'TypeParameter':
      return type.name.text;
    case 'TypePredicate':
      if (type.type.typeName) {
        return type.type.typeName.text;
      }

      return printType(type.type);

    case 'QualifiedName':
      return printers.relationships.namespace(type.left.text) + printType(type.right) + printers.common.generics(type.typeArguments);

    case 'StringLiteral':
      return type.text;

    case 'TypeReference':
      return printers.declarations.typeReference(type)

    case 'LastNodeType':
      return `"${type.literal.text}"`;

    case 'VariableDeclaration':
    case 'PropertyDeclaration':
      if (type.modifiers && type.modifiers.some(modifier => modifier.kind === 'PrivateKeyword')) {
        return '';
      }

      if (type.parameters) {
        return type.name.text + ': ' + type.parameters.map(printers.common.parameter);
      }

      if (type.type) {
        return type.name.text + ': ' + printType(type.type)

      }

      return type.name.text + ': ';

    case 'TupleType':
      return `[${type.elementTypes.map(printType).join(', ')}]`


    case 'MethodSignature':
      return `${type.name.text}${printers.functions.functionType(type, true)}`

    case 'ExpressionWithTypeArguments':
      return printType(type.expression) + printers.common.generics(type.typeArguments);

    case 'PropertyAccessExpression':
      return printers.relationships.namespace(type.expression.text) + printType(type.name)

    case 'NodeObject':
      return printers.relationships.namespace(type.expression.text) + printType(type.name);

    case 'PropertySignature':
      return printers.common.parameter(type)

    case 'CallSignature':
      let str = `(${type.parameters.map(printers.common.parameter).join(', ')})`;
      return type.type ? `${str}: ${printType(type.type)}` : str;

    case 'UnionType':
      const join = type.types.length >= 5 ? '\n' : ' ';
      return type.types.map(printType).join(`${join}| `);

    case 'ArrayType':
      return printType(type.elementType) + '[]';

    case 'ThisType':
      return 'this';

    case 'IndexSignature':
      return `[${type.parameters.map(printers.common.parameter).join(', ')}]: ${printType(type.type)}`

    case 'IntersectionType':
      return type.types.map(printType).join(' & ')

    case 'SymbolKeyword':
      // TODO: What to print here?
      return '';

    case 'MethodDeclaration':
      // Skip methods marked as private
      if (type.modifiers && type.modifiers.some(modifier => modifier.kind === 'PrivateKeyword')) {
        return '';
      }

      return type.name.text + printers.functions.functionType(type, true);


    case 'ConstructorType':
      // Not implemented. The return is just a guess.
      return '(' + type.parameters.map(printers.common.parameter).join(', ') + ') => ' + printers.node.printType(type.type)

    case 'ConstructSignature':
      return 'new ' + printers.functions.functionType(type, true);

    case 'TypeQuery':
      return 'typeof ' +type.exprName.text;

    case 'Constructor':
      return 'constructor(' + type.parameters.map(printers.common.parameter).join(', ') + '): this';

    case 'ParenthesizedType':
      return `(${printType(type.type)})`;

    case 'VariableDeclaration':
      return type.name.text + ': ' + printType(type.type);
  }

  return 'NO PRINT IMPLEMENTED: ' + type.kind;
}

export default printType;
