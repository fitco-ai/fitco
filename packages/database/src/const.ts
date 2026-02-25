export const MEMBER_GENDERS = [
  {
    label: '여성',
    value: 'female',
  },
  {
    label: '남성',
    value: 'male',
  },
  {
    label: '선택하지 않음',
    value: 'undetermined',
  },
] as const;

export const PRODUCT_CATEGORIES = [
  {
    label: '상의',
    value: 'top',
    keys: ['총장', '어깨너비', '가슴단면', '암홀', '소매길이', '밑단단면'],
  },
  {
    label: '아우터',
    value: 'outer',
    keys: ['총장', '어깨너비', '가슴단면', '암홀', '소매길이', '밑단단면'],
  },
  {
    label: '하의',
    value: 'pants',
    keys: ['총장', '허리단면', '엉덩이단면', '허벅지단면', '밑위', '밑단단면'],
  },
  {
    label: '스커트',
    value: 'skirt',
    keys: ['총장', '허리단면', '엉덩이단면', '밑단단면'],
  },
  {
    label: '원피스',
    value: 'onepiece',
    keys: ['총장', '어깨너비', '가슴단면', '허리단면', '엉덩이단면', '암홀'],
  },
  {
    label: '레깅스/운동복',
    value: 'sports',
    keys: ['총장', '허리단면', '엉덩이단면', '허벅지단면', '밑위', '밑단단면'],
  },
  {
    label: '기타',
    value: 'etc',
    keys: [],
  },
] as const;

export const AI_TOKEN_USAGES = [
  {
    label: '사이즈 추천(전체, 새로고침)',
    value: 'size-recommendation',
  },
  {
    label: '사이즈 추천(사이즈별 상세)',
    value: 'size-recommendation-detail',
  },
  {
    label: '사이즈 추천(Best 사이즈 결정)',
    value: 'size-recommendation-summary',
  },
  {
    label: '사이즈 비교',
    value: 'size-comparison',
  },
  {
    label: '스마트핏 사이즈 데이터 확인',
    value: 'smartfit-size-data',
  },
  {
    label: '사이즈 텍스트 확인',
    value: 'extract-selected-size-option-text',
  },
  {
    label: '사이즈 테이블 추출',
    value: 'extract-size-from-size-table',
  },
  {
    label: '사이즈 옵션 추출',
    value: 'extract-size-option',
  },
  {
    label: '사이즈 옵션 텍스트 추출',
    value: 'extract-size-option-text-from-variant',
  },
  {
    label: '상세페이지 사이즈 데이터 추출',
    value: 'extract-etc-size-data',
  },
  {
    label: '카테고리 결정',
    value: 'decide-product-category',
  },
  {
    label: '소재 추출',
    value: 'extract-product-material',
  },
] as const;
