import { Pose } from 'ngx-mp-pose-extractor';

export interface PoseFile {
  title: string;
  type: 'song' | 'commonPose' | 'chanpokuPose';
  pose: Pose;
}
