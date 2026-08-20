// webpack DefinePlugin으로 주입되는 값들
declare const __BUILD_INFO__: {
  commit: string;
  builtAt: string;
  target: string;
};
declare const __API_BASE__: string;
