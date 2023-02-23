export type PoseFaceExpression =
  | 'all'
  | 'neutral'
  | 'smile'
  | 'blush'
  | 'surprise'
  | 'others';

export interface PoseSearchFilter {
  faceExpression: PoseFaceExpression;
}
