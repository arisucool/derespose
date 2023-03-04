export interface DetectedPose {
  // 身体の座標 (3Dワールド座標系)
  ea: { x: number; y: number; z: number; visibility: number }[];
  // 身体の座標 (画像に対する座標系)
  poseLandmarks: { x: number; y: number; z: number; visibility: number }[];
  // 左手の座標 (画像に対する座標系)
  leftHandLandmarks?: {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }[];
  // 右手の座標 (画像に対する座標系)
  rightHandLandmarks?: {
    x: number;
    y: number;
    z: number;
    visibility?: number;
  }[];
  // 画像
  image?: HTMLCanvasElement;
}
