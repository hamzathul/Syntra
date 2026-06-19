import axios from "axios";
import { env } from "../config/env";

export const coreClient = axios.create({
  baseURL: `${env.CORE_API_URL}/api/v1`,
  timeout: 5000,
  headers: { "Content-Type": "application/json" },
});

export interface CoreUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export const getUserFromToken = async (token: string): Promise<CoreUser> => {
  const response = await coreClient.get<{ data: CoreUser }>("/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
};
