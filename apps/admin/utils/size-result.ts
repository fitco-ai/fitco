import type { SizeResult } from '@/types/widget-request';

/**
 * Summary 추천 결과, 혹은 Summary + 부분적 Detail 결과가 아니라, 모든 사이즈 결과가 채워진 경우
 */
export function isAllSizeResult(sizeResults: SizeResult[]) {
  return sizeResults.every(
    (r) => !!r.title && !!r.subTitle && !!r.descriptions
  );
}
