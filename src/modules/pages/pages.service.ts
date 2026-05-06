import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from '../../entities/page.entity';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private readonly pageRepo: Repository<Page>,
  ) {}

  async findBySlug(slug: string): Promise<Page> {
    const page = await this.pageRepo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException(`Page '${slug}' not found`);
    return page;
  }
}
