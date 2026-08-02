import axios from "axios";
import type { ApiErrorResponse, AuthUserDto } from "shared";

export const coreApi = axios.create({
  baseURL: "/api/proxy/core",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

coreApi.interceptors.response.use((response) => {
  if (
    response.data &&
    typeof response.data === "object" &&
    "data" in response.data
  ) {
    response.data = response.data.data;
  }
  return response;
});

export const authApi = {
  me: () => coreApi.get<AuthUserDto>("/auth/me"),
};

export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as ApiErrorResponse | undefined)
      ?.message;
    return message || error.message || "Something went wrong";
  }
  if (error && typeof error === "object" && "message" in error) {
    return (error as { message: string }).message;
  }
  return "Something went wrong";
};
