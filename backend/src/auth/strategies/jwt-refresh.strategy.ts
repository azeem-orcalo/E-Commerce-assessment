import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { JwtPayload } from '../../common/types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      // Read refresh token from the httpOnly cookie set at login
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env['JWT_REFRESH_SECRET'] ?? 'fallback-refresh-secret',
      passReqToCallback: true,
    });
  }

  // payload is the verified JWT; req is available because passReqToCallback=true
  validate(_req: Request, payload: JwtPayload): JwtPayload {
    return payload;
  }
}
