import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  Render,
  NotFoundException,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { PostsService } from './posts.service';
import { TagsService } from '../tags/tags.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreatePostDto } from './dto/create-post.dto';
import { User } from '../../entities/user.entity';

type AuthRequest = Request & { user?: User };

@Controller()
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly tagsService: TagsService,
  ) {}

  @Get()
  @Render('pages/home')
  async getHome(@Query('page') pageStr?: string): Promise<Record<string, unknown>> {
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const limit = 15;
    const [{ items: posts, total }, tags, recentPosts] = await Promise.all([
      this.postsService.findPublished(page, limit),
      this.tagsService.findAllWithPublishedCount(),
      this.postsService.findRecentPublished(10),
    ]);
    return {
      title: 'Home',
      posts,
      tags,
      recentPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasPrev: page > 1,
        hasNext: page * limit < total,
      },
    };
  }

  @Get('posts/new')
  @UseGuards(JwtAuthGuard)
  async getNewPost(@Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    const tags = await this.tagsService.findAll();
    res.render('member/post-form', { title: 'New Post', tags, user: req.user });
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreatePostDto,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.postsService.createDraft(req.user!.id, dto);
      res.redirect('/dashboard');
    } catch (err) {
      const tags = await this.tagsService.findAll();
      const message = err instanceof Error ? err.message : 'Failed to create post';
      res.render('member/post-form', { title: 'New Post', tags, error: message, dto, user: req.user });
    }
  }

  @Get('posts/:id/edit')
  @UseGuards(JwtAuthGuard)
  async getEditPost(
    @Param('id') id: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    const [post, tags] = await Promise.all([
      this.postsService.findAllByAuthor(req.user!.id).then((posts) => posts.find((p) => p.id === +id)),
      this.tagsService.findAll(),
    ]);
    if (!post || post.status !== 'draft') throw new NotFoundException();
    res.render('member/post-form', {
      title: 'Edit Post',
      post,
      tags,
      selectedTagIds: post.tags.map((t) => t.id),
      isEdit: true,
      user: req.user,
    });
  }

  @Post('posts/:id')
  @UseGuards(JwtAuthGuard)
  async updateOrDeletePost(
    @Param('id') id: string,
    @Query('_method') method: string,
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreatePostDto,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    if (method?.toUpperCase() === 'DELETE') {
      await this.postsService.deleteDraft(+id, req.user!.id);
      res.redirect('/dashboard');
      return;
    }
    // PATCH — update draft
    try {
      await this.postsService.updateDraft(+id, req.user!.id, dto);
      res.redirect('/dashboard');
    } catch (err) {
      const tags = await this.tagsService.findAll();
      const message = err instanceof Error ? err.message : 'Update failed';
      res.render('member/post-form', { title: 'Edit Post', error: message, tags, dto, isEdit: true, user: req.user });
    }
  }

  @Post('posts/:id/submit')
  @UseGuards(JwtAuthGuard)
  async submitPost(@Param('id') id: string, @Req() req: AuthRequest, @Res() res: Response): Promise<void> {
    await this.postsService.submitForReview(+id, req.user!.id);
    res.redirect('/dashboard');
  }

  @Get('posts/:slug')
  async getPostDetail(
    @Param('slug') slug: string,
    @Req() req: AuthRequest,
    @Res() res: Response,
  ): Promise<void> {
    const post = await this.postsService.findPublishedBySlug(slug).catch(() => {
      throw new NotFoundException();
    });
    const approvedComments = (post.comments ?? []).filter((c) => c.status === 'approved');
    res.render('pages/post-detail', {
      title: post.title,
      post,
      comments: approvedComments,
      commentCount: approvedComments.length,
      user: req.user ?? null,
    });
  }
}
