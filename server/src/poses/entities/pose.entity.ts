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

  // ポーズファイル名
  @Column()
  @ApiProperty()
  poseFileName: string;

  // ポーズの時間
  @Column()
  @ApiProperty()
  time: number;

  // タグ
  @ManyToMany(() => PoseTag)
  @JoinTable()
  @ApiProperty({
    type: PoseTag,
    isArray: true,
  })
  tags: PoseTag[];
}