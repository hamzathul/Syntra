import axios from "axios";
import { getActiveCompany } from "@/lib/auth";

export const erpApi = axios.create({
  baseURL: "/api/proxy/erp",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

erpApi.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    response.data = response.data.data;
  }
  return response;
});

erpApi.interceptors.request.use((config) => {
  const company = getActiveCompany();
  if (company) config.headers["X-Company-Id"] = company.id;
  return config;
});
