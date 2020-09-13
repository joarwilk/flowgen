import type { TypeChecker } from "typescript";

export const checker: {
  current: TypeChecker | null;
} = { current: null };
