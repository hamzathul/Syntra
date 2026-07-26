import type { CompanyDto } from "shared";
import { erpApi } from "../client/erp-client";
import { createListCreate } from "../client/crud-factory";

export const companyService = createListCreate<CompanyDto>(erpApi, "/companies");
