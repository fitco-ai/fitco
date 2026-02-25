export const QueryKeys = {
  mall: (mallId: number) => ['mall', mallId],
  mallSkins: (mallId: number) => ['mall-skins', mallId],
  mallScriptTags: (mallId: number, shopNo: number) => [
    'mall-script-tags',
    mallId,
    shopNo,
  ],
  allMalls: () => ['all-malls'],
  mallShops: (mallId: number) => ['mall-shops', mallId],
  member: (memberId: number) => ['member', memberId],
  memberOrders: (memberId: number) => ['member-orders', memberId],
  product: (productId: number) => ['product', productId],
  // Dashboard
  mallChartData: (timeUnit: string) => ['mall-chart-data', timeUnit],
  mallTotalCount: () => ['mall-total-count'],
  recommendationChartData: (timeUnit: string) => [
    'recommendation-chart-data',
    timeUnit,
  ],
  recommendationTotalCount: () => ['recommendation-total-count'],
  allClickAnalytics: () => ['all-click-analytics'],
  allResultAnalytics: () => ['all-result-analytics'],
  allCartAnalytics: () => ['all-cart-analytics'],
  clickAnalyticsByMallId: (mallId: number, shopNo: number) => [
    'click-analytics-by-mall-id',
    mallId,
    shopNo,
  ],
  resultAnalyticsByMallId: (mallId: number, shopNo: number) => [
    'result-analytics-by-mall-id',
    mallId,
    shopNo,
  ],
  cartAnalyticsByMallId: (mallId: number, shopNo: number) => [
    'cart-analytics-by-mall-id',
    mallId,
    shopNo,
  ],
  allProductCount: () => ['all-product-count'],
  productCountByMallId: (mallId: number, shopNo: number) => [
    'product-count-by-mall-id',
    mallId,
    shopNo,
  ],
  allReviewCount: () => ['all-review-count'],
  reviewCountByMallId: (mallId: number, shopNo: number) => [
    'review-count-by-mall-id',
    mallId,
    shopNo,
  ],
  productRefundReports: (mallId: number, period: string) => [
    'product-refund-reports',
    mallId,
    period,
  ],
  salesvolume: (mallId: number, period: string) => [
    'salesvolume',
    mallId,
    period,
  ],
  boardCount: (mallId: number, shopNo: number, period: string) => [
    'board-count',
    mallId,
    shopNo,
    period,
  ],
  sizePrompt: () => ['size-prompt'],
  exitView: (mallId: number, shopNo: number) => ['exit-view', mallId, shopNo],
  allExitView: () => ['all-exit-view'],
  productSales: (
    mallId: number,
    shopNo: number,
    startDate: string,
    endDate: string
  ) => ['product-sales', mallId, shopNo, startDate, endDate],
  mallProducts: (mallId: number) => ['mall-products', mallId],
  allAiModels: () => ['all-ai-models'],
  allRecommendations: () => ['all-recommendations'],
  recommendation: (recommendationId: number) => [
    'recommendation',
    recommendationId,
  ],
};
