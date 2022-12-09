import { SyntaxKind } from "typescript";

export type ErrorMessage =
  | {
      readonly type: "UnsupportedComputedProperty";
    }
  | {
      readonly type: "UnsupportedUniqueSymbol";
    }
  | {
      readonly type: "UnsupportedConditionalType";
    }
  | {
      readonly type: "UnsupportedGlobalAugmentation";
    }
  | {
      readonly type: "UnsupportedNestedModule";
    }
  | {
      readonly type: "UnsupportedTypeOperator";
      readonly operator: typeof SyntaxKind[keyof typeof SyntaxKind];
    }
  | {
      readonly type: "UnexpectedTsSyntax";
      readonly description: string;
    }
  | {
      readonly type: "FlowgenInternalError";
      readonly description: string;
    }
  | {
      readonly type: "MissingFunctionName";
    };

export function printErrorMessage(error: ErrorMessage): string {
  switch (error.type) {
    case "UnsupportedComputedProperty":
      return "Flow doesn't support computed property names";

    case "UnsupportedUniqueSymbol":
      return "Flow doesn't support `unique symbol`";

    case "UnsupportedConditionalType":
      return "Flow doesn't support conditional types, use `$Call` utility type";

    case "MissingFunctionName":
      return "Flow doesn't support unnamed functions";

    case "UnsupportedGlobalAugmentation":
      return "Flow doesn't support global augmentation";

    case "UnsupportedNestedModule":
      return "Flow doesn't support nested modules";

    case "UnsupportedTypeOperator":
      return `Unsupported type operator: ${SyntaxKind[error.operator]}`;

    case "UnexpectedTsSyntax":
      return `Unexpected TypeScript syntax: ${error.description}. Please report this at https://github.com/joarwilk/flowgen/issues`;

    case "FlowgenInternalError":
      return `Flowgen internal error: ${error.description}. Please report this at https://github.com/joarwilk/flowgen/issues`;

    default:
      error as never;
      return "Unknown error. Please report this in https://github.com/joarwilk/flowgen/issues";
  }
}
