// @flow
import {compiler, beautify} from "..";

it("should handle exported types", () => {
  const ts = "export declare type FactoryOrValue<T> = T | (() => T);";
  expect(beautify(compiler.compileDefinitionString(ts))).toMatchSnapshot();
});
