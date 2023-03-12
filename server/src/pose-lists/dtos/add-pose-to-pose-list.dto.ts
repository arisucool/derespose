import { ApiProperty } from '@nestjs/swagger';

export class AddPoseToPoseListDto {
  @ApiProperty({
    description: 'ポーズファイル名',
  })
  poseSetName: string;

  @ApiProperty({
    description: 'ポーズID',
  })
  poseSetItemId: number;
}
