import util from "util";

// TODO: pull request promisify types to flow
// TODO: fix types for multiple arguments

export function promisify<TResult>(
  fn: (
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): () => Promise<TResult>;

export function promisify(
  fn: (callback: (err?: ErrnoError | null) => void) => void,
): () => Promise<void>;

export function promisify<T1, TResult>(
  fn: (
    arg1: T1,
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): (arg1: T1) => Promise<TResult>;

export function promisify<T1>(
  fn: (arg1: T1, callback: (err?: ErrnoError | null) => void) => void,
): (arg1: T1) => Promise<void>;

export function promisify<T1, T2, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2) => Promise<TResult>;

export function promisify<T1, T2>(
  fn: (arg1: T1, arg2: T2, callback: (err?: ErrnoError | null) => void) => void,
): (arg1: T1, arg2: T2) => Promise<void>;

export function promisify<T1, T2, T3, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;

export function promisify<T1, T2, T3>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    callback: (err?: ErrnoError | null) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3) => Promise<void>;

export function promisify<T1, T2, T3, T4, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;

export function promisify<T1, T2, T3, T4>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    callback: (err?: ErrnoError | null) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<void>;

export function promisify<T1, T2, T3, T4, T5, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    callback: (err: ErrnoError | undefined | null, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TResult>;

export function promisify<T1, T2, T3, T4, T5>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    callback: (err?: ErrnoError | null) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<void>;

export function promisify(f: Function): Function;
export function promisify(f: Function): Function {
  return util.promisify(f);
}
