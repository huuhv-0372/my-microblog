import { Controller, Post, Body, Req, Res, ValidationPipe } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { User } from '../../entities/user.entity';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async createComment(
    @Body(new ValidationPipe({ whitelist: true, transform: true })) dto: CreateCommentDto,
    @Req() req: Request & { user?: User },
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.commentsService.create(dto, req.user);
      // Find post slug to redirect back
      const referer = (req.headers['referer'] as string) ?? '/';
      res.redirect(referer + '#comment-submitted');
    } catch (err) {
      const referer = (req.headers['referer'] as string) ?? '/';
      const message = encodeURIComponent(err instanceof Error ? err.message : 'Failed to submit comment');
      res.redirect(`${referer}?commentError=${message}#comment-form`);
    }
  }
}
