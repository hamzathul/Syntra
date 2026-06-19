import type { Response } from "express";
import type { AuthUserDto } from "shared";
import { UnauthorizedError } from "../errors/http-errors";

const AUTH_LOCAL_KEY = "authUser";

export type AuthenticatedUser = AuthUserDto;

export interface AuthLocals {
  readonly authUser?: AuthenticatedUser;
}

type MutableAuthLocals = {
  authUser?: AuthenticatedUser;
};

export const setAuthenticatedUser = (
  response: Response<unknown, MutableAuthLocals>,
  user: AuthenticatedUser,
): void => {
  response.locals[AUTH_LOCAL_KEY] = user;
};

export const getAuthenticatedUser = (locals: AuthLocals): AuthenticatedUser => {
  if (locals.authUser === undefined) {
    throw new UnauthorizedError();
  }

  return locals.authUser;
};
