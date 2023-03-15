export type PoseFaceExpression =
  | 'all'
  | 'neutral'
  | 'smile'
  | 'blush'
  | 'surprise'
  | 'sad'
  | 'others'
  | 'unknown';

export interface PoseSearchFilter {
  faceExpression: PoseFaceExpression;
}
