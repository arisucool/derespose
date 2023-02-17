export interface PoseSetDefinitionJson {
  title: string;
  type: 'song' | 'commonPose' | 'chanpokuPose';
  version?: number;
  orderInType?: number;
}
