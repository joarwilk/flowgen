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
  }`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
