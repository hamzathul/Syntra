import type { AuthSessionDto, AuthUserDto, LoginRequestDto, RegisterRequestDto } from "shared";

export interface AuthServicePort {
  register(dto: RegisterRequestDto): Promise<AuthSessionDto>;
  login(dto: LoginRequestDto): Promise<AuthSessionDto>;
  getMe(userId: string): Promise<AuthUserDto>;
  refresh(dto: { refreshToken: string }): Promise<AuthSessionDto>;
  logout(dto: { refreshToken: string }): Promise<void>;
  changePassword(userId: string, dto: { currentPassword: string; newPassword: string }): Promise<void>;
}
