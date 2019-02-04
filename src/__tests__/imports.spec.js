import { compiler, beautify } from "..";

it("should handle imports", () => {
  const ts = `import { GeneratorOptions } from "@babel/generator";
import traverse, { Visitor, NodePath } from "@babel/traverse";
import template from "@babel/template";
import * as t from "@babel/types";
import v, * as d from 'typescript';`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
