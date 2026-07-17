import type { RequestHandler } from "express";
import { BaseController, ResponseFactory, getAuthenticatedUser } from "backend-p";
import type { UpdateGeneralSettingsDto } from "shared";
import type { IGeneralSettingsService } from "./general-settings.service.port";

function getCompanyId(locals: Record<string, unknown>): string {
  const id = locals.companyId as string | undefined;
  if (!id) throw new Error("Company ID not found in request context");
  return id;
}

export class GeneralSettingsController extends BaseController {
  private readonly v1 = ResponseFactory.createV1Response();

  constructor(private readonly service: IGeneralSettingsService) {
    super();
  }

  readonly get: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    getAuthenticatedUser(res.locals);
    const settings = await this.service.getSettings(companyId);

    this.v1.success(res, {
      request: req,
      message: "General settings retrieved successfully",
      data: settings,
    });
  });

  readonly update: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    getAuthenticatedUser(res.locals);
    const dto = req.body as UpdateGeneralSettingsDto;
    const settings = await this.service.updateSettings(companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "General settings updated successfully",
      data: settings,
    });
  });
}
