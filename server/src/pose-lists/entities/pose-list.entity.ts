import { ApiProperty } from '@nestjs/swagger';
import { Pose } from 'src/poses/entities/pose.entity';
import { User } from 'src/users/entities/user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PoseListVote } from './pose-list-vote.entity';

@Entity()
export class PoseList extends BaseEntity {
  // ID
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  // リスト名
  @Column()
  @ApiProperty({
    description: 'リスト名',
  })
  title: string;

  // リストの説明文
  @Column()
  @ApiProperty({
    description: 'リストの説明文',
  })
  description?: string;

  // 公開モード
  @Column({
    type: 'enum',
    enum: ['public', 'sharedByUrl'],
  })
  @ApiProperty({
    description: '公開モード',
  })
  publicMode: 'public' | 'sharedByUrl';

  // 作成日
  @CreateDateColumn()
  @ApiProperty({
    description: '作成日',
  })
  createdAt: Date;

  // 最終更新日
  @Column()
  @ApiProperty({
    description: '最終更新日',
  })
  updatedAt: Date;

  // ポーズ
  @ManyToMany(() => Pose)
  @JoinTable()
  @ApiProperty({
    type: () => Pose,
    isArray: true,
    required: false,
    description: 'ポーズのリスト',
  })
  poses?: Pose[];

  // ユーザ
  @ManyToOne(() => User)
  @ApiProperty({
    type: () => User,
    description: '作成者',
  })
  user: User;

  // 評価
  @OneToMany(() => PoseListVote, (vote) => vote.poseList)
  @ApiProperty({
    type: () => PoseListVote,
    isArray: true,
    required: false,
    description: '評価',
  })
  votes?: PoseListVote[];

  // 評価の数
  @Column({
    default: 0,
  })
  @ApiProperty({
    description: '評価の数',
  })
  votesCount: number;
}
