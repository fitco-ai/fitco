'use server';

import { env } from '@/env';
import type { ComparePeriod } from '@/types';
import type { Cafe24SalesVolume, ServerActionResponse } from '@/types';
import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import { getMallById } from '../malls/getMallById';
import { getAllProductByMallId } from '../products/getAllProductByMallId';
import { resolveCafe24AccessToken, resolveCafe24MallId } from './utils';

export async function getSalesvolume(
  mallId: number,
  shopNo: number,
  period: ComparePeriod
): ServerActionResponse<{
  before: {
    total: number;
    refund: number;
    refundRate: number;
    settleCount: number;
  };
  after: {
    total: number;
    refund: number;
    refundRate: number;
    settleCount: number;
  };
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);
    const cafe24MallId = await resolveCafe24MallId(mallId);

    if (!accessToken || !cafe24MallId) {
      throw new Error('Invalid Request');
    }

    const mallResponse = await getMallById(mallId);
    const mall = mallResponse.data?.mall;

    if (!mall) {
      throw new Error('Mall not found');
    }

    const productsResponse = await getAllProductByMallId(mallId, shopNo);
    const products = productsResponse.data?.products;

    if (!products) {
      throw new Error('Product not found');
    }

    if (products.length === 0) {
      return {
        ok: true,
        data: {
          before: {
            total: 0,
            refund: 0,
            refundRate: 0,
            settleCount: 0,
          },
          after: {
            total: 0,
            refund: 0,
            refundRate: 0,
            settleCount: 0,
          },
        },
      };
    }

    const createdAt = mall.createdAt;

    const periodMap: Record<
      typeof period,
      { amount: number; unit: 'month' | 'year' }
    > = {
      '1m': { amount: 1, unit: 'month' },
      '3m': { amount: 3, unit: 'month' },
      '6m': { amount: 6, unit: 'month' },
      '1y': { amount: 1, unit: 'year' },
    };
    const duration = periodMap[period];

    const beforeStart = seoulDayjs(createdAt)
      .subtract(duration.amount, duration.unit)
      .format(COMPARABLE_DATE_FORMAT);

    const beforeEnd = seoulDayjs(createdAt)
      .subtract(1, 'day')
      .format(COMPARABLE_DATE_FORMAT);
    const afterStart = seoulDayjs(createdAt).format(COMPARABLE_DATE_FORMAT);
    const endCandidate = seoulDayjs(createdAt).add(
      duration.amount,
      duration.unit
    );
    const afterEndDayjs = endCandidate.isAfter(seoulDayjs())
      ? seoulDayjs()
      : endCandidate;
    const afterEnd = afterEndDayjs.format(COMPARABLE_DATE_FORMAT);

    let beforeTotal = 0;
    let beforeRefund = 0;
    let beforeSettleCount = 0;
    let afterTotal = 0;
    let afterRefund = 0;
    let afterSettleCount = 0;

    const productNos = products.map((product) => product.productNo) as number[];

    // 1년, 선택 시 180일 단위로 쪼개서 요청
    if (period === '1y') {
      const chunks = getDateChunks(createdAt, duration.amount, duration.unit);

      // before 기간 (설치 전)
      for (const chunk of chunks.before) {
        const before = await fetchSalesVolumeWithChunking(
          accessToken,
          cafe24MallId,
          shopNo,
          productNos,
          chunk.start,
          chunk.end
        );
        beforeTotal += before.total;
        beforeRefund += before.refund;
        beforeSettleCount += before.settleCount;
      }

      // after 기간 (설치 후)
      for (const chunk of chunks.after) {
        const after = await fetchSalesVolumeWithChunking(
          accessToken,
          cafe24MallId,
          shopNo,
          productNos,
          chunk.start,
          chunk.end
        );
        afterTotal += after.total;
        afterRefund += after.refund;
        afterSettleCount += after.settleCount;
      }
    } else {
      // 1개월, 6개월은 기존 로직 사용
      const before = await fetchSalesVolumeWithChunking(
        accessToken,
        cafe24MallId,
        shopNo,
        productNos,
        beforeStart,
        beforeEnd
      );

      beforeTotal += before.total;
      beforeRefund += before.refund;
      beforeSettleCount += before.settleCount;

      const after = await fetchSalesVolumeWithChunking(
        accessToken,
        cafe24MallId,
        shopNo,
        productNos,
        afterStart,
        afterEnd
      );

      afterTotal += after.total;
      afterRefund += after.refund;
      afterSettleCount += after.settleCount;
    }

    // 환불률 계산
    const beforeRefundRate =
      beforeTotal > 0 ? (beforeRefund / beforeTotal) * 100 : 0;
    const afterRefundRate =
      afterTotal > 0 ? (afterRefund / afterTotal) * 100 : 0;

    return {
      ok: true,
      data: {
        before: {
          total: beforeTotal,
          refund: beforeRefund,
          refundRate: Number(beforeRefundRate.toFixed(2)),
          settleCount: beforeSettleCount,
        },
        after: {
          total: afterTotal,
          refund: afterRefund,
          refundRate: Number(afterRefundRate.toFixed(2)),
          settleCount: afterSettleCount,
        },
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}

// productNos를 100개씩 나누어 fetchSalesVolume을 호출하는 헬퍼 함수
async function fetchSalesVolumeWithChunking(
  accessToken: string,
  cafe24MallId: string,
  shopNo: number,
  productNos: number[],
  beforeStart: string,
  beforeEnd: string
) {
  let total = 0;
  let refund = 0;
  let settleCount = 0;

  // productNos가 100개를 초과하면 100개씩 나누기
  if (productNos.length > 100) {
    const chunks = chunkArray(productNos, 100);

    for (const chunk of chunks) {
      const result = await fetchSalesVolume(
        accessToken,
        cafe24MallId,
        shopNo,
        chunk,
        beforeStart,
        beforeEnd
      );

      total += result.total;
      refund += result.refund;
      settleCount += result.settleCount;
    }
  } else {
    // 100개 이하일 때는 기존 로직 사용
    const result = await fetchSalesVolume(
      accessToken,
      cafe24MallId,
      shopNo,
      productNos,
      beforeStart,
      beforeEnd
    );

    total = result.total;
    refund = result.refund;
    settleCount = result.settleCount;
  }

  return {
    total,
    refund,
    settleCount,
  };
}

async function fetchSalesVolume(
  accessToken: string,
  cafe24MallId: string,
  shopNo: number,
  productNos: number[],
  beforeStart: string,
  beforeEnd: string
) {
  const response = await fetch(
    `https://${cafe24MallId}.cafe24api.com/api/v2/admin/reports/salesvolume?shop_no=${shopNo}&product_no=${productNos.join(',')}&start_date=${beforeStart}&end_date=${beforeEnd}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Cafe24-Api-Version': env.CAFE24_API_VERSION,
      },
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }

  const data = (await response.json()) as {
    salesvolume: Cafe24SalesVolume[];
  };

  let total = 0;
  let refund = 0;
  let settleCount = 0;
  const items: Cafe24SalesVolume[] = [];

  for (const item of data.salesvolume) {
    total += Math.max(Number(item.total_sales), 0);
    refund += Number(item.return_product_count);
    settleCount += Number(item.settle_count);
    items.push(item);
  }

  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    total,
    refund,
    settleCount,
  };
}

// 배열을 지정된 크기로 나누는 헬퍼 함수
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

// 1년, 3년 기간을 180일 단위로 쪼개는 함수
function getDateChunks(
  createdAt: Date,
  amount: number,
  unit: 'month' | 'year'
): {
  before: Array<{ start: string; end: string }>;
  after: Array<{ start: string; end: string }>;
} {
  const beforeChunks: Array<{ start: string; end: string }> = [];
  const afterChunks: Array<{ start: string; end: string }> = [];

  // before 기간을 180일 단위로 쪼개기
  let currentDate = seoulDayjs(createdAt).subtract(amount, unit);
  const beforeEnd = seoulDayjs(createdAt).subtract(1, 'day');

  while (currentDate.isBefore(beforeEnd)) {
    const chunkStart = currentDate;
    const chunkEnd = currentDate.add(180, 'day');

    beforeChunks.push({
      start: chunkStart.format(COMPARABLE_DATE_FORMAT),
      end: chunkEnd.isAfter(beforeEnd)
        ? beforeEnd.format(COMPARABLE_DATE_FORMAT)
        : chunkEnd.format(COMPARABLE_DATE_FORMAT),
    });

    currentDate = chunkEnd;
  }

  // after 기간을 180일 단위로 쪼개기
  currentDate = seoulDayjs(createdAt);
  const afterEnd = seoulDayjs(createdAt).add(amount, unit);
  const now = seoulDayjs();

  while (currentDate.isBefore(afterEnd) && currentDate.isBefore(now)) {
    const chunkStart = currentDate;
    const chunkEnd = currentDate.add(180, 'day');

    afterChunks.push({
      start: chunkStart.format(COMPARABLE_DATE_FORMAT),
      end:
        chunkEnd.isAfter(afterEnd) || chunkEnd.isAfter(now)
          ? (afterEnd.isAfter(now) ? now : afterEnd).format(
              COMPARABLE_DATE_FORMAT
            )
          : chunkEnd.format(COMPARABLE_DATE_FORMAT),
    });

    currentDate = chunkEnd;
  }

  return { before: beforeChunks, after: afterChunks };
}
