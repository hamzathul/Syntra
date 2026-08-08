import type { RequestHandler } from "express";
import { BaseController, V1Response, getCompanyId, getParamId } from "backend-p";
import type { CreateBankDto, UpdateBankDto } from "shared";
import type { IBankService } from "./bank.service.port";

export class BanksController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(private readonly bankService: IBankService) {
    super();
  }

  readonly list: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const banks = await this.bankService.list(companyId);

    this.v1.success(res, {
      request: req,
      message: "Banks retrieved successfully",
      data: banks,
    });
  });

  readonly create: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateBankDto;
    const bank = await this.bankService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Bank created successfully",
      data: bank,
    });
  });

  readonly update: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateBankDto;
    const bank = await this.bankService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Bank updated successfully",
      data: bank,
    });
  });

  readonly delete: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.bankService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Bank deleted successfully",
      data: null,
    });
  });
}