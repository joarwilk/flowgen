// @flow

import { compiler, beautify } from "..";

it("should handle exported interfaces", () => {
  const ts = `export interface UnaryFunction<T, R> {
    (source: T): R;
  }
`;
  expect(beautify(compiler.compileDefinitionString(ts, {quiet: true}))).toMatchSnapshot();
});
