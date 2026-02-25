'use server';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  productMaterial: z.string().describe('상품의 소재'),
});

export async function extractProductMaterial(
  textContent: string
): Promise<string | null> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `
주어지는 문자열은 의류 상품의 상세 정보야.
이 중에서 상품의 소재를 추출해줘.
        `,
      },
      {
        role: 'user',
        content: JSON.stringify(textContent),
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
      'extract-product-material'
    );
  }

  const resp = completion.choices[0].message.parsed;
  return resp?.productMaterial ?? null;
}
