import { Controller, Get, Render } from '@nestjs/common';
import { PagesService } from './pages.service';

@Controller('about')
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get()
  @Render('pages/about')
  async getAbout(): Promise<Record<string, unknown>> {
    const page = await this.pagesService.findBySlug('about');
    return { title: page.title, page };
  }
}
