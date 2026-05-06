import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { UsersService } from './users.service';
import { DashboardController } from './dashboard.controller';
import { PostsModule } from '../posts/posts.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PostsModule],
  providers: [UsersService],
  controllers: [DashboardController],
  exports: [UsersService],
})
export class UsersModule {}
