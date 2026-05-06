import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

export type CommentStatus = 'pending' | 'approved' | 'rejected';

@Entity('comments')
@Index(['postId', 'status'])
export class Comment {
  @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'text' })
  body!: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  })
  status!: CommentStatus;

  @Column({ name: 'post_id', type: 'int', unsigned: true })
  postId!: number;

  @ManyToOne(() => Post, (post) => post.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: Post;

  @Column({ name: 'user_id', type: 'int', unsigned: true, nullable: true, default: null })
  @Index()
  userId!: number | null;

  @ManyToOne(() => User, (user) => user.comments, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User | null;

  // For anonymous submissions
  @Column({ name: 'display_name', type: 'varchar', length: 100, nullable: true, default: null })
  displayName!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  email!: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
