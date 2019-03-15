//@flow

import util from "util";

// TODO: pull request promisify types to flow

declare export function promisify<TResult>(
  fn: (callback: (err: ?Error, result: TResult) => void) => void,
): () => Promise<TResult>;
declare export function promisify(
  fn: (callback: (err?: ?Error) => void) => void,
): () => Promise<void>;
declare export function promisify<T1, TResult>(
  fn: (arg1: T1, callback: (err: ?Error, result: TResult) => void) => void,
): (arg1: T1) => Promise<TResult>;
declare export function promisify<T1>(
  fn: (arg1: T1, callback: (err?: ?Error) => void) => void,
): (arg1: T1) => Promise<void>;
declare export function promisify<T1, T2, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    callback: (err: ?Error, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2) => Promise<TResult>;
declare export function promisify<T1, T2>(
  fn: (arg1: T1, arg2: T2, callback: (err?: ?Error) => void) => void,
): (arg1: T1, arg2: T2) => Promise<void>;
declare export function promisify<T1, T2, T3, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    callback: (err: ?Error, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3) => Promise<TResult>;
declare export function promisify<T1, T2, T3>(
  fn: (arg1: T1, arg2: T2, arg3: T3, callback: (err?: ?Error) => void) => void,
): (arg1: T1, arg2: T2, arg3: T3) => Promise<void>;
declare export function promisify<T1, T2, T3, T4, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    callback: (err: ?Error, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<TResult>;
declare export function promisify<T1, T2, T3, T4>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    callback: (err?: ?Error) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<void>;
declare export function promisify<T1, T2, T3, T4, T5, TResult>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    callback: (err: ?Error, result: TResult) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<TResult>;
declare export function promisify<T1, T2, T3, T4, T5>(
  fn: (
    arg1: T1,
    arg2: T2,
    arg3: T3,
    arg4: T4,
    arg5: T5,
    callback: (err?: ?Error) => void,
  ) => void,
): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<void>;
declare export function promisify(f: Function): Function;
export function promisify(f: Function): Function {
  return util.promisify(f);
}
