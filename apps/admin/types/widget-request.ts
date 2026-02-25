import type {
  InsertMember,
  SelectMember,
  SelectProductSpecification,
} from '@repo/database';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import type { OrderHistory } from './order';

export type SignInMemberRequest = {
  phone: string;
};

export type VerifyMemberResponseData = {
  member: SelectMember | null;
};

export type SignInMemberResponseData = {
  token: string;
  member: SelectMember;
};

export type MemberTokenData = {
  id: number;
};

export type UpdateMemberRequest = Pick<
  InsertMember,
  'onboarding' | 'gender' | 'height' | 'weight' | 'agreementData'
>;

export type RequestLoginCodeRequest = {
  phone: string;
};

export type SignInRequest = {
  phone: string;
  code: string;
};

export type SignInResponseData = SignInMemberResponseData;

export type SignUpRequest = {
  phone: string;
  code: string;
  agreements: string[];
};

export type SignUpResponseData = SignInResponseData;

export type GetOrderHistoryRequest = {
  cafe24MemberId: string | null;
};

export type GetOrderHistoryResponseData = {
  orders: OrderHistory[];
};

export type UpdateReviewRequest = {
  productSpecificationId: number;
  content: string;
};

export type DeleteReviewRequest = {
  reviewIds: number[];
};

export type GetSizeResultRequest = {
  cafe24MallId: string;
  shopNo: number;
  productNo: number;
};

export type GetCompareSizeResultRequest = {
  cafe24MallId: string;
  size1: SizeResult;
  size2: SizeResult;
  productNo: number;
  shopNo: number;
};

export type SizeResult = {
  size: string;
  best: boolean;
  avgScore: number;
  title: string | null;
  subTitle: string | null;
  descriptions: string[] | null;
};

export type GetSizeResultResponseData = {
  canAnalyze: boolean;
  sizeResults: SizeResult[] | null;
};

export type GetCompareSizeResultResponseData = {
  compareSummaries: { size: string; content: string }[];
};

export type CrawlUrlRequest = {
  url: string;
};

export type CrawlUrlResponseData = {
  isValidUrl: boolean;
  data?: {
    specs: SelectProductSpecification[];
    category: (typeof PRODUCT_CATEGORIES)[number]['value'];
  };
};

export type CreateDirectReviewRequest = {
  brand: string | null;
  productName: string | null;
  category: (typeof PRODUCT_CATEGORIES)[number]['value'];
  size: string;
  spec: Record<string, string>;
  review: string;
};

export type Recommendation = {
  id: number;
  productName: string | null;
  productImage: string | null;
  size: string | null;
  brand: string | null;
  cafe24MallId: string | null;
  sizeResults: SizeResult[];
};

export type GetMemberRecommendationResponseData = {
  recommendations: Recommendation[];
};

export type DeleteRecommendationRequest = {
  recommendationIds: number[];
};

export type SetUrlReviewRequest = {
  productSpecificationId: number;
  content: string;
  category: (typeof PRODUCT_CATEGORIES)[number]['value'];
};

export type InitializeAnalyticsRequest = {
  cafe24MallId: string;
  shopNo: number;
};

export type InitializeAnalyticsResponseData = {
  analyticsId: number;
};

export type UpdateAnalyticsRequest = {
  analyticsId: number;
  value: {
    click?: boolean;
    result?: boolean;
    cart?: boolean;
    exitView?: string;
  };
};

export type GetSizeResultDetailRequest = GetSizeResultRequest & {
  size: string;
};

export type GetSizeResultDetailResponseData = {
  title: string;
  subTitle: string;
  descriptions: string[];
};
