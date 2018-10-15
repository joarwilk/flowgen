// @flow
import compiler from "../cli/compiler";
import beautify from "../cli/beautifier";

it("should handle exported types", () => {
  const ts = "export declare type FactoryOrValue<T> = T | (() => T);";
  expect(beautify(compiler.compileDefinitionString(ts))).toMatchSnapshot();
});
