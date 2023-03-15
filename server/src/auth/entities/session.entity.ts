import { ApiProperty } from '@nestjs/swagger';
import { User } from 'src/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Session extends BaseEntity {
  // ID
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  // ログイン日時
  @CreateDateColumn()
  @ApiProperty()
  loggedAt: Date;

  // IPアドレス
  @Column()
  @ApiProperty()
  loggedIpAddress: string;

  // ユーザ
  @ManyToOne(() => User)
  @ApiProperty({
    type: () => User,
  })
  user: User;

  // リフレッシュトークン
  @Column()
  refreshToken: string;
}
