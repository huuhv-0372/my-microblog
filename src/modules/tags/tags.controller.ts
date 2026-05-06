import { Controller, Get, Param, Query, Render, NotFoundException } from '@nestjs/common';
import { TagsService } from './tags.service';
import { PostsService } from '../posts/posts.service';

@Controller('tags')
export class TagsController {
  constructor(
    private readonly tagsService: TagsService,
    private readonly postsService: PostsService,
  ) {}

  @Get(':slug')
  @Render('pages/tag')
  async getTagPage(
    @Param('slug') slug: string,
    @Query('page') pageStr?: string,
  ): Promise<Record<string, unknown>> {
    const tag = await this.tagsService.findBySlug(slug).catch(() => {
      throw new NotFoundException();
    });
    const limit = 9;
    const page = Math.max(1, parseInt(pageStr ?? '1', 10) || 1);
    const { items: posts, total } = await this.postsService.findPublishedByTag(slug, page, limit);
    const totalPages = Math.ceil(total / limit);
    return {
      title: `Posts tagged "${tag.name}"`,
      tag,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasPrev: page > 1,
        hasNext: page < totalPages,
      },
    };
  }
}
