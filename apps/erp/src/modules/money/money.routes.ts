import { Router } from "express";
import { validateRequest } from "backend-p";
import { z } from "zod";
import {
  adjustBankSchema,
  adjustCashSchema,
  createTransferSchema,
} from "shared";
import type { MoneyController } from "./money.controller";

const paramsWithBankId = z.object({ bankId: z.string().min(1) });
const paramsWithAdjustmentId = z.object({ adjustmentId: z.string().min(1) });
const paramsWithBankIdAndAdjustmentId = z.object({
  bankId: z.string().min(1),
  adjustmentId: z.string().min(1),
});
const paramsWithTransferId = z.object({ transferId: z.string().min(1) });

export function createMoneyRouter(controller: MoneyController): Router {
  const router = Router();

  router.get("/cash", controller.getCash);
  router.post(
    "/cash/adjust",
    validateRequest({ body: adjustCashSchema }),
    controller.adjustCash,
  );
  router.patch(
    "/cash/adjustments/:adjustmentId",
    validateRequest({ params: paramsWithAdjustmentId, body: adjustCashSchema }),
    controller.updateCashAdjustment,
  );
  router.delete(
    "/cash/adjustments/:adjustmentId",
    validateRequest({ params: paramsWithAdjustmentId }),
    controller.deleteCashAdjustment,
  );

  router.post(
    "/transfers",
    validateRequest({ body: createTransferSchema }),
    controller.createTransfer,
  );
  router.patch(
    "/transfers/:transferId",
    validateRequest({ params: paramsWithTransferId, body: createTransferSchema }),
    controller.updateTransfer,
  );
  router.delete(
    "/transfers/:transferId",
    validateRequest({ params: paramsWithTransferId }),
    controller.deleteTransfer,
  );

  router.post(
    "/banks/:bankId/adjust",
    validateRequest({ params: paramsWithBankId, body: adjustBankSchema }),
    controller.adjustBank,
  );
  router.patch(
    "/banks/:bankId/adjustments/:adjustmentId",
    validateRequest({
      params: paramsWithBankIdAndAdjustmentId,
      body: adjustBankSchema,
    }),
    controller.updateBankAdjustment,
  );
  router.delete(
    "/banks/:bankId/adjustments/:adjustmentId",
    validateRequest({ params: paramsWithBankIdAndAdjustmentId }),
    controller.deleteBankAdjustment,
  );
  router.get(
    "/banks/:bankId/movements",
    validateRequest({ params: paramsWithBankId }),
    controller.getBankHistory,
  );

  return router;
}