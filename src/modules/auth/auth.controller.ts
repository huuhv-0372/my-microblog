import {
  Controller,
  Get,
  Post,
  Body,
  Render,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

const COOKIE_OPTS_ACCESS = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 15 * 60 * 1000,
};

const COOKIE_OPTS_REFRESH = {
  httpOnly: true,
  sameSite: 'strict' as const,
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/auth/refresh',
};

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('register')
  @Render('auth/register')
  getRegister(): Record<string, unknown> {
    return { title: 'Register' };
  }

  @Post('register')
  async postRegister(
    @Body() body: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    const { _csrf: _ignored, ...fields } = body; // strip CSRF
    const dto = fields as { username?: string; email?: string; password?: string };
    try {
      const registerDto = { username: dto.username ?? '', email: dto.email ?? '', password: dto.password ?? '' };
      const user = await this.authService.register(registerDto);
      const { accessToken, refreshToken } = await this.authService.login(user);
      res.cookie('access_token', accessToken, COOKIE_OPTS_ACCESS);
      res.cookie('refresh_token', refreshToken, COOKIE_OPTS_REFRESH);
      res.redirect('/dashboard');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      res.render('auth/register', { title: 'Register', error: message, dto });
    }
  }

  @Get('login')
  @Render('auth/login')
  getLogin(): Record<string, unknown> {
    return { title: 'Login' };
  }

  @Post('login')
  async postLogin(
    @Body() body: Record<string, string>,
    @Res() res: Response,
  ): Promise<void> {
    const dto = { email: body['email'] ?? '', password: body['password'] ?? '' };
    try {
      const user = await this.authService.validateUser(dto.email, dto.password);
      const { accessToken, refreshToken } = await this.authService.login(user);
      res.cookie('access_token', accessToken, COOKIE_OPTS_ACCESS);
      res.cookie('refresh_token', refreshToken, COOKIE_OPTS_REFRESH);
      res.redirect('/dashboard');
    } catch {
      res.render('auth/login', { title: 'Login', error: 'Email hoặc mật khẩu không đúng.', dto });
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async postLogout(@Req() req: Request & { user?: { id: number } }, @Res() res: Response): Promise<void> {
    if (req.user) {
      await this.authService.logout(req.user.id);
    }
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });
    res.redirect('/');
  }

  @Post('auth/refresh')
  async postRefresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    const rawToken = (req.cookies as Record<string, string>)['refresh_token'];
    if (!rawToken) {
      res.redirect('/login');
      return;
    }
    try {
      const { accessToken, refreshToken } = await this.authService.refresh(rawToken);
      res.cookie('access_token', accessToken, COOKIE_OPTS_ACCESS);
      res.cookie('refresh_token', refreshToken, COOKIE_OPTS_REFRESH);
      const referer = (req.headers['referer'] as string) ?? '/';
      res.redirect(referer);
    } catch {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token', { path: '/auth/refresh' });
      res.redirect('/login');
    }
  }
}
