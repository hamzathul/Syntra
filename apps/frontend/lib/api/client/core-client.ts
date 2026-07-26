import axios, { type AxiosError } from "axios";
import type { ApiErrorResponse, AuthUserDto } from "shared";

export const coreApi = axios.create({
  baseURL: "/api/proxy/core",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

coreApi.interceptors.response.use((response) => {
  if (response.data && typeof response.data === "object" && "data" in response.data) {
    response.data = response.data.data;
  }
  return response;
});

export const authApi = {
  me: () => coreApi.get<AuthUserDto>("/auth/me"),
};

export const getApiErrorMessage = (error: unknown): string => {
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? "Something went wrong";
};
