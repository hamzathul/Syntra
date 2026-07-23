import axios, { type AxiosError } from "axios";
import type {
  ApiSuccessResponse,
  ApiErrorResponse,
  AuthUserDto,
} from "shared";

export const coreApi = axios.create({
  baseURL: "/api/proxy/core",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axios.post<ApiSuccessResponse<{ user: AuthUserDto }>>("/api/auth/login", data),
  register: (data: { name: string; email: string; password: string }) =>
    axios.post<ApiSuccessResponse<{ user: AuthUserDto }>>("/api/auth/register", data),
  me: () => coreApi.get<ApiSuccessResponse<AuthUserDto>>("/auth/me"),
};

export const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? "Something went wrong";
};
