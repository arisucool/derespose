import { ApiProperty } from '@nestjs/swagger';
import { CreatePostListDto } from './create-pose-list.dto';

export class UpdatePoseListDto extends CreatePostListDto {
  @ApiProperty({
    description: 'ポーズ識別子の配列',
    example: ['onega-cinderella:1000', 'star:1100'],
  })
  poseIdentifiers: string[];
}
