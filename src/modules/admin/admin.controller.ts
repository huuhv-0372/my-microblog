import { Controller, Get, Post, Param, Render, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @Render('admin/dashboard')
  async getAdminDashboard(): Promise<Record<string, unknown>> {
    const counts = await this.adminService.countPending();
    return { title: 'Admin Dashboard', pendingPosts: counts.posts, pendingComments: counts.comments };
  }

  @Get('posts')
  @Render('admin/posts')
  async getPendingPosts(): Promise<Record<string, unknown>> {
    const { items: posts, total } = await this.adminService.findPendingPosts();
    return { title: 'Pending Posts', posts, total };
  }

  @Post('posts/:id/publish')
  async publishPost(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.adminService.publishPost(+id);
    res.redirect('/admin/posts');
  }

  @Post('posts/:id/reject')
  async rejectPost(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.adminService.rejectPost(+id);
    res.redirect('/admin/posts');
  }

  @Get('comments')
  @Render('admin/comments')
  async getPendingComments(): Promise<Record<string, unknown>> {
    const { items: comments, total } = await this.adminService.findPendingComments();
    return { title: 'Pending Comments', comments, total };
  }

  @Post('comments/:id/approve')
  async approveComment(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.adminService.approveComment(+id);
    res.redirect('/admin/comments');
  }

  @Post('comments/:id/reject')
  async rejectComment(@Param('id') id: string, @Res() res: Response): Promise<void> {
    await this.adminService.rejectComment(+id);
    res.redirect('/admin/comments');
  }
}
