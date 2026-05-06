import { Controller, Get, Render, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from '../posts/posts.service';
import { User } from '../../entities/user.entity';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @Render('member/dashboard')
  async getDashboard(@Req() req: Request & { user?: User }): Promise<Record<string, unknown>> {
    const user = req.user!;
    const posts = await this.postsService.findAllByAuthor(user.id);
    return { title: 'My Dashboard', posts, user };
  }
}
