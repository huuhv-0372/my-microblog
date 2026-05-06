import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../../entities/post.entity';
import { Comment } from '../../entities/comment.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  async findPendingPosts(page = 1, limit = 20): Promise<{ items: Post[]; total: number }> {
    const [items, total] = await this.postRepo.findAndCount({
      where: { status: 'pending_review' },
      relations: ['author', 'tags'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async publishPost(id: number): Promise<void> {
    await this.postRepo.update(id, { status: 'published', publishedAt: new Date() });
  }

  async rejectPost(id: number): Promise<void> {
    await this.postRepo.update(id, { status: 'rejected' });
  }

  async findPendingComments(page = 1, limit = 20): Promise<{ items: Comment[]; total: number }> {
    const [items, total] = await this.commentRepo.findAndCount({
      where: { status: 'pending' },
      relations: ['post', 'user'],
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { items, total };
  }

  async approveComment(id: number): Promise<void> {
    await this.commentRepo.update(id, { status: 'approved' });
  }

  async rejectComment(id: number): Promise<void> {
    await this.commentRepo.update(id, { status: 'rejected' });
  }

  async countPending(): Promise<{ posts: number; comments: number }> {
    const [posts, comments] = await Promise.all([
      this.postRepo.count({ where: { status: 'pending_review' } }),
      this.commentRepo.count({ where: { status: 'pending' } }),
    ]);
    return { posts, comments };
  }
}
