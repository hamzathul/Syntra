import type { RequestHandler } from "express";
import { BaseController, V1Response, getCompanyId, getParamId } from "backend-p";
import type { CreatePartyDto, UpdatePartyDto } from "shared";
import type { IPartyService } from "./party.service.port";

export class PartiesController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(private readonly partyService: IPartyService) {
    super();
  }

  readonly listParties: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const limit = req.query["limit"] ? Math.min(Number(req.query["limit"]), 100) : undefined;
    const cursor = typeof req.query["cursor"] === "string" ? req.query["cursor"] : undefined;
    const result = await this.partyService.list(companyId, { limit, cursor });

    this.v1.success(res, {
      request: req,
      message: "Parties retrieved successfully",
      data: result,
    });
  });

  readonly getParty: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const party = await this.partyService.get(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Party retrieved successfully",
      data: party,
    });
  });

  readonly createParty: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreatePartyDto;
    const party = await this.partyService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Party created successfully",
      data: party,
    });
  });

  readonly updateParty: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdatePartyDto;
    const party = await this.partyService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Party updated successfully",
      data: party,
    });
  });

  readonly deleteParty: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.partyService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Party deleted successfully",
      data: null,
    });
  });
}