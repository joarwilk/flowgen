// @flow

import { compiler, beautify } from "..";

it("should handle utility types", () => {
  const ts = `
import {ReactNode} from 'react'
import * as React from 'react'
declare function s(node: ReactNode): void;
declare function s(node: React.ReactNode): void;
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
