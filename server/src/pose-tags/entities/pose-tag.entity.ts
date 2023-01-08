import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class PoseTag extends BaseEntity {
  // タグ名
  @PrimaryColumn()
  @ApiProperty()
  name: string;
}
