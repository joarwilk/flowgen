// @flow

import {compiler, beautify} from "..";

it("should handle boolean literals in type", () => {
  const ts = `
  type MyFalsyType = string | false;
  type MyTruthyType = true | string;
`;

  const result = compiler.compileDefinitionString(ts);

  expect(beautify(result)).toMatchSnapshot();
});
