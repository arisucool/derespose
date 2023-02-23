export interface MatchedPose {
  id: number;

  // 曲名または「ちゃんぽく」のポーズ名
  title: string;

  // ポーズデータ名
  poseSetName: string;

  // ポーズの登場する再生位置 (秒数)
  timeSeconds: number;
  time: number;

  // ポーズの長さ
  durationSeconds: number;

  // 表情
  faceExpression?: {
    top: {
      label: string;
      prob: number;
    };
    predictions: {
      label: string;
      prob: number;
    }[];
  };

  // スコア
  score: number;
  scoreString: string;

  // スコアの詳細
  scoreDetails: {
    // 類似度
    similarity: number;
    // どの撮影タイミングのポーズと比較したか
    foundTargetPoseIndex: number;
    // ポーズの長さ
    duration: number;
    // 再生位置
    time: number;
  };

  // お気に入りに入れているか
  isFavorite: boolean;

  // タグ
  tags?: string[];

  // 画像URL
  imageUrl?: string;
}
