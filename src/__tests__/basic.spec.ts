import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle basic keywords", () => {
  const ts = `type A = {
    a: void,
    b: string,
    c: any,
    d: number,
    e: boolean,
    f: null,
    g: undefined,
    h: object,
    i: 1,
    j: 2,
    k: true,
    l: false,
    m: 'foo',
    n: 'bar',
    o: never,
    p: unknown,
    r: -1,
    s: -2,
    t: symbol,
    u: unique symbol,
    v: readonly [1, 2, 3],
    w: readonly string[],
    x: RegExpMatchArray
  }`;

  {
    const result = compiler.compileDefinitionString(ts, { quiet: true });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }

  {
    const result = compiler.compileDefinitionString(ts, {
      quiet: true,
      inexact: false,
    });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }
});

it("should handle class types", () => {
  const ts = `
  declare export class Foo {
  }`;

  {
    const result = compiler.compileDefinitionString(ts, { quiet: true });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }

  {
    const result = compiler.compileDefinitionString(ts, {
      quiet: true,
      inexact: false,
    });
    expect(beautify(result)).toMatchSnapshot();
    expect(result).toBeValidFlowTypeDeclarations();
  }
});
