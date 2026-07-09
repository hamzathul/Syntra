export interface UserRecord {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
  readonly role: "USER" | "ADMIN";
  readonly isActive: boolean;
}

export interface CreateUserInput {
  readonly name: string;
  readonly email: string;
  readonly passwordHash: string;
}

export interface UpdateUserInput {
  readonly name?: string;
  readonly passwordHash?: string;
  readonly isActive?: boolean;
  readonly role?: "USER" | "ADMIN";
}

export interface UserFilter {
  readonly role?: "USER" | "ADMIN";
  readonly isActive?: boolean;
}
