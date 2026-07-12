import type { RequestHandler } from "express";
import { BaseController, ResponseFactory, getAuthenticatedUser } from "backend-p";
import type { CreateCompanyDto } from "shared";
import type { ICompanyService } from "./company.service.port";

export class CompanyController extends BaseController {
  private readonly v1 = ResponseFactory.createV1Response();

  constructor(private readonly companyService: ICompanyService) {
    super();
  }

  readonly create: RequestHandler = this.asyncHandler(async (req, res) => {
    const userId = getAuthenticatedUser(res.locals).id;
    const dto = req.body as CreateCompanyDto;
    const company = await this.companyService.createCompany(dto, userId);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Company created successfully",
      data: company,
    });
  });

  readonly list: RequestHandler = this.asyncHandler(async (req, res) => {
    const userId = getAuthenticatedUser(res.locals).id;
    const companies = await this.companyService.getUserCompanies(userId);

    this.v1.success(res, {
      request: req,
      message: "Companies retrieved successfully",
      data: companies,
    });
  });
}
