import type {
  SelectOrder,
  SelectProduct,
  SelectProductSpecification,
  SelectReview,
} from '@repo/database';

export type Cafe24Order = {
  mallId: number;
  cafe24MallId: string;
  shopNo: number;
  cafe24OrderId: string;
  orderDate: string;
  productNo: number;
  productName: string;
  optionId: string;
  optionValue: string;
  cafe24MemberId: string;
  cafe24BuyerPhone: string;
};

export type OrderHistory = {
  order: SelectOrder;
  product: SelectProduct | null;
  spec: SelectProductSpecification | null;
  review: SelectReview | null;
};
