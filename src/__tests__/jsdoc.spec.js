// @flow

import { compiler, beautify } from "..";

it("should handle basic jsdoc", () => {
  const ts = `const skip: number
/**
 * @param {string} userToken User authentication token
 * @returns {Promise<void>}
 */
declare function authorize(userToken: string): Promise<void>

/**
 * Plain comment
 */
declare function test(): Promise<void>
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove jsdoc", () => {
  const ts = `
/**
 * @param {string} userToken User authentication token
 * @returns {Promise<void>}
 */
declare function authorize(userToken: string): Promise<void>
`;
  const result = compiler.compileDefinitionString(ts, { jsdoc: false });
  expect(beautify(result)).toMatchSnapshot();
});
