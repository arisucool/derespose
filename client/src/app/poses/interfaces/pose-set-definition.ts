import { PoseSet } from 'ngx-mp-pose-extractor';
import { PoseSetDefinitionJson } from './pose-set-definition-json';

export interface PoseSetDefinition extends PoseSetDefinitionJson {
  poseSet: PoseSet;
}
