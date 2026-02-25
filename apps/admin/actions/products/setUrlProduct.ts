import 'server-only';
import { decideProductCategory } from '@/actions/ai/decideProductCategory';
import { resolveMallId } from '@/actions/cafe24/utils';
import type { ExtractResult, SizeData } from '@/actions/crawl/utils/types';
import type { ServerActionResponse } from '@/types';
import {
  type SelectProduct,
  type SelectProductSpecification,
  and,
  database,
  eq,
  productSpecificationTable,
  productTable,
} from '@repo/database';
import type { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { crawlCafe24CategoryInfo } from '../crawl/crawlCafe24CategoryInfo';

export async function setUrlProduct({
  cafe24MallId,
  shopNo,
  productNo,
  productName,
  productImage,
  result,
  productMaterial,
  iCategoryNo,
  origin,
  categoryNamesFromProductPage,
  includeCategory = true,
}: {
  cafe24MallId: string;
  shopNo: number;
  productNo: number;
  productName: string;
  productImage: string;
  result: ExtractResult;
  productMaterial: string | null;
  iCategoryNo: string;
  origin: string;
  categoryNamesFromProductPage: string[] | null;
  includeCategory?: boolean;
}): ServerActionResponse<{
  product: SelectProduct;
  specs: SelectProductSpecification[];
}> {
  try {
    // url에서 추출할 때 일단 etc로.
    let category: (typeof PRODUCT_CATEGORIES)[number]['value'] | null = null;
    const sizes: string[] = [];
    const mallId = await resolveMallId(cafe24MallId);

    if (includeCategory) {
      if (categoryNamesFromProductPage) {
        // 사이즈 extraction에서 카테고리 정보도 추출 성공한 경우
        category = await decideProductCategory(
          categoryNamesFromProductPage,
          productName,
          result
        );
      }
      // [hold] mall에서 category 조회했을 때 product가 속한 카테고리no들이 빠져있는 경우 있음
      // else if (mallId) {
      //   // 앱 설치한 몰. credential 있어서 API로 카테고리 유추 가능.
      //   const categoryResponse = await getProductAndCategoryNamesByProductNo(
      //     mallId,
      //     shopNo,
      //     productNo
      //   );
      //   const categoryNames = categoryResponse.data?.categoryNames;
      //   if (categoryNames?.length) {
      //     category = await decideProductCategory(
      //       categoryNames,
      //       productName,
      //       result
      //     );
      //   }
      // }
      else {
        // 카테고리 정보 수집이 안된 경우. 직접 카테고리 페이지에서 추출
        const categoryResponse = await crawlCafe24CategoryInfo({
          url: `${origin}/shop${shopNo}/product/list.html?cate_no=${iCategoryNo}`,
        });
        const crawledCategory = categoryResponse.data?.crawledCategory;

        category = await decideProductCategory(
          crawledCategory ? [crawledCategory] : [],
          productName,
          result
        );
      }
    }

    console.log('category', category);

    const { specs, product } = await database.transaction(async (tx) => {
      let product = await tx
        .select()
        .from(productTable)
        .where(
          and(
            eq(productTable.cafe24MallId, cafe24MallId),
            eq(productTable.shopNo, shopNo),
            eq(productTable.productNo, productNo)
          )
        )
        .then((rows) => rows[0]);

      if (product) {
        await tx
          .update(productTable)
          .set({
            category,
            material: productMaterial,
          })
          .where(
            and(
              eq(productTable.cafe24MallId, cafe24MallId),
              eq(productTable.shopNo, shopNo),
              eq(productTable.productNo, productNo)
            )
          );
      } else {
        product = await tx
          .insert(productTable)
          .values({
            mallId,
            cafe24MallId,
            shopNo,
            productNo,
            category,
            material: productMaterial,
            productName,
            productImage,
          })
          .returning()
          .then((rows) => rows[0]);
      }

      const specs: SelectProductSpecification[] = [];

      for (const sizeData of result) {
        const { size, otherSpecs } = splitSizeProp(sizeData as SizeData);
        sizes.push(size);

        let spec = await tx
          .select()
          .from(productSpecificationTable)
          .where(
            and(
              eq(productSpecificationTable.productId, product.id),
              eq(productSpecificationTable.size, size)
            )
          )
          .then((rows) => rows[0]);

        if (!spec) {
          spec = await tx
            .insert(productSpecificationTable)
            .values({
              productId: product.id,
              size: size ?? null,
              spec: otherSpecs,
            })
            .returning()
            .then((rows) => rows[0]);
        }

        specs.push(spec);
      }

      return { specs, product };
    });

    return {
      ok: true,
      data: { product, specs },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

/**
 * 첫번째 프로퍼티를 사이즈명으로 가정하고 추출
 */
function splitSizeProp(data: SizeData): {
  size: string;
  otherSpecs: Record<string, string>;
} {
  const entires = Object.entries(data);
  const [size, ...others] = entires;
  const otherSpecs = others.reduce(
    (acc, cur) => {
      acc[cur[0]] = cur[1];
      return acc;
    },
    {} as Record<string, string>
  );
  return {
    size: size[1],
    otherSpecs: otherSpecs,
  };
}
