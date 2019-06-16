// @flow

import { compiler, beautify } from "..";

it("should handle exported es module functions", () => {
  const ts = `export function routerReducer(state?: RouterState, action?: Action): RouterState;
export function syncHistoryWithStore(history: History, store: Store<any>, options?: SyncHistoryWithStoreOptions): History & HistoryUnsubscribe;
`;
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle toString function overload", () => {
  const ts = `export function toString(): void;
export function toString(e: number): void;
export function toString(b: string): void;
`;
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle default exported es module functions", () => {
  const ts = `export default function routerReducer(state?: RouterState, action?: Action): RouterState;`;
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});

it("should handle function overload es module functions", () => {
  const ts = `export function routerReducer(state?: RouterState, action?: Action): RouterState;
export function routerReducer(state?: RouterState): RouterState;
`;
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove this annotation from functions", () => {
  const ts =
    "function addClickListener(onclick: (this: void, e: Event) => void): void;";
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove default parameters from functions", () => {
  const ts =
    "function addClickListener<T = Error>(onclick: (e: Event) => void): T;";
  const result = compiler.compileDefinitionString(ts, {quiet: true});
  expect(beautify(result)).toMatchSnapshot();
});
