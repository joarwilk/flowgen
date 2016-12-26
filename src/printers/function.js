/* @flow */
import type { RawNode } from '../nodes/node';

import * as common from './common';

const functionType = (func: RawNode, namespace: string = '', dotAsReturn: boolean = false) => {
  const params = func.parameters.map(common.parameter).join(', ');
  const generics = common.generics(func.typeParameters);
  const returns = common.type(func.type, namespace);

  const firstPass = `${generics}(${params})${dotAsReturn ? ':' : ' =>'} ${returns}`;

  // Make sure our functions arent too wide
  if (firstPass.length > 80) {
    // break params onto a new line for better formatting
    const paramsWithNewlines = `\t${params}`;

    return `${generics}(${paramsWithNewlines})${dotAsReturn ? ':' : ' =>'} ${returns}`;
  }

  return firstPass;
}

const functionDeclaration = (nodeName: string, node: RawNode, namespace: string = '') => {
  let str = `declare ${common.export(node)}function ${nodeName}${functionType(node, namespace, true)}`;

  return str;
}
