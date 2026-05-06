import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser>(err: Error | null, user: TUser, _info: unknown, context: ExecutionContext): TUser {
    if (err || !user) {
      const res = context.switchToHttp().getResponse<Response>();
      res.redirect('/login');
      return null as unknown as TUser;
    }
    return user;
  }
}
