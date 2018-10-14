// @flow
import compiler from "../cli/compiler";
import beautify from "../cli/beautifier";

it("should handle exported interfaces", () => {
  const ts = `export interface UnaryFunction<T, R> {
    (source: T): R;
  }
`;
  expect(beautify(compiler.compileDefinitionString(ts))).toMatchSnapshot();
});
