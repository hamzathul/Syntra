import type { RequestHandler } from "express";
import {
  BaseController,
  ResponseFactory,
  getAuthenticatedUser,
} from "backend-p";
import type { LoginRequestDto, RegisterRequestDto } from "shared";
import type { AuthServicePort } from "./auth.service";

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
