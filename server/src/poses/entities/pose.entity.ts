import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PoseTag } from '../../pose-tags/entities/pose-tag.entity';

@Entity()
export class Pose extends BaseEntity {
  // ID
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  // ポーズセット名
  @Column()
  @ApiProperty()
  poseSetName: string;

  // ポーズの時間
  @Column()
  @ApiProperty()
  time: number;

  // タグ
  @ManyToMany(() => PoseTag, (poseTag) => poseTag.poses)
  @JoinTable()
  @ApiProperty({
    type: () => PoseTag,
    isArray: true,
    required: false,
  })
  tags: PoseTag[];
}
