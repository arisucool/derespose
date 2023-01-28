import { ApiProperty } from '@nestjs/swagger';

export class AddVoteToPoseListDto {
  @ApiProperty({
    description:
      'ランダム生成されたユーザ識別子 (ログインせずに評価可能にするため)',
  })
  randomUid: string;
}
