'use server';

import type { ProductOption } from '@/types/product-option';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  optionName: z.string(),
  optionValues: z.array(
    z.object({
      optionText: z.string(),
    })
  ),
});

export async function extractSizeOption(
  itemOptions: ProductOption[]
): Promise<ProductOption | null> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content:
          '주어진 배열은 상품의 구매 옵션들 정보야. 이 중에서 사이즈에 해당하는 요소를 찾아서 반환해줘',
      },
      { role: 'user', content: JSON.stringify(itemOptions) },
    ],
    response_format: zodResponseFormat(ResponseDataType, 'data'),
  });

  const endTime = Date.now();
  const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(1));

  const totalTokens = completion.usage?.total_tokens;

  if (totalTokens) {
    await createTokenUsage(totalTokens, durationSeconds, 'extract-size-option');
  }

  const resp = completion.choices[0].message.parsed;
  return resp;
}
