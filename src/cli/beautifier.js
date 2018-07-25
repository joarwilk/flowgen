/* @flow */
import prettier from "prettier";

export default function beautify(str: string) {
  return prettier.format(str, { parser: "flow" });
}
