import type { RequestHandler } from "express";
import { BaseController, V1Response, getAuthenticatedUser } from "backend-p";
import type { UpdateCompanyProfileDto } from "shared";
import type { ICompanyProfileService } from "./company-profile.service.port";

function getCompanyId(locals: Record<string, unknown>): string {
  const id = locals.companyId as string | undefined;
  if (!id) throw new Error("Company ID not found in request context");
  return id;
}

export class CompanyProfileController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(private readonly service: ICompanyProfileService) {
    super();
  }

  readonly get: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const { id: userId } = getAuthenticatedUser(res.locals);
    const profile = await this.service.getProfile(companyId, userId);

    this.v1.success(res, {
      request: req,
      message: "Company profile retrieved successfully",
      data: profile,
    });
  });

  readonly update: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const { id: userId } = getAuthenticatedUser(res.locals);
    const dto = req.body as UpdateCompanyProfileDto;
    const profile = await this.service.updateProfile(companyId, userId, dto);

    this.v1.success(res, {
      request: req,
      message: "Company profile updated successfully",
      data: profile,
    });
  });
}
