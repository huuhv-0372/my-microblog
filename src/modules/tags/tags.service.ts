import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../../entities/tag.entity';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepo: Repository<Tag>,
  ) {}

  async findAllWithPublishedCount(): Promise<(Tag & { publishedPostCount: number })[]> {
    const result = await this.tagRepo
      .createQueryBuilder('tag')
      .leftJoin('tag.posts', 'post', 'post.status = :status', { status: 'published' })
      .addSelect('COUNT(post.id)', 'publishedPostCount')
      .groupBy('tag.id')
      .orderBy('publishedPostCount', 'DESC')
      .getRawAndEntities();

    return result.entities.map((tag, i) => {
      (tag as Tag & { publishedPostCount: number }).publishedPostCount =
        parseInt(result.raw[i].publishedPostCount as string, 10) || 0;
      return tag as Tag & { publishedPostCount: number };
    });
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepo.findOne({ where: { slug } });
    if (!tag) throw new NotFoundException(`Tag '${slug}' not found`);
    return tag;
  }

  async findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }
}
