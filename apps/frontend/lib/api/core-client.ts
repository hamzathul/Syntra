import axios, { type AxiosError } from "axios";
import { getToken } from "@/lib/auth";

export const coreApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_CORE_API_URL ?? "http://localhost:3001/api/v1",
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

coreApi.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface ApiSuccessResponse<T> {
  status: "success";
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  status: "error";
  message: string;
  error: { code: string };
}

export interface AuthTokenDto {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
}

export interface AuthUserDto {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export interface AuthSessionDto {
  user: AuthUserDto;
  token: AuthTokenDto;
}

export const getApiErrorMessage = (error: unknown): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  return axiosError.response?.data?.message ?? "Something went wrong";
};

export const authApi = {
  login: (data: { email: string; password: string }) =>
    coreApi.post<ApiSuccessResponse<AuthSessionDto>>("/auth/login", data),
  register: (data: { name: string; email: string; password: string }) =>
    coreApi.post<ApiSuccessResponse<AuthSessionDto>>("/auth/register", data),
  me: () => coreApi.get<ApiSuccessResponse<AuthUserDto>>("/auth/me"),
};
