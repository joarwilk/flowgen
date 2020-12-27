import { compiler, beautify } from "..";
import "../test-matchers";

it("should handle static methods ES6 classes", () => {
  const ts = `
  class Subscribable<T> {}
  class Operator<T, R> {}
  class Observable<T> implements Subscribable<T> {
    create: Function;
    static create: Function;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    static lift<R>(operator: Operator<T, R>): Observable<R>;
    readonly foo: number;
    static readonly bar: string;
    baz?: string;
    readonly quux?: number;
    static quick?: symbol;
    static readonly fox?: string;
    jump?(): void;
    readonly jump?(): void;
    static readonly jump?(): void;
    protected get cfnProperties(): {
      [key: string]: any;
    };
  }
  `;
  const result = compiler.compileDefinitionString(ts, { quiet: true });
  expect(beautify(result)).toMatchSnapshot();
  expect(result).toBeValidFlowTypeDeclarations();
});
