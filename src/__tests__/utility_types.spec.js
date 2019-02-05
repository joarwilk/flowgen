// @flow

import { compiler, beautify } from "..";

it("should handle utility types", () => {
  const ts = `
type A = Readonly<{a: number}>
type B = Partial<{a: number}>
type C = NonNullable<string | null>
type D = ReadonlyArray<string>
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
