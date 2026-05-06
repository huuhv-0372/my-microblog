import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Injects the CSRF token into res.locals so every Handlebars template
 * can access {{csrfToken}} automatically.
 *
 * csurf middleware must run before this and attach req.csrfToken().
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const csrfReq = req as Request & { csrfToken?: () => string };
    if (typeof csrfReq.csrfToken === 'function') {
      res.locals['csrfToken'] = csrfReq.csrfToken();
    }
    // Expose current year for footer
    res.locals['currentYear'] = new Date().getFullYear();
    next();
  }
}
