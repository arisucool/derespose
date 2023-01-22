import { ApiProperty } from '@nestjs/swagger';
import { Session } from 'src/auth/entities/session.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  // ID
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  // 表示名
  @Column()
  @ApiProperty()
  displayName: string;

  // Twitter ユーザ ID
  @Column({
    unique: true,
  })
  twitterUserId: string;

  // Twitter ユーザ名
  @Column()
  @ApiProperty()
  twitterUserName: string;

  // Twitter アクセストークン
  @Column({
    select: false,
  })
  twitterAccessToken?: string;

  // 利用開始日時
  @CreateDateColumn()
  createdAt: Date;

  // 最終ログイン日時
  @Column()
  lastLoggedAt?: Date;

  // 最終ログイン時のIPアドレス
  @Column({
    type: String,
    select: false,
  })
  lastLoggedIpAddress?: string;

  // セッション
  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];
}
