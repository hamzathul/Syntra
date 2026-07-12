import type { RequestHandler } from "express";
import {
  BaseController,
  ResponseFactory,
  getAuthenticatedUser,
} from "backend-p";
import type {
  LoginRequestDto,
  RegisterRequestDto,
} from "shared";
import type { AuthServicePort } from "./auth.service.port";

export class AuthController extends BaseController {
  private readonly v1Response = ResponseFactory.createV1Response();

  constructor(private readonly authService: AuthServicePort) {
    super();
  }

  readonly register: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const dto = request.body as RegisterRequestDto;
      const session = await this.authService.register(dto);

      this.v1Response.success(response, {
        request,
        statusCode: 201,
        message: "Account created successfully",
        data: session,
      });
    },
  );

  readonly login: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const dto = request.body as LoginRequestDto;
      const session = await this.authService.login(dto);

      this.v1Response.success(response, {
        request,
        message: "Login successful",
        data: session,
      });
    },
  );

  readonly refresh: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const dto = request.body as { refreshToken: string };
      const session = await this.authService.refresh(dto);

      this.v1Response.success(response, {
        request,
        message: "Token refreshed successfully",
        data: session,
      });
    },
  );

  readonly logout: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const dto = request.body as { refreshToken: string };
      await this.authService.logout(dto);

      this.v1Response.success(response, {
        request,
        message: "Logged out successfully",
        data: {} as Record<string, never>,
      });
    },
  );

  readonly changePassword: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const { id } = getAuthenticatedUser(response.locals);
      const dto = request.body as { currentPassword: string; newPassword: string };
      await this.authService.changePassword(id, dto);

      this.v1Response.success(response, {
        request,
        message: "Password changed successfully",
        data: {} as Record<string, never>,
      });
    },
  );

  readonly getMe: RequestHandler = this.asyncHandler(
    async (request, response) => {
      const { id } = getAuthenticatedUser(response.locals);
      const user = await this.authService.getMe(id);

      this.v1Response.success(response, {
        request,
        message: "User retrieved successfully",
        data: user,
      });
    },
  );
}
