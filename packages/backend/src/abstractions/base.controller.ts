import type { NextFunction, Request, RequestHandler, Response } from "express";

export type AsyncControllerAction = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<void>;

export abstract class BaseController {
  protected asyncHandler(action: AsyncControllerAction): RequestHandler {
    return (request, response, next) => {
      void action(request, response, next).catch(next);
    };
  }
}
