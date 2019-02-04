// @flow
import { compiler, beautify } from "..";

it("should handle exported types", () => {
  const ts = `
export declare type FactoryOrValue<T> = T | (() => T);
export type Maybe<T> = {type: 'just', value: T} | {type: 'nothing'}
`;
  expect(beautify(compiler.compileDefinitionString(ts))).toMatchSnapshot();
});
