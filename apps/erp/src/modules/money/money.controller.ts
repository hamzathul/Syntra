import type { RequestHandler } from "express";
import {
  BaseController,
  V1Response,
  getCompanyId,
  getParamId,
} from "backend-p";
import type {
  AdjustBankDto,
  AdjustCashDto,
  CreateTransferDto,
} from "shared";
import type { IMoneyService } from "./money.service.port";

export class MoneyController extends BaseController {
  private readonly v1 = V1Response.getInstance();

  constructor(private readonly moneyService: IMoneyService) {
    super();
  }

  readonly getCash: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const summary = await this.moneyService.getCashSummary(companyId);

    this.v1.success(res, {
      request: req,
      message: "Cash summary retrieved successfully",
      data: summary,
    });
  });

  readonly adjustCash: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const dto = req.body as AdjustCashDto;
    const adjustment = await this.moneyService.adjustCash(companyId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Cash adjusted successfully",
      data: adjustment,
    });
  });

  readonly updateCashAdjustment: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const adjustmentId = getParamId(req, "adjustmentId");
      const dto = req.body as AdjustCashDto;
      const adjustment = await this.moneyService.updateCashAdjustment(
        companyId,
        adjustmentId,
        dto,
      );

      this.v1.success(res, {
        request: req,
        message: "Cash adjustment updated successfully",
        data: adjustment,
      });
    },
  );

  readonly deleteCashAdjustment: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const adjustmentId = getParamId(req, "adjustmentId");
      await this.moneyService.deleteCashAdjustment(companyId, adjustmentId);

      this.v1.success(res, {
        request: req,
        message: "Cash adjustment deleted successfully",
        data: null,
      });
    },
  );

  readonly adjustBank: RequestHandler = this.asyncHandler(async (req, res) => {
    const companyId = getCompanyId(res.locals);
    const bankId = getParamId(req, "bankId");
    const dto = req.body as AdjustBankDto;
    const adjustment = await this.moneyService.adjustBank(companyId, bankId, dto);

    this.v1.success(res, {
      request: req,
      statusCode: 201,
      message: "Bank balance adjusted successfully",
      data: adjustment,
    });
  });

  readonly updateBankAdjustment: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const bankId = getParamId(req, "bankId");
      const adjustmentId = getParamId(req, "adjustmentId");
      const dto = req.body as AdjustBankDto;
      const adjustment = await this.moneyService.updateBankAdjustment(
        companyId,
        bankId,
        adjustmentId,
        dto,
      );

      this.v1.success(res, {
        request: req,
        message: "Bank adjustment updated successfully",
        data: adjustment,
      });
    },
  );

  readonly deleteBankAdjustment: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const bankId = getParamId(req, "bankId");
      const adjustmentId = getParamId(req, "adjustmentId");
      await this.moneyService.deleteBankAdjustment(
        companyId,
        bankId,
        adjustmentId,
      );

      this.v1.success(res, {
        request: req,
        message: "Bank adjustment deleted successfully",
        data: null,
      });
    },
  );

  readonly createTransfer: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const dto = req.body as CreateTransferDto;
      const transfer = await this.moneyService.createTransfer(companyId, dto);

      this.v1.success(res, {
        request: req,
        statusCode: 201,
        message: "Transfer created successfully",
        data: transfer,
      });
    },
  );

  readonly updateTransfer: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const transferId = getParamId(req, "transferId");
      const dto = req.body as CreateTransferDto;
      const transfer = await this.moneyService.updateTransfer(
        companyId,
        transferId,
        dto,
      );

      this.v1.success(res, {
        request: req,
        message: "Transfer updated successfully",
        data: transfer,
      });
    },
  );

  readonly deleteTransfer: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const transferId = getParamId(req, "transferId");
      await this.moneyService.deleteTransfer(companyId, transferId);

      this.v1.success(res, {
        request: req,
        message: "Transfer deleted successfully",
        data: null,
      });
    },
  );

  readonly getBankHistory: RequestHandler = this.asyncHandler(
    async (req, res) => {
      const companyId = getCompanyId(res.locals);
      const bankId = getParamId(req, "bankId");
      const history = await this.moneyService.getBankHistory(companyId, bankId);

      this.v1.success(res, {
        request: req,
        message: "Bank history retrieved successfully",
        data: history,
      });
    },
  );
}
