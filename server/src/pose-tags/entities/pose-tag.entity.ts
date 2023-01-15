import { ApiProperty } from '@nestjs/swagger';
import { Pose } from 'src/poses/entities/pose.entity';
import { BaseEntity, Entity, ManyToMany, PrimaryColumn } from 'typeorm';

@Entity()
export class PoseTag extends BaseEntity {
  // タグ名
  @PrimaryColumn()
  @ApiProperty()
  name: string;

  // ポーズ
  @ManyToMany(() => Pose, (pose) => pose.tags)
  @ApiProperty({
    type: () => Pose,
    isArray: true,
    required: false,
  })
  poses?: Pose[];
}
