//@flow

import type { SourceFile } from "typescript";
import { opts } from "./options";
import path from "path";
import { codeFrameColumns } from "@babel/code-frame";
import { getChalk } from "@babel/highlight";

const sourceFile: { current: SourceFile | null } = { current: null };

export function setSourceFile(file: SourceFile) {
  sourceFile.current = file;
}

export function error(node: any, message: string) {
  if (opts().quiet) return;
  if (sourceFile.current) {
    const options = {
      highlightCode: true,
      message,
    };
    const chalk = getChalk(options);
    const code = sourceFile.current.text;
    const tsStartLocation = sourceFile.current.getLineAndCharacterOfPosition(
      node.getStart(sourceFile.current),
    );
    const tsEndLocation = sourceFile.current.getLineAndCharacterOfPosition(
      node.getEnd(),
    );
    const babelLocation = {
      start: {
        line: tsStartLocation.line + 1,
        column: tsStartLocation.character + 1,
      },
      end: {
        line: tsEndLocation.line + 1,
        column: tsEndLocation.character + 1,
      },
    };
    const result = codeFrameColumns(code, babelLocation, options);
    const position = `:${babelLocation.start.line}:${
      babelLocation.start.column
    }`;
    const fileName = path.relative(process.cwd(), sourceFile.current.fileName);
    console.log(
      chalk.red.bold(
        `Error ${"-".repeat(
          process.stdout.columns - 7 - fileName.length - position.length,
        )} ${fileName}${position}`,
      ),
    );
    console.log("\n");
    console.log(result);
    console.log("\n");
  } else {
    console.log(message);
  }
}
