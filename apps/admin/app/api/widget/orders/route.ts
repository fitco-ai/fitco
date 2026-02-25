import { getMemberProducts } from '@/actions/member-product/getMemberProducts';
import { getMemberById } from '@/actions/members/getMemberById';
import { getAllOrdersByMemberId } from '@/actions/orders/getAllOrdersByMemberId';
import { getGuestOrdersByCafe24MemberId } from '@/actions/orders/getGuestOrdersByCafe24MemberId';
import { getHeaders, resolveMemberIdFromRequest } from '@/app/api/_utils';
import type {
  GetOrderHistoryRequest,
  GetOrderHistoryResponseData,
} from '@/types/widget-request';
import _ from 'lodash';
import { type NextRequest, NextResponse } from 'next/server';

export { OPTIONS } from '../../_config';

export async function POST(request: NextRequest) {
  try {
    const { memberId } = resolveMemberIdFromRequest(request);

    if (!memberId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = (await request.json()) as GetOrderHistoryRequest;

    const memberResponse = await getMemberById(memberId);
    const member = memberResponse.data?.member;

    if (!member) {
      throw new Error('Member not found');
    }

    // 위젯 게스트 & 쇼핑몰 로그인 => cafe24MemberId로 주문내역 조회
    const response =
      !member.loginPhone && !!payload.cafe24MemberId
        ? await getGuestOrdersByCafe24MemberId({
            cafe24MemberId: payload.cafe24MemberId,
            memberId,
          })
        : await getAllOrdersByMemberId(memberId);

    if (!response.data) {
      throw new Error('getAllOrdersByMemberIdResponse failed');
    }

    const memberProducts = await getMemberProducts(memberId);
    const memberProductMap = _.keyBy(memberProducts, 'productId');

    const orders = response.data.orders;
    const categoryModified = orders.map((order) => {
      if (!order.product?.id) {
        return order;
      }
      const category =
        memberProductMap[order.product.id]?.category ?? order.product.category;
      return {
        ...order,
        product: {
          ...order.product,
          category,
        },
      };
    });

    const data: GetOrderHistoryResponseData = {
      orders: categoryModified,
    };

    return NextResponse.json(data, {
      status: 200,
      headers: getHeaders(),
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
