/* @flow */
import type { RawNode } from '../nodes/node';

import printers from './index';

export const functionType = (func: RawNode, dotAsReturn: boolean = false) => {
  const params = func.parameters.map(printers.common.parameter).join(', ');
  const generics = printers.common.generics(func.typeParameters);
  const returns = printers.node.printType(func.type);

  const firstPass = `${generics}(${params})${dotAsReturn ? ':' : ' =>'} ${returns}`;

  // Make sure our functions arent too wide
  if (firstPass.length > 80) {
    // break params onto a new line for better formatting
    const paramsWithNewlines = `\t${params}`;

    return `${generics}(${paramsWithNewlines})${dotAsReturn ? ':' : ' =>'} ${returns}`;
  }

  return firstPass;
}

const functionDeclaration = (nodeName: string, node: RawNode) => {
  let str = `declare ${printers.relationships.exporter(node)}function ${nodeName}${functionType(node, true)}`;

  return str;
}
