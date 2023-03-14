export type PoseFaceExpression =
  | 'all'
  | 'neutral'
  | 'smile'
  | 'blush'
  | 'surprise'
  | 'others'
  | 'unknown';

export interface PoseSearchFilter {
  faceExpression: PoseFaceExpression;
}
