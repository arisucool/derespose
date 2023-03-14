import { ApiProperty } from '@nestjs/swagger';

export class GetPoseTagsByPosesDto {
  @ApiProperty({
    isArray: true,
    type: String,
  })
  poseIdentifiers: string[];
}
