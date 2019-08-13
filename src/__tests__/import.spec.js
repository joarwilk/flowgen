// @flow

import { compiler, beautify } from "..";

it("should handle dynamic imports", () => {
  const ts = `
type A = import('react');
type B = import('react').ReactNode;
`;
  expect(
    beautify(compiler.compileDefinitionString(ts, { quiet: true })),
  ).toMatchSnapshot();
});
