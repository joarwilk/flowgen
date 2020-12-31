import { compiler, beautify } from "..";

it("should handle single interface", () => {
  const ts = `
interface User {
  firstName: string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
});

it("should handle interface inheritance", () => {
  const ts = `
interface User {
  firstName: string
}
interface SpecialUser extends User {
  nice: number
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
  const result3 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
    inexact: false,
  });
  expect(beautify(result3)).toMatchSnapshot();
});

it("should handle interface merging", () => {
  const ts = `
interface User {
  firstName: string
}
interface User {
  lastName: string
}
interface User {
  username: string
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
  const result2 = compiler.compileDefinitionString(ts, {
    interfaceRecords: true,
  });
  expect(beautify(result2)).toMatchSnapshot();
});

it("should handle all properties", () => {
  const ts = `
interface Props {
  "aria-label": string;
  "aria-labelledby"?: number;
  color: string;
  [key: string]: string;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should support readonly modifier", () => {
  const ts = `
interface Helper {
  readonly name: string;
  readonly callback(): void;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should support call signature", () => {
  const ts = `
  declare interface ObjectSchemaConstructor {
    <T extends object>(fields?: ObjectSchemaDefinition<T>): ObjectSchema<T>;
    new (): ObjectSchema<{}>;
  }
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove this in call signature", () => {
  const ts = `
interface Arc<This, Datum> {
  (this: This, d: Datum, ...args: any[]): string | null;
}
  
interface D<This, Datum> {
  new (this: This, d: Datum, ...args: any[]);
}
  
interface C<This, Datum> {
  (this: This, d: Datum, ...args: any[]);
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove generic defaults in call signature", () => {
  const ts = `
interface AbstractLevelDOWNConstructor {
    <K = any, V = any>(location: string): AbstractLevelDOWN<K, V>;
}  
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should support omitting generic defaults in types, classes, interfaces", () => {
  const ts = `
interface Foo<T = symbol, U = number> {}
interface FooBar extends Foo {}
type Bar<T = number, U = string> = {}
class Baz<T = string, U = number> {}

declare var a: Foo
declare var b: Bar
declare var c: Baz

declare var d: Foo<any>
declare var e: Bar<any>
declare var f: Baz<any>
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should support optional methods", () => {
  const ts = `
interface Example<State> {
  required<R>(value: any, state: State): true;
  optional?<R>(value: any, state: State): false;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle toString property name", () => {
  const ts = `
interface A {
  toString(): string;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle untyped object binding pattern", () => {
  const ts = `
interface ObjectBinding {
  (): void;
  ({}): void;
  ({ a, b }): void;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle untyped array binding pattern", () => {
  const ts = `
interface ArrayBinding {
  (): void;
  ([]): void;
  ([ a, b ]): void;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle typed object binding pattern", () => {
  const ts = `
interface ObjectBinding {
  (): void;
  ({}: any): void;
  ({ a, b }: { a: string, b: number }): void;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle typed array binding pattern", () => {
  const ts = `
interface ArrayBinding {
  (): void;
  ([]: []): void;
  ([ a, b ]: [string, number]): void;
}
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
