import axios from "axios";
import { getActiveCompany } from "@/lib/auth";

export const aiApi = axios.create({
  baseURL: "/api/proxy/ai",
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

aiApi.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    response.data = response.data.data;
  }
  return response;
});

aiApi.interceptors.request.use((config) => {
  const company = getActiveCompany();
  if (company) config.headers["X-Company-Id"] = company.id;
  return config;
});
