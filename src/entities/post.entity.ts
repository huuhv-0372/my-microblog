import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Tag } from './tag.entity';
import { Comment } from './comment.entity';

export type PostStatus = 'draft' | 'pending_review' | 'published' | 'rejected';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'varchar', length: 280, unique: true })
  @Index()
  slug!: string;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: ['draft', 'pending_review', 'published', 'rejected'],
    default: 'draft',
  })
  @Index()
  status!: PostStatus;

  @Column({ name: 'author_id', type: 'int', unsigned: true })
  authorId!: number;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author!: User;

  @ManyToMany(() => Tag, (tag) => tag.posts, { eager: false })
  @JoinTable({
    name: 'post_tags',
    joinColumn: { name: 'post_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags!: Tag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments!: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'datetime', nullable: true, default: null })
  @Index()
  publishedAt!: Date | null;
}
