import { Pose } from 'ngx-mp-pose-extractor';

export interface PoseSet {
  title: string;
  type: 'song' | 'commonPose' | 'chanpokuPose';
  pose: Pose;
}
