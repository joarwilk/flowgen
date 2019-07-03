// @flow

export type ErrorMessage =
  | {|
      +type: "UnsupportedComputedProperty",
    |}
  | {|
      +type: "UnsupportedBigInt",
    |}
  | {|
      +type: "UnsupportedUniqueSymbol",
    |}
  | {|
      +type: "UnsupportedConditionalType",
    |}
  | {|
      +type: "MissingFunctionName",
    |};

export function printErrorMessage(error: ErrorMessage): string {
  switch (error.type) {
    case "UnsupportedComputedProperty":
      return "Flow doesn't support computed property names";

    case "UnsupportedBigInt":
      return "Flow doesn't support BigInt proposal: https://github.com/facebook/flow/issues/6639";

    case "UnsupportedUniqueSymbol":
      return "Flow doesn't support `unique symbol`";

    case "UnsupportedConditionalType":
      return "Flow doesn't support conditional types, use `$Call` utility type";

    case "MissingFunctionName":
      return "Flow doesn't support unnamed functions";

    default:
      (error.type: empty);
      return "Unknown error. Please report this in https://github.com/joarwilk/flowgen/issues";
  }
}
