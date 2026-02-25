'use server';

import type {
  Cafe24Customer,
  Cafe24GetCustomerResponse,
  ServerActionResponse,
} from '@/types';
import { resolveCafe24AccessToken } from './utils';

export async function getCafe24CustomersByLoginPhone({
  mallId,
  cafe24MallId,
  shopNo,
  loginPhone,
}: {
  mallId: number;
  cafe24MallId: string;
  shopNo: number;
  loginPhone: string;
}): ServerActionResponse<{
  customers: Cafe24Customer[];
}> {
  try {
    const accessToken = await resolveCafe24AccessToken(mallId);

    if (!accessToken) {
      throw new Error('Invalid Request');
    }

    const response = await fetch(
      `https://${cafe24MallId}.cafe24api.com/api/v2/admin/customers?cellphone=${loginPhone}&shop_no=${shopNo}`,
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
      const error = await response.json();
      throw new Error(JSON.stringify(error));
    }

    const data = (await response.json()) as Cafe24GetCustomerResponse;

    return {
      ok: true,
      data: {
        customers: data.customers ?? [],
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
