// @flow

import { compiler, beautify } from "..";

it("should handle tuples", () => {
  const ts = `
  type T1 = [number, string?];
  type T2 = [number, ...string[]];
  `;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
