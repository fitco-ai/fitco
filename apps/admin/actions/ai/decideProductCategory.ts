'use server';
import { PRODUCT_CATEGORIES } from '@repo/database/src/const';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { ExtractResult } from '../crawl/utils/types';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  productCategory: z.enum(
    PRODUCT_CATEGORIES.map((category) => category.value) as [
      string,
      ...string[],
    ]
  ),
});

export async function decideProductCategory(
  categoryNames: string[],
  productName: string,
  result: ExtractResult
): Promise<(typeof PRODUCT_CATEGORIES)[number]['value']> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `주어지는 데이터는 상품이 속한 카테고리 분류(categoryNames), 상품명(productName), 상품 사이즈 상세사항(result)이야. 이 데이터를 기반으로 최종 카테고리를 결정해줘.

        참고사항
        - 카테고리별 상세사항은 다음 데이터를 참고해 ${JSON.stringify(PRODUCT_CATEGORIES)}
        - 아우터와 상의는 상세사항이 같으므로 상품명을 기준으로 최종 카테고리를 결정해줘.
          `,
      },
      {
        role: 'user',
        content: JSON.stringify({
          categoryNames,
          productName,
          result,
        }),
      },
    ],
    response_format: zodResponseFormat(ResponseDataType, 'data'),
  });

  const endTime = Date.now();
  const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(1));

  const totalTokens = completion.usage?.total_tokens;

  if (totalTokens) {
    await createTokenUsage(
      totalTokens,
      durationSeconds,
      'decide-product-category'
    );
  }

  const resp = completion.choices[0].message.parsed;
  return (
    (resp?.productCategory as (typeof PRODUCT_CATEGORIES)[number]['value']) ??
    'etc'
  );
}
