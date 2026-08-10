import type { BankDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createCrud } from "../../client/crud-factory";

export const banksService = createCrud<BankDto>(erpApi, "/banks");