// @flow

import { compiler, beautify } from "..";

it("should handle mapped types", () => {
  const ts = `
type Ref<T> = {current: T | null}
type SourceUnion = 'a' | 'b' | 'c'
type SourceObject = {
  a: number,
  d: string
}
type MappedUnion = {
  [K in SourceUnion]: Ref<number>
}
type MappedObj = {
  [K in keyof SourceObject]: Ref<SourceObject[K]>
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
