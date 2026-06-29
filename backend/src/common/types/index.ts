import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;   // user ID
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  address: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthTokensResponse {
  user: Omit<SafeUser, 'updatedAt'>;
  accessToken: string;
  // refreshToken is set via httpOnly cookie; never returned in body
}
