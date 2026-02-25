'use server';

import type { ServerActionResponse } from '@/types';
import type {
  GetSizeResultResponseData,
  SizeResult,
} from '@/types/widget-request';
import { USE_CACHE } from '@/utils/common';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { analyzeSizeSummary } from '../ai/analyzeSizeSummary';
import { resolveMallId } from '../cafe24/utils';
import { getMemberById } from '../members/getMemberById';
import { createProduct } from '../products/createProduct';
import { getProduct } from '../products/getProduct';
import { getProductSpecifications } from '../products/getProductSpecification';
import { createRecommendation } from '../recommendation/createRecommendation';
import { getMemberRecommendation } from '../recommendation/getMemberRecommendation';
import { getAllMemberReviews } from '../reviews/getAllMemberReviews';

export async function getSizeResultSummary(
  memberId: number,
  cafe24MallId: string,
  shopNo: number,
  productNo: number,
  ip: string | null
): ServerActionResponse<GetSizeResultResponseData> {
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

    if (USE_CACHE) {
      const getMemberRecommendationResponse = await getMemberRecommendation({
        memberId,
        productId: product.id,
      });

      const recommendation =
        getMemberRecommendationResponse.data?.recommendation;

      if (recommendation) {
        console.log('recommendation exists');
        return {
          ok: true,
          data: {
            canAnalyze: true,
            sizeResults: recommendation.sizeResults as SizeResult[],
          },
        };
      }
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
      return {
        ok: true,
        data: {
          canAnalyze: false,
          sizeResults: null,
        },
      };
    }

    const specs = await getProductSpecifications(mallId, shopNo, productNo);
    const memberResponse = await getMemberById(memberId);
    const member = memberResponse.data?.member;

    if (!member) {
      throw new Error('getMemberById failed');
    }

    const analyzeSizeSummaryResponse = await analyzeSizeSummary({
      targetProductSpecs: specs,
      memberReviews: reviews,
      member,
      mallId,
      productId: product.id,
    });

    if (!analyzeSizeSummaryResponse) {
      throw new Error('analyzeSize failed');
    }

    console.log(analyzeSizeSummaryResponse.sizeResult);

    // console.log('상품 카테고리', product.category);
    // console.log('상품 사이즈 스펙', specs);
    // console.log('내 정보', member);
    // console.log('동일 카테고리 내 리뷰', reviews);
    // console.log('사이즈 분석 결과', analyzeSizeResponse.sizeResult);
    const bestSize =
      analyzeSizeSummaryResponse.sizeResult.find((r) => r.best)?.size ?? '';
    const bestProductSpecificationId =
      specs.find((s) => s.size === bestSize)?.id ?? -1;

    if (bestProductSpecificationId !== -1) {
      await createRecommendation(
        memberId,
        product.id,
        bestProductSpecificationId,
        analyzeSizeSummaryResponse.sizeResult,
        analyzeSizeSummaryResponse.inputData,
        ip
      );
    }

    return {
      ok: true,
      data: {
        canAnalyze: true,
        sizeResults: analyzeSizeSummaryResponse.sizeResult,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
