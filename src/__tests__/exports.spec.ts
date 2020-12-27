import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle exports", () => {
  const ts = `
export default module
export { module }
export { module as newModule }
export { GeneratorOptions } from "@babel/generator";
export { GeneratorOptions as NewGeneratorOptions } from "@babel/generator";
export * from 'typescript';
//enable when typescript supports
//export traverse, { Visitor, NodePath } from "@babel/traverse";
//export template from "@babel/template";
//export * as t from "@babel/types";`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).not.toBeValidFlowTypeDeclarations(); // cannot-resolve-module
});

test("should handle unnamed default export", () => {
  const ts = `
export default function(): void;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
