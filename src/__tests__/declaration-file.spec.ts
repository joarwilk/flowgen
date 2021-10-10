import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle basic keywords", () => {
  const ts = `
declare interface A {
  bar: string
}

export declare const ok: number
  `;

  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    asModule: "test",
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});

it("should handle basic keywords  cll", () => {
  const ts = `
  declare module 'test' {
    interface A {
      bar: string
    }
    export const ok: number
  }`;

  const result = compiler.compileDefinitionString(ts, {
    quiet: true,
    asModule: "test",
  });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
