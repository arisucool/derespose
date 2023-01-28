import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PoseList } from './pose-list.entity';

@Entity()
@Index(['poseList', 'randomUid'], { unique: true })
export class PoseListVote extends BaseEntity {
  // ID
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  // ポーズリスト
  @ManyToOne(() => PoseList)
  @ApiProperty({
    type: () => PoseList,
  })
  poseList: PoseList;

  // ランダム生成されたユーザ識別子 (ログインせずに評価可能にするため)
  @Column()
  @ApiProperty()
  randomUid: string;

  // ユーザのIPアドレス
  @Column()
  @ApiProperty()
  ipAddress: string;
}
