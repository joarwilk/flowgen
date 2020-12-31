import { execFileSync } from "child_process";

import chalk from "chalk";
import flow from "flow-bin";

import { beautify } from ".";

// eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
    interface Matchers<R> {
      toBeValidFlowTypeDeclarations(): R;
    }
  }
}

expect.extend({
  toBeValidFlowTypeDeclarations(source) {
    const beautifiedSource = beautify(source);
    try {
      execFileSync(
        flow,
        ["check-contents", "--all", "--color=always", "--timeout=30"],
        {
          input: beautifiedSource,
          stdio: ["pipe", "pipe", "pipe"],
        },
      );
    } catch (err) {
      return {
        message: () =>
          `expected ${chalk.bold(
            beautifiedSource.trimEnd(),
          )} to be valid flow:\n${chalk.red(err.stdout)}`,
        pass: false,
      };
    }

    return {
      message: () =>
        `expected ${chalk.bold(
          beautifiedSource.trimEnd(),
        )} not to be valid flow`,
      pass: true,
    };
  },
});
