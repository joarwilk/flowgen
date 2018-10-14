import compiler from "../cli/compiler";
import beautify from "../cli/beautifier";

it("should handle exported es module functions", () => {
  const ts = `export function routerReducer(state?: RouterState, action?: Action): RouterState;
export function syncHistoryWithStore(history: History, store: Store<any>, options?: SyncHistoryWithStoreOptions): History & HistoryUnsubscribe;
`;
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});

it("should remove this annotation from functions", () => {
  const ts =
    "function addClickListener(onclick: (this: void, e: Event) => void): void;";
  const result = compiler.compileDefinitionString(ts);
  expect(beautify(result)).toMatchSnapshot();
});
