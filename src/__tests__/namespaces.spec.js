// @flow

import { compiler, beautify } from "..";

describe("should handle merging with other types", () => {
  describe("function", () => {
    test("interface", () => {
      const ts = `
declare function test(foo: number): string;
namespace test {
  export interface Foo {
    bar: number
  }
}
`;
      const result = compiler.compileDefinitionString(ts);
      expect(beautify(result)).toMatchSnapshot();
    })

    test("type", () => {
      const ts = `
declare function test(foo: number): string;
namespace test {
  export type Foo = {
    bar: number
  }
}
`;
      const result = compiler.compileDefinitionString(ts);
      expect(beautify(result)).toMatchSnapshot();
    })

    test("const", () => {
      const ts = `
declare function test(foo: number): string;
namespace test {
  export const ok: number
}
`;
      const result = compiler.compileDefinitionString(ts);
      expect(beautify(result)).toMatchSnapshot();
    })
  });

  test("class", () => {
    const ts = `
// TODO: implement class merging
declare class Album {
  label: Album.AlbumLabel;
}
namespace Album {
  export declare class AlbumLabel { }
}
`;
    const result = compiler.compileDefinitionString(ts);
    expect(beautify(result)).toMatchSnapshot();
  });

  test("enum", () => {
    const ts = `
// TODO: implement enum merging
enum Color {
  red = 1,
  green = 2,
  blue = 4
}
namespace Color {
  export declare function mixColor(colorName: string): number;
}
`;
    const result = compiler.compileDefinitionString(ts);
    expect(beautify(result)).toMatchSnapshot();
  });
});

it("should handle namespaces", () => {
  const ts = `
namespace test {
  export const ok: number
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle namespace merging", () => {
  const ts = `
namespace test {
  export const ok: number
}
namespace test {
  export const error: string
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle namespace function merging", () => {
  const ts = `
namespace test {
  declare function test(err: number): void
}
namespace test {
  declare function test(response: string): string
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle exported interfaces and types", () => {
  const ts = `
namespace Example {
  export interface StoreModel<S> {}
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle nested namespaces", () => {
  const ts = `
import * as external from "external";

declare namespace E0 {
  type A = external.type;
  namespace U1 {
    declare interface S3 {
      a: string;
    }
  }
  namespace U1 {
    declare var e2: number;
    enum E2 {
      E = 1,
    }
    declare interface S3 {
      b: string;
    }
    namespace D1 {
      namespace S2 {
        declare interface S3 {
          b: string;
        }
        declare var n3: symbol;
        class N3 {}
      }
    }
    namespace DD1 {
      namespace S2 {
        declare interface S3 {
          e: number;
        }
      }
    }
  }
  namespace S1 {
    declare var m3: string;
  }
  declare var s1: string;
}
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

test("should handle qualified namespaces", () => {
  const ts = `
declare namespace A.B {
  interface S<A> {
    readonly d: A;
    b: number;
  }
  declare class D<S> {}
}

declare namespace A.B.C {
  declare class N<A> extends D<A> implements S<A> {
    a: string;
  }
}`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

test("should handle global augmentation", () => {
  const ts = `
declare global {
  interface Array<T> {}
}`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});

test("should handle import equals declaration", () => {
  const ts = `
import hello = A.B;
`;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
});
