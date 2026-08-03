import type { Request } from "express";
import { BadRequestError } from "../errors/http-errors";

export const getParamId = (
  request: Pick<Request, "params">,
  name: string,
): string => {
  const id = request.params[name];
  if (id === undefined) {
    throw new BadRequestError(`${name} parameter is required`);
  }

  return id;
};
