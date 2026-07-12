import { describe, it, expect } from "vitest";
import {
  registerRequestSchema,
  loginRequestSchema,
  authUserSchema,
  authTokenSchema,
  authSessionSchema,
} from "./auth.contract.js";

describe("registerRequestSchema", () => {
  it("accepts valid registration", () => {
    const result = registerRequestSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "secret12345",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short name", () => {
    const result = registerRequestSchema.safeParse({
      name: "J",
      email: "john@example.com",
      password: "secret12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = registerRequestSchema.safeParse({
      name: "John Doe",
      email: "not-an-email",
      password: "secret12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerRequestSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });

  it("strips unknown keys", () => {
    const result = registerRequestSchema.safeParse({
      name: "John Doe",
      email: "john@example.com",
      password: "secret12345",
      extra: "should be stripped",
    });
    expect(result.success).toBe(false);
  });
});

describe("loginRequestSchema", () => {
  it("accepts valid login", () => {
    const result = loginRequestSchema.safeParse({
      email: "john@example.com",
      password: "secret12345",
    });
    expect(result.success).toBe(true);
  });

  it("normalizes email to lowercase", () => {
    const result = loginRequestSchema.safeParse({
      email: "John@Example.COM",
      password: "secret12345",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("john@example.com");
    }
  });
});

describe("authUserSchema", () => {
  it("accepts valid user", () => {
    const result = authUserSchema.safeParse({
      id: "clx123",
      name: "John Doe",
      email: "john@example.com",
      role: "USER",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid role", () => {
    const result = authUserSchema.safeParse({
      id: "clx123",
      name: "John Doe",
      email: "john@example.com",
      role: "SUPERADMIN",
    });
    expect(result.success).toBe(false);
  });
});

describe("authTokenSchema", () => {
  it("accepts valid token", () => {
    const result = authTokenSchema.safeParse({
      accessToken: "eyJhbGciOiJIUzI1NiJ9.xxx",
      tokenType: "Bearer",
      expiresIn: 3600,
    });
    expect(result.success).toBe(true);
  });

  it("rejects wrong token type", () => {
    const result = authTokenSchema.safeParse({
      accessToken: "xxx",
      tokenType: "Basic",
      expiresIn: 3600,
    });
    expect(result.success).toBe(false);
  });
});

describe("authSessionSchema", () => {
  it("accepts valid session", () => {
    const result = authSessionSchema.safeParse({
      user: {
        id: "clx123",
        name: "John Doe",
        email: "john@example.com",
        role: "USER",
      },
      token: {
        accessToken: "eyJhbGciOiJIUzI1NiJ9.xxx",
        tokenType: "Bearer",
        expiresIn: 3600,
      },
      refreshToken: "rt_abc123",
      refreshExpiresIn: 604800,
    });
    expect(result.success).toBe(true);
  });
});
