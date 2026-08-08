import type { PartyDto } from "shared";
import { erpApi } from "../../client/erp-client";
import { createPaginatedCrud } from "../../client/crud-factory";

export const partiesService = {
  parties: createPaginatedCrud<PartyDto>(erpApi, "/parties"),
};