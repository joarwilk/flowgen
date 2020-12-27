import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle module", () => {
  const ts = `
declare module 'test' {
  declare export type Test = 'ok' | 'error'
  declare type Test2 = 'ok' | 'error'
  type Maybe<T> = {type: 'just', value: T} | {type: 'nothing'}
  export type Ref<T> = { current: T }

  export const ok: number
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle module merging", () => {
  const ts = `
declare module 'test' {
  interface A {
    bar: string
  }
  export const ok: number
}
declare module 'test' {
  interface A {
    baz: string
  }
  export const error: string
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should not merge distinct modules", () => {
  const ts = `
declare module 'A' {
  export interface A {
    foo: string;
  }
}
declare module 'B' {
  export interface A {
    baz: string;
  }
}
export interface A {
  bar: string
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle module function merging", () => {
  const ts = `
declare module 'test' {
  declare function test(err: number): void
}
declare module 'test' {
  declare function test(response: string): string
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
