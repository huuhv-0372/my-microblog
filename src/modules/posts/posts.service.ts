import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import slugify from 'slugify';
import { Post } from '../../entities/post.entity';
import { Tag } from '../../entities/tag.entity';

interface PaginatedResult<T> {
  items: T[];
  total: number;
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findPublished(page = 1, limit = 15): Promise<PaginatedResult<Post>> {
    const [items, total] = await this.postRepo.findAndCount({
      where: { status: 'published' },
      relations: ['tags', 'author'],
      order: { publishedAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async findRecentPublished(limit = 10): Promise<Pick<Post, 'id' | 'title' | 'slug'>[]> {
    return this.postRepo.find({
      select: ['id', 'title', 'slug'],
      where: { status: 'published' },
      order: { publishedAt: 'DESC' },
      take: limit,
    });
  }

  async findPublishedBySlug(slug: string): Promise<Post> {
    const post = await this.postRepo.findOne({
      where: { slug, status: 'published' },
      relations: ['tags', 'author', 'comments'],
    });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async findPublishedByTag(tagSlug: string, page = 1, limit = 10): Promise<PaginatedResult<Post>> {
    const [items, total] = await this.postRepo
      .createQueryBuilder('post')
      .innerJoin('post.tags', 'tag', 'tag.slug = :tagSlug', { tagSlug })
      .leftJoinAndSelect('post.tags', 'allTags')
      .leftJoinAndSelect('post.author', 'author')
      .where('post.status = :status', { status: 'published' })
      .orderBy('post.publishedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();
    return { items, total };
  }

  async findAllByAuthor(authorId: number): Promise<Post[]> {
    return this.postRepo.find({
      where: { authorId },
      relations: ['tags'],
      order: { updatedAt: 'DESC' },
    });
  }

  async createDraft(
    authorId: number,
    dto: { title: string; body: string; tagIds: number[]; action: string },
  ): Promise<Post> {
    const slug = await this.generateUniqueSlug(dto.title);
    const tags = await this.tagRepo.findByIds(dto.tagIds);
    const status = dto.action === 'submit_review' ? 'pending_review' : 'draft';
    const post = this.postRepo.create({ title: dto.title, body: dto.body, slug, authorId, status, tags });
    return this.postRepo.save(post);
  }

  async updateDraft(
    postId: number,
    authorId: number,
    dto: { title: string; body: string; tagIds: number[] },
  ): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id: postId, authorId, status: 'draft' }, relations: ['tags'] });
    if (!post) throw new NotFoundException('Draft not found or you do not own it');
    const tags = await this.tagRepo.findByIds(dto.tagIds);
    post.title = dto.title;
    post.body = dto.body;
    post.tags = tags;
    if (post.title !== dto.title) {
      post.slug = await this.generateUniqueSlug(dto.title, postId);
    }
    return this.postRepo.save(post);
  }

  async deleteDraft(postId: number, authorId: number): Promise<void> {
    const post = await this.postRepo.findOne({ where: { id: postId, authorId, status: 'draft' } });
    if (!post) throw new NotFoundException('Draft not found or you do not own it');
    await this.postRepo.remove(post);
  }

  async submitForReview(postId: number, authorId: number): Promise<Post> {
    const post = await this.postRepo.findOne({ where: { id: postId, authorId, status: 'draft' }, relations: ['tags'] });
    if (!post) throw new NotFoundException('Draft not found');
    if (!post.tags || post.tags.length === 0) throw new Error('Post must have at least one tag');
    post.status = 'pending_review';
    return this.postRepo.save(post);
  }

  private async generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
    const base = slugify(title, { lower: true, strict: true });
    let slug = base;
    let n = 1;
    while (true) {
      const qb = this.postRepo.createQueryBuilder('post').where('post.slug = :slug', { slug });
      if (excludeId) qb.andWhere('post.id != :excludeId', { excludeId });
      const count = await qb.getCount();
      if (count === 0) break;
      slug = `${base}-${n++}`;
    }
    return slug;
  }
}
