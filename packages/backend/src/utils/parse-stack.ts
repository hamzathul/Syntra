import type { ApiErrorDebug } from "shared";

const FRAME_RE = /^\s+at (?:(.+?)\s+\()?(.+):(\d+):(\d+)\)?$/;

export const parseStack = (error: Error): ApiErrorDebug => {
  const lines = (error.stack ?? "").split("\n").slice(1); // drop "ErrorName: message" header

  const stack = lines
    .map((line) => {
      const match = FRAME_RE.exec(line);
      if (!match) return null;
      const [
        ,
        fn = "<anonymous>",
        file = "<unknown>",
        lineStr = "0",
        colStr = "0",
      ] = match;
      return {
        fn: fn.trim(),
        file: file.trim(),
        line: parseInt(lineStr, 10),
        col: parseInt(colStr, 10),
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);

  return { name: error.name, stack };
};
