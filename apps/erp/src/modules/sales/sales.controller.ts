import type { RequestHandler } from "express";
import { BaseController, V1Response, getCompanyId, getParamId } from "backend-p";
import type { CreateSaleDto, UpdateSaleDto } from "shared";
import type { ISaleService } from "./sale.service.port";

export class SalesController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(private readonly saleService: ISaleService) {
    super();
  }

  readonly listSales: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const limit =
      req.query["limit"] === undefined ? undefined : Number(req.query["limit"]);
    const cursor =
      typeof req.query["cursor"] === "string" ? req.query["cursor"] : undefined;
    const result = await this.saleService.list(companyId, { limit, cursor });

    this.v1.success(res, {
      request: req,
      message: "Sales retrieved successfully",
      data: result,
    });
  });

  readonly getSale: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const sale = await this.saleService.get(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Sale retrieved successfully",
      data: sale,
    });
  });

  readonly createSale: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateSaleDto;
    const sale = await this.saleService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Sale created successfully",
      data: sale,
    });
  });

  readonly updateSale: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateSaleDto;
    const sale = await this.saleService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Sale updated successfully",
      data: sale,
    });
  });

  readonly deleteSale: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.saleService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Sale deleted successfully",
      data: null,
    });
  });
}
