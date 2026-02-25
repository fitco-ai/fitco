import type { Cafe24Order, ServerActionResponse } from '@/types';
import { Formatters } from '@/utils/formatters';
import { getAllMallShopsByMallId } from './getAllMallShopsByMallId';
import { resolveCafe24AccessToken } from './utils';

export async function getOrdersByMallId(
  mallId: number,
  cafe24MallId: string,
  startDate: string,
  endDate: string
): ServerActionResponse<{ orders: Cafe24Order[] }> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken) {
      throw new Error('Invalid Request');
    }

    const mallShopResponse = await getAllMallShopsByMallId(mallId);

    if (!mallShopResponse.data?.shops) {
      throw new Error('No shops found');
    }

    const result: Cafe24Order[] = [];

    for (const shop of mallShopResponse.data.shops) {
      const shopOrders = await fetchOrders(
        mallId,
        cafe24MallId,
        shop.shopNo,
        accessToken,
        startDate,
        endDate
      );

      result.push(...shopOrders);
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

async function fetchOrders(
  mallId: number,
  cafe24MallId: string,
  shopNo: number,
  accessToken: string,
  startDate: string,
  endDate: string
): Promise<Cafe24Order[]> {
  try {
    // https://developers.cafe24.com/docs/ko/api/admin/#retrieve-a-list-of-orders
    const status = 'N00,N10,N20,N21,N22,N30,N40,N50';
    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/orders?start_date=${startDate}&end_date=${endDate}&shop_no=${shopNo}&embed=buyer,items&order_status=${status}&limit=1000`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-Cafe24-Api-Version': process.env.CAFE24_API_VERSION as string,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();

    const orders = data.orders?.flatMap((order: any) => {
      const buyerPhone = order.buyer.cellphone;
      return order.items.map((item: any) => {
        const cafe24Order: Cafe24Order = {
          mallId,
          cafe24MallId,
          shopNo: order.shop_no,
          cafe24BuyerPhone: Formatters.phone.removeSpaces(buyerPhone),
          cafe24OrderId: order.order_id,
          orderDate: order.order_date,
          productNo: item.product_no,
          productName: item.product_name,
          optionId: item.option_id,
          optionValue: item.option_value,
          cafe24MemberId: order.buyer.member_id,
        };
        return cafe24Order;
      });
    });

    return orders?.flat() ?? [];
  } catch (error) {
    console.error(error);
    return [];
  }
}
