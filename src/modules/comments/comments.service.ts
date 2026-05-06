import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../../entities/comment.entity';
import { Post } from '../../entities/post.entity';
import { User } from '../../entities/user.entity';
import type { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
  ) {}

  async create(dto: CreateCommentDto, currentUser?: User): Promise<Comment> {
    const post = await this.postRepo.findOne({ where: { id: dto.postId, status: 'published' } });
    if (!post) throw new NotFoundException('Post not found');

    if (!currentUser && (!dto.displayName || !dto.email)) {
      throw new BadRequestException('Name and email are required for anonymous comments');
    }

    const comment = this.commentRepo.create({
      body: dto.body,
      postId: dto.postId,
      status: 'pending',
      userId: currentUser?.id ?? null,
      displayName: currentUser ? null : (dto.displayName ?? null),
      email: currentUser ? null : (dto.email ?? null),
    });
    return this.commentRepo.save(comment);
  }

  async findPending(page = 1, limit = 20): Promise<{ items: Comment[]; total: number }> {
    const [items, total] = await this.commentRepo.findAndCount({
      where: { status: 'pending' },
      relations: ['post', 'user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async approve(id: number): Promise<void> {
    await this.commentRepo.update(id, { status: 'approved' });
  }

  async reject(id: number): Promise<void> {
    await this.commentRepo.update(id, { status: 'rejected' });
  }
}
