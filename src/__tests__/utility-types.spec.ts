import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle utility types", () => {
  const ts = `
type A = Readonly<{a: number}>
type B = Partial<{a: number}>
type C = NonNullable<string | null>
type D = ReadonlyArray<string>
type E = ReturnType<() => string>
type F = Record<string, number>
type G = ReadonlySet<number>
type H = ReadonlyMap<string, number>

type A1<Readonly> = Readonly
type B1<Partial> = Partial
type C1<NonNullable> = NonNullable
type D1<ReadonlyArray> = ReadonlyArray
type E1<ReturnType> = ReturnType
type F1<Record> = Record

type A2<T> = Readonly<T>
type B2<T> = Partial<T>
type C2<T> = NonNullable<T>
type D2<T> = ReadonlyArray<T>
type E2<T> = ReturnType<() => T>
type F2<T, U> = Record<T, U>
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
