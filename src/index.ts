import compiler from "./cli/compiler";
import beautify from "./cli/beautifier";

export { default as compiler } from "./cli/compiler";

export { default as beautify } from "./cli/beautifier";

export default {
  beautify,
  compiler,
};
