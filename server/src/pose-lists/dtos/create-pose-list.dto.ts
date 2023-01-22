import { ApiProperty } from '@nestjs/swagger';

export class CreatePostListDto {
  @ApiProperty({
    description: 'ポーズリストのタイトル',
  })
  title: string;

  @ApiProperty({
    description: 'ポーズリストの説明文',
  })
  description?: string;

  @ApiProperty({
    description: 'ポーズリストの公開モード',
  })
  publicMode: 'public' | 'sharedByUrl';

  @ApiProperty({
    description: 'ポーズ識別子の配列',
    example: ['onega-cinderella:1000', 'star:1100'],
  })
  poseIdentifiers: string[];
}
