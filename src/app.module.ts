import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { JwtModule } from '@nestjs/jwt';
import { databaseConfig } from './config/database.config';
import { PostsModule } from './modules/posts/posts.module';
import { TagsModule } from './modules/tags/tags.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CommentsModule } from './modules/comments/comments.module';
import { AdminModule } from './modules/admin/admin.module';
import { PagesModule } from './modules/pages/pages.module';
import { UserLocalsMiddleware } from './common/middleware/user-locals.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig()),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    JwtModule.register({ global: true }),
    PostsModule,
    TagsModule,
    AuthModule,
    UsersModule,
    CommentsModule,
    AdminModule,
    PagesModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(UserLocalsMiddleware).forRoutes('*');
  }
}

