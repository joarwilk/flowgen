import "typescript";
// declare typescript internals used by flowgen but not directly exported
// eslint-disable-next-line @typescript-eslint/no-namespace
declare module "typescript" {
  interface Symbol {
    parent?: Symbol;
  }
  enum SymbolFormatFlags {
    DoNotIncludeSymbolChain,
  }
}
