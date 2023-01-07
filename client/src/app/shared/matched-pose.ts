export interface MatchedPose {
  id: number;

  // 曲名または「ちゃんぽく」のポーズ名
  songName: string;

  // ポーズの登場する再生位置 (秒数)
  timeSeconds: number;

  // スコア
  score: number;

  // お気に入りに入れているか
  isFavorite: boolean;
}
