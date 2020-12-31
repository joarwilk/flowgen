import { compiler, beautify } from "..";
import "../test-matchers";

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
type ConstantKey = MappedObj["a"]
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
