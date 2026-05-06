import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../modules/users/users.service';

interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

/**
 * Reads the access_token cookie on every request and injects the user into
 * res.locals so that ALL Handlebars templates can render {{#if user}}.
 * Silently skips any errors (expired / invalid token).
 */
@Injectable()
export class UserLocalsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(UserLocalsMiddleware.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = (req.cookies as Record<string, string>)?.['access_token'];
    if (token) {
      try {
        const payload = this.jwtService.verify<JwtPayload>(token, {
          secret: process.env.JWT_ACCESS_SECRET ?? 'access-secret',
        });
        const user = await this.usersService.findById(payload.sub);
        if (user) {
          res.locals['user'] = user;
        }
      } catch {
        // Token expired or invalid — ignore, user stays unauthenticated
      }
    }
    next();
  }
}
