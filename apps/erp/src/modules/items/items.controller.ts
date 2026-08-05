import type { RequestHandler } from "express";
import {
  BaseController,
  V1Response,
  getCompanyId,
  getParamId,
} from "backend-p";
import type {
  CreateItemCategoryDto,
  CreateItemDto,
  CreateUnitDto,
  UpdateItemCategoryDto,
  UpdateItemDto,
  UpdateUnitDto,
} from "shared";
import type { IItemService } from "./item.service.port";
import type { IUnitService } from "./unit.service.port";
import type { IItemCategoryService } from "./item-category.service.port";

export class ItemsController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(
    private readonly itemService: IItemService,
    private readonly unitService: IUnitService,
    private readonly categoryService: IItemCategoryService,
  ) {
    super();
  }

  // ── Items ────────────────────────────────────────────────────

  readonly listItems: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const limit = req.query["limit"] ? Math.min(Number(req.query["limit"]), 100) : undefined;
    const cursor = typeof req.query["cursor"] === "string" ? req.query["cursor"] : undefined;
    const result = await this.itemService.list(companyId, { limit, cursor });

    this.v1.success(res, {
      request: req,
      message: "Items retrieved successfully",
      data: result.items,
      pagination: result.meta,
    });
  });

  readonly getItem: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const item = await this.itemService.get(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Item retrieved successfully",
      data: item,
    });
  });

  readonly createItem: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateItemDto;
    const item = await this.itemService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Item created successfully",
      data: item,
    });
  });

  readonly updateItem: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateItemDto;
    const item = await this.itemService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Item updated successfully",
      data: item,
    });
  });

  readonly deleteItem: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.itemService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Item deleted successfully",
      data: null,
    });
  });

  readonly generateItemCode: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const result = await this.itemService.generateCode(companyId);

      this.v1.success(res, {
        request: req,
        message: "Item code generated successfully",
        data: result,
      });
    },
  );

  readonly generateItemBarcode: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const result = await this.itemService.generateBarcode(companyId);

      this.v1.success(res, {
        request: req,
        message: "Barcode generated successfully",
        data: result,
      });
    },
  );

  // ── Categories ───────────────────────────────────────────────

  readonly listCategories: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const categories = await this.categoryService.list(companyId);

      this.v1.success(res, {
        request: req,
        message: "Item categories retrieved successfully",
        data: categories,
      });
    },
  );

  readonly createCategory: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const dto = req.body as CreateItemCategoryDto;
      const category = await this.categoryService.create(companyId, dto);

      this.v1.success(res, {
        request: req,
        statusCode: 201,
        message: "Item category created successfully",
        data: category,
      });
    },
  );

  readonly updateCategory: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const id = getParamId(req, "id");
      const dto = req.body as UpdateItemCategoryDto;
      const category = await this.categoryService.update(id, companyId, dto);

      this.v1.success(res, {
        request: req,
        message: "Item category updated successfully",
        data: category,
      });
    },
  );

  readonly deleteCategory: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const id = getParamId(req, "id");
      await this.categoryService.remove(id, companyId);

      this.v1.success(res, {
        request: req,
        message: "Item category deleted successfully",
        data: null,
      });
    },
  );

  // ── Units ────────────────────────────────────────────────────

  readonly listUnits: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const units = await this.unitService.list(companyId);

    this.v1.success(res, {
      request: req,
      message: "Units retrieved successfully",
      data: units,
    });
  });

  readonly createUnit: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as CreateUnitDto;
    const unit = await this.unitService.create(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Unit created successfully",
      data: unit,
    });
  });

  readonly updateUnit: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    const dto = req.body as UpdateUnitDto;
    const unit = await this.unitService.update(id, companyId, dto);

    this.v1.success(res, {
      request: req,
      message: "Unit updated successfully",
      data: unit,
    });
  });

  readonly deleteUnit: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const id = getParamId(req, "id");
    await this.unitService.remove(id, companyId);

    this.v1.success(res, {
      request: req,
      message: "Unit deleted successfully",
      data: null,
    });
  });
}
