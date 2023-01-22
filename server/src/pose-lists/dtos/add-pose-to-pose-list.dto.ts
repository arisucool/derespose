import { ApiProperty } from '@nestjs/swagger';

export class AddPoseToPoseListDto {
  @ApiProperty({
    description: 'ポーズファイル名',
  })
  poseFileName: string;

  @ApiProperty({
    description: 'ポーズの時間',
  })
  poseTime: number;
}
