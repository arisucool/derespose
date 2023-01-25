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
}
