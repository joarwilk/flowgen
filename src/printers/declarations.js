/* @flow */

const printBasicInterface = (interf, withSemicolons=false) => {
  const members = interf.members.map(printType).filter(Boolean).join(withSemicolons ? ';\t' : ',\t');

  return `{\t${members}}`;
}

const printInterface = (node) => {
  let str = `declare ${printExport(node)}interface ${node.name.text}${printGenerics(node.typeParameters)} ${printBasicInterface(node)}`;

  return str;
}

const printTypeAlias = (node) => {
  let str = `declare ${printExport(node)}type ${node.name.text}${printGenerics(node.typeParameters)} = ${printType(node.type)};`;

  return str;
}

const printClass = (node) => {
  let heritage = '';

  // If the class is extending something
  if (node.heritageClauses) {
    heritage = node.heritageClauses.map(clause => printType(clause.types[0])).join(', ');
    heritage = heritage.length > 0 ? `extends ${heritage}` : '';
  }

  let str = `declare ${printExport(node)}class ${node.name.text}${printGenerics(node.typeParameters)} ${heritage} ${printBasicInterface(node, true)}`;

  return str;
}
