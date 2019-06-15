// @flow

import { compiler, beautify } from "..";

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
  }`;
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});
