import axios from "axios";
import { getToken } from "@/lib/auth";

export const erpApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ERP_API_URL ?? "http://localhost:3002/api/v1",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

erpApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
