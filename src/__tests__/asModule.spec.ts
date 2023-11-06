import { compiler, beautify } from "..";
import "../test-matchers";

it("should wrap in module", () => {
  const ts = `
declare export type Test = 'ok' | 'error'
declare type Test2 = 'ok' | 'error'
type Maybe<T> = {type: 'just', value: T} | {type: 'nothing'}
export type Ref<T> = { current: T }

export const ok: number
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true, asModule: "myModule" });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should wrap in module with scoped name", () => {
  const ts = `
declare export type Test = 'ok' | 'error'
declare type Test2 = 'ok' | 'error'
type Maybe<T> = {type: 'just', value: T} | {type: 'nothing'}
export type Ref<T> = { current: T }

export const ok: number
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true, asModule: "@company/project" });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
