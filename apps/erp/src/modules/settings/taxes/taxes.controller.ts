import type { RequestHandler } from "express";
import { BaseController, ResponseFactory, getAuthenticatedUser } from "backend-p";
import type { CreateTaxRateDto, UpdateTaxRateDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";
import type { ITaxRateService } from "./tax-rate.service.port";
import type { ITaxGroupService } from "./tax-group.service.port";

function getCompanyId(locals: Record<string, unknown>): string {
  const id = locals.companyId as string | undefined;
  if (!id) throw new Error("Company ID not found in request context");
  return id;
}

function getParamId(req: { params: Record<string, string | undefined> }, name: string): string {
  const id = req.params[name];
  if (!id) throw new Error(`${name} parameter is required`);
  return id;
}

export class TaxesController extends BaseController {
  private readonly v1 = ResponseFactory.createV1Response();

  constructor(
    private readonly taxRateService: ITaxRateService,
    private readonly taxGroupService: ITaxGroupService,
  ) {
    super();
  }

  readonly listRates: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const rates = await this.taxRateService.list(companyId);

    this.v1.success(res, {
      request: req,
      message: "Tax rates retrieved successfully",
      data: rates,
    });
  });

  readonly createRate: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateTaxRateDto;
    const rate = await this.taxRateService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Tax rate created successfully",
      data: rate,
    });
  });

  readonly updateRate: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateTaxRateDto;
    const rate = await this.taxRateService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Tax rate updated successfully",
      data: rate,
    });
  });

  readonly deleteRate: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.taxRateService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Tax rate deleted successfully",
      data: null,
    });
  });

  readonly listGroups: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const groups = await this.taxGroupService.list(companyId);

    this.v1.success(res, {
      request: req,
      message: "Tax groups retrieved successfully",
      data: groups,
    });
  });

  readonly createGroup: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateTaxGroupDto;
    const group = await this.taxGroupService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Tax group created successfully",
      data: group,
    });
  });

  readonly updateGroup: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateTaxGroupDto;
    const group = await this.taxGroupService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Tax group updated successfully",
      data: group,
    });
  });

  readonly deleteGroup: RequestHandler = this.asyncHandler(async (req, res) => {
    getAuthenticatedUser(res.locals);
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.taxGroupService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Tax group deleted successfully",
      data: null,
    });
  });
}
