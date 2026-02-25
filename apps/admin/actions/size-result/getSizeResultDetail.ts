'use server';

import type { ServerActionResponse } from '@/types';
import type { GetSizeResultDetailResponseData } from '@/types/widget-request';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { analyzeSizeDetail } from '../ai/analyzeSizeDetail';
import { resolveMallId } from '../cafe24/utils';
import { getMemberById } from '../members/getMemberById';
import { createProduct } from '../products/createProduct';
import { getProduct } from '../products/getProduct';
import { getProductSpecifications } from '../products/getProductSpecification';
import { updateRecommendationDetail } from '../recommendation/updateRecommendationDetail';
import { getAllMemberReviews } from '../reviews/getAllMemberReviews';

export async function getSizeResultDetail(
  memberId: number,
  cafe24MallId: string,
  shopNo: number,
  productNo: number,
  ip: string | null,
  size: string
): ServerActionResponse<GetSizeResultDetailResponseData> {
  try {
    const mallId = await resolveMallId(cafe24MallId);

    if (!mallId) {
      throw new Error('mallId not found');
    }

    const getProductResponse = await getProduct(
      cafe24MallId,
      shopNo,
      productNo
    );
    let product = getProductResponse.data?.product;

    if (!product || product.category === null) {
      const createProductResponse = await createProduct(
        cafe24MallId,
        shopNo,
        productNo
      );
      if (!createProductResponse.data?.product) {
        throw new Error('createProductResponse.data?.category not found');
      }
      product = createProductResponse.data.product;
    }

    const getAllMemberReviewsResponse = await getAllMemberReviews(
      memberId,
      product.category as (typeof PRODUCT_CATEGORIES)[number]['value']
    );
    const reviews = getAllMemberReviewsResponse.data?.reviews;

    if (!reviews) {
      throw new Error('getAllMemberReviewsResponse failed');
    }

    if (reviews.length === 0) {
      throw new Error('reviews not found');
    }

    const specs = await getProductSpecifications(mallId, shopNo, productNo);
    const memberResponse = await getMemberById(memberId);
    const member = memberResponse.data?.member;

    if (!member) {
      throw new Error('getMemberById failed');
    }

    const analyzeSizeDetailResponse = await analyzeSizeDetail({
      targetProductSpecs: specs,
      memberReviews: reviews,
      member,
      mallId,
      size,
      productId: product.id,
      productMaterial: product.material,
    });

    if (!analyzeSizeDetailResponse) {
      throw new Error('analyzeSize failed');
    }

    await updateRecommendationDetail({
      memberId,
      productId: product.id,
      size,
      newData: analyzeSizeDetailResponse,
      inputData: analyzeSizeDetailResponse.inputData,
    });

    // console.log('상품 카테고리', product.category);
    // console.log('상품 사이즈 스펙', specs);
    // console.log('내 정보', member);
    // console.log('동일 카테고리 내 리뷰', reviews);
    // console.log('사이즈 분석 결과', analyzeSizeResponse.sizeResult);

    return {
      ok: true,
      data: analyzeSizeDetailResponse,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
