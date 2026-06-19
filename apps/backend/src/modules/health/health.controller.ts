import type { RequestHandler } from "express";
import { BaseController, ResponseFactory } from "backend-p";
import type { HealthServicePort } from "./health.service";

export class HealthController extends BaseController {
  private readonly v1Response = ResponseFactory.createV1Response();

  constructor(private readonly healthService: HealthServicePort) {
    super();
  }

  readonly healthCheck: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const health = await this.healthService.getHealthStatus();

      this.v1Response.success(response, {
        request,
        message: "Server is up and running",
        data: health,
      });
    },
  );
}
