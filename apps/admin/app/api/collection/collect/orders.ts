import { extractSelectedSizeOptionText } from '@/actions/ai/extractSelectedSizeOptionText';
import { getOrdersByMallId } from '@/actions/cafe24/getOrdersByMallId';
import { crawlSizeData } from '@/actions/crawl/crawlSizeData';
import { getAllMembersPhoneMap } from '@/actions/members/getAllMembersPhoneMap';
import { setUrlProduct } from '@/actions/products/setUrlProduct';
import type { Cafe24Order, ServerActionResponse } from '@/types';
import { seoulDayjs } from '@/utils/date';
import {
  type SelectOrder,
  and,
  database,
  eq,
  mallTable,
  orderTable,
  productSpecificationTable,
  productTable,
} from '@repo/database';

// 정기 수집
export async function collectOrders() {
  try {
    const getCafe24AllOrdersResponse = await getCafe24AllOrders();
    const cafe24AllOrders = getCafe24AllOrdersResponse.data?.orders ?? [];
    const getAllOrdersResponse = await getAllOrders();
    const allOrders = getAllOrdersResponse.data?.orders ?? [];
    const allOrderIdsSet = new Set(
      allOrders.map((order) => order.cafe24OrderId)
    );
    const getAllMembersPhoneMapResponse = await getAllMembersPhoneMap();
    const membersPhoneMap = getAllMembersPhoneMapResponse.data?.membersPhoneMap;
    if (!membersPhoneMap) {
      throw new Error('No members phone map');
    }

    for (const order of cafe24AllOrders) {
      const targetMember = membersPhoneMap.get(order.cafe24BuyerPhone);

      // 이미 수집됨
      if (allOrderIdsSet.has(order.cafe24OrderId)) {
        continue;
      }

      const orderOptionValue = order.optionValue;
      const selectedSizeOptionTextResponse =
        await extractSelectedSizeOptionText(orderOptionValue);

      const selectedSizeOptionText =
        selectedSizeOptionTextResponse?.selectedSizeOptionText ?? null;

      const existingProduct = await database
        .select()
        .from(productTable)
        .where(
          and(
            eq(productTable.mallId, order.mallId),
            eq(productTable.shopNo, order.shopNo),
            eq(productTable.productNo, order.productNo)
          )
        )
        .then((rows) => rows[0]);

      // 다른 주문건을 통해 수집된 상품. 주문 옵션만 결정해서 insert
      if (existingProduct && !!existingProduct.category) {
        let productSpecificationId: number | null = null;

        if (selectedSizeOptionText) {
          const productSpecification = await database
            .select({
              id: productSpecificationTable.id,
            })
            .from(productSpecificationTable)
            .where(
              and(
                eq(productSpecificationTable.productId, existingProduct.id),
                eq(productSpecificationTable.size, selectedSizeOptionText)
              )
            )
            .then((rows) => rows[0]);

          productSpecificationId = productSpecification?.id ?? null;
        }

        if (!productSpecificationId) {
          throw new Error('No productSpecificationId');
        }

        await database.insert(orderTable).values({
          cafe24OrderId: order.cafe24OrderId,
          cafe24MemberId: order.cafe24MemberId,
          memberId: targetMember?.id ?? null,
          productId: existingProduct.id,
          productSpecificationId,
          orderDate: seoulDayjs(order.orderDate).format('YYYY-MM-DD HH:mm:ss'),
          cafe24BuyerPhone: order.cafe24BuyerPhone,
        });
        continue;
      }

      const url = `https://${order.cafe24MallId}.cafe24.com/shop${order.shopNo}/product/detail.html?product_no=${order.productNo}`;

      const crawlResponse = await crawlSizeData({ url });

      if (
        !crawlResponse.ok ||
        !crawlResponse.data?.isValidUrl ||
        !crawlResponse.data?.cafe24Data ||
        !crawlResponse.data?.result ||
        !crawlResponse.data?.type
      ) {
        console.error('crawlSizeData 실패', order);
        continue;
      }

      const {
        cafe24Data,
        result,
        productMaterial,
        categoryNamesFromProductPage,
      } = crawlResponse.data;

      const {
        cafe24MallId,
        shopNo,
        iProductNo,
        productName,
        productImage,
        iCategoryNo,
        origin,
      } = cafe24Data;

      const response = await setUrlProduct({
        cafe24MallId,
        shopNo,
        productNo: Number(iProductNo),
        productName,
        productImage,
        result,
        productMaterial,
        iCategoryNo,
        origin,
        categoryNamesFromProductPage,
      });

      if (!response.data) {
        throw new Error('setUrlProduct 실패');
      }

      const { product, specs } = response.data;

      const productSpecificationId =
        specs.find((spec) => spec.size === selectedSizeOptionText)?.id ?? null;

      if (!productSpecificationId) {
        throw new Error('No productSpecificationId');
      }

      await database.insert(orderTable).values({
        cafe24OrderId: order.cafe24OrderId,
        cafe24MemberId: order.cafe24MemberId,
        memberId: targetMember?.id ?? null,
        productId: product.id,
        productSpecificationId,
        orderDate: seoulDayjs(order.orderDate).format('YYYY-MM-DD HH:mm:ss'),
        cafe24BuyerPhone: order.cafe24BuyerPhone,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

async function getCafe24AllOrders(): ServerActionResponse<{
  orders: Cafe24Order[];
}> {
  try {
    const malls = await database.select().from(mallTable);
    const result: Cafe24Order[] = [];

    for (const mall of malls) {
      // 초기 3년치 데이터 이미 수집된 경우, 어제 데이터만 수집
      if (mall.initialOrderCollected) {
        const yesterday = seoulDayjs().subtract(1, 'day').format('YYYY-MM-DD');
        const ordersResponse = await getOrdersByMallId(
          mall.id,
          mall.cafe24MallId,
          yesterday,
          yesterday
        );
        const orders = ordersResponse.data?.orders ?? [];
        result.push(...orders);
        continue;
      }

      // 3년치 데이터를 2개월씩 나눠서 요청
      const endDate = seoulDayjs();
      const startDate = seoulDayjs().subtract(3, 'year');

      // 2개월씩 chunk로 나누기
      const chunks: Array<{ start: string; end: string }> = [];
      let currentStart = startDate.clone();

      while (currentStart.isBefore(endDate)) {
        const chunkEnd = currentStart.add(2, 'month').isAfter(endDate)
          ? endDate
          : currentStart.add(2, 'month');

        chunks.push({
          start: currentStart.format('YYYY-MM-DD'),
          end: chunkEnd.format('YYYY-MM-DD'),
        });

        currentStart = chunkEnd.add(1, 'day');
      }

      // chunk별로 for문 처리
      for (const chunk of chunks) {
        const ordersResponse = await getOrdersByMallId(
          mall.id,
          mall.cafe24MallId,
          chunk.start,
          chunk.end
        );

        const orders = ordersResponse.data?.orders ?? [];
        result.push(...orders);
      }

      await database
        .update(mallTable)
        .set({ initialOrderCollected: true })
        .where(eq(mallTable.id, mall.id));
    }

    return {
      ok: true,
      data: {
        orders: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

async function getAllOrders(): ServerActionResponse<{
  orders: SelectOrder[];
}> {
  try {
    const orders = await database.select().from(orderTable);

    return {
      ok: true,
      data: { orders },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
