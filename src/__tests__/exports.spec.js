// @flow

import { compiler, beautify } from "..";

it("should handle exports", () => {
  const ts = `
export default module
export { module }
export { GeneratorOptions } from "@babel/generator";
export * from 'typescript';
//enable when typescript supports
//export traverse, { Visitor, NodePath } from "@babel/traverse";
//export template from "@babel/template";
//export * as t from "@babel/types";`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
