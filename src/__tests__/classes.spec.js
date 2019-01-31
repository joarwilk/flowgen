import {compiler, beautify} from "..";

it("should handle static methods ES6 classes", () => {
  const ts = `class Observable<T> implements Subscribable<T> {
    create: Function;
    static create: Function;
    lift<R>(operator: Operator<T, R>): Observable<R>;
    static lift<R>(operator: Operator<T, R>): Observable<R>;
  }`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
