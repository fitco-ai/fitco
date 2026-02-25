export type SizeData = Record<string, string>;
export type ExtractResult = SizeData[] | string | string[];

/**
 * SMART_FIT: 스마트 사이즈 표 타입
 * https://habi-unni.com/product/made-13571-3기장-빈티지-와이드-코튼-데미지-팬츠-3color-xs2xl/14338/category/27/display/1/
 * https://habi-unni.com/product/made-13571-3%EA%B8%B0%EC%9E%A5-%EB%B9%88%ED%8B%B0%EC%A7%80-%EC%99%80%EC%9D%B4%EB%93%9C-%EC%BD%94%ED%8A%BC-%EB%8D%B0%EB%AF%B8%EC%A7%80-%ED%8C%AC%EC%B8%A0-3color-xs2xl/14338/category/27/display/1/
 * SNAPFIT: 스냅핏 사이즈 표 타입
 * https://www.66girls.co.kr/product/%EB%B8%8C%EB%A6%AD%EC%8A%A4%EC%B2%B4%ED%81%AC%EC%98%A4%EB%B2%84%ED%95%8F%EC%85%94%EC%B8%A0/155305/category/1/display/3/
 * SIZE_TABLE: 일반 HTML 테이블 기반 사이즈 표 타입
 * https://www.graychic.co.kr/product/gc-made-jean-303/11135/category/12/display/2/
 * ETC: 그 외
 * https://www.fromdayone.co.kr/product/made%ED%8D%BC%ED%93%B8-%ED%95%98%ED%8A%B8%EC%8A%A4%ED%80%98%EC%96%B4%EB%84%A5-%EC%A7%84%EC%A3%BC-%ED%8A%B8%EC%9C%84%EB%93%9C%EC%9B%90%ED%94%BC%EC%8A%A4%EB%B0%98%ED%8C%94ver%EB%AF%B8%EB%8B%88%EB%AF%B8%EB%94%94ver%EB%B0%98%ED%8C%94%ED%95%98%EA%B0%9D%EB%A3%A9/10370/category/1/display/2/
 * https://another-language.com/product/bermuda-denim-pants/11775/category/26/display/2/
 * https://www.bronzebooboo.co.kr/product/%ED%83%90%ED%83%90-pt/30894/category/36/display/1/
 */
export type SizeType = 'SMART_FIT' | 'SNAPFIT' | 'SIZE_TABLE' | 'ETC';
