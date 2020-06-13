import type { TypeChecker } from "typescript";

export let checker: {
  current: TypeChecker | null;
} = { current: null };
