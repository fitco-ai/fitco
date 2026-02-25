export function resolveProductHref(mallId: number | null, productId: number) {
  return mallId
    ? `/products/mall/${mallId}/${productId}`
    : `/products/external/${productId}`;
}

// [todo] 조정하면서 테스트
export const USE_CACHE = false;
export const CART_TEST = true;
