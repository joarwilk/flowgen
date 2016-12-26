/* @flow */
import type { RawNode } from '../nodes/node'

import _ from 'lodash';
import getNodeName from '../nodename';

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
      return printers.declarations.interface(type);

    case 'Identifier':
    case 'StringLiteralType':
      return type.text;

    case 'BindingElement':
    case 'TypeParameter':
      return type.name.text;
    case 'TypePredicate':
      return type.type.typeName.text;

    case 'QualifiedName':
      return printType(type.left) + '.' + printType(type.right) + printers.common.generics(type.typeArguments);

    case 'TypeReference':
      return printers.declarations.type(type);

    case 'LastNodeType':
      return `"${type.literal.text}"`;

    case 'PropertyDeclaration':
      if (type.modifiers && type.modifiers.some(modifier => modifier.kind === 'PrivateKeyword')) {
        return '';
      }

      if (type.parameters) {
        return type.name.text + ': ' + type.parameters.map(printers.common.parameters);
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
      return `${type.expression.text}$${type.name.text}`;

    case 'PropertySignature':
      return printParameter(type)

    case 'CallSignature':
      return `(${type.parameters.map(printParameter).join(', ')}): ${printType(type.type)}`

    case 'UnionType':
      return type.types.map(printType).join(' | ');

    case 'ArrayType':
      return printType(type.elementType) + '[]';

    case 'ThisType':
      return 'this';

    case 'IndexSignature':
      return `[${type.parameters.map(printParameter).join(', ')}]: ${printType(type.type)}`

    case 'IntersectionType':
      return type.types.map(printType).join(' & ')

    case 'MethodDeclaration':
      // Skip methods marked as private
      if (type.modifiers && type.modifiers.some(modifier => modifier.kind === 'PrivateKeyword')) {
        return '';
      }

      return type.name.text + printBasicFunction(type, true);

    case 'ConstructSignature':
      return 'new ' + printBasicFunction(type, true);

    case 'TypeQuery':
      return 'typeof ' + type.exprName.text;

    case 'Constructor':
      return 'constructor(' + type.parameters.map(printParameter).join(', ') + '): this';

    case 'ParenthesizedType':
      return `(${printType(type.type)})`;
  }

  console.log('NO PRINT IMPLEMENTED', type)
  return 'NO PRINT IMPLEMENTED: ' + type.kind;
}

export default printType;
