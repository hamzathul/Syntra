import type { TaxRateDto, CreateTaxRateDto, UpdateTaxRateDto, TaxGroupDto, CreateTaxGroupDto, UpdateTaxGroupDto } from "shared";
import { erpApi } from "../../client/erp-client";

export const taxesService = {
  listRates: (): Promise<TaxRateDto[]> =>
    erpApi.get<TaxRateDto[]>("/settings/taxes/rates").then((r) => r.data),

  createRate: (dto: CreateTaxRateDto): Promise<TaxRateDto> =>
    erpApi.post<TaxRateDto>("/settings/taxes/rates", dto).then((r) => r.data),

  updateRate: (id: string, dto: UpdateTaxRateDto): Promise<TaxRateDto> =>
    erpApi.patch<TaxRateDto>(`/settings/taxes/rates/${id}`, dto).then((r) => r.data),

  deleteRate: (id: string): Promise<void> =>
    erpApi.delete(`/settings/taxes/rates/${id}`).then((r) => r.data),

  listGroups: (): Promise<TaxGroupDto[]> =>
    erpApi.get<TaxGroupDto[]>("/settings/taxes/groups").then((r) => r.data),

  createGroup: (dto: CreateTaxGroupDto): Promise<TaxGroupDto> =>
    erpApi.post<TaxGroupDto>("/settings/taxes/groups", dto).then((r) => r.data),

  updateGroup: (id: string, dto: UpdateTaxGroupDto): Promise<TaxGroupDto> =>
    erpApi.patch<TaxGroupDto>(`/settings/taxes/groups/${id}`, dto).then((r) => r.data),

  deleteGroup: (id: string): Promise<void> =>
    erpApi.delete(`/settings/taxes/groups/${id}`).then((r) => r.data),
};
