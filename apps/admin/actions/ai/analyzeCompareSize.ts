'use server';
import type { SizeResult } from '@/types/widget-request';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { getSizePrompt } from '../size-prompt/getSizePrompt';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  compareSummaries: z
    .array(
      z.object({
        size: z.string().describe('사이즈'),
        content: z.string().describe('분석 결과 한 줄 요약'),
      })
    )
    .length(2),
});

export async function analyzeCompareSize(payload: {
  mallId: number;
  size1: SizeResult;
  size2: SizeResult;
  productId: number;
  productMaterial: string | null;
  short?: boolean;
}): Promise<{
  compareSummaries: { size: string; content: string }[];
} | null> {
  const gptModel = 'gpt-4.1-mini';
  const sizePromptResponse = await getSizePrompt();
  const sizePrompt = sizePromptResponse.data?.sizePrompt;

  if (!sizePrompt) {
    throw new Error('sizePrompt not found');
  }

  const startTime = Date.now();

  const completion = await openai.chat.completions.parse({
    model: gptModel,
    messages: [
      {
        role: 'system',
        content: `
${sizePrompt.comparePrompt}

데이터 구조
- 비교할 사이즈 데이터(size1, size2)가 주어졌을 때, 비교할 사이즈 데이터의 내용을 분석하여 비교 결과를 생성합니다.
- 상품의 소재(productMaterial)가 주어졌을 때, 상품의 소재를 고려하여 비교 결과를 생성합니다.
${payload.short && '- 한 줄 요약(content)를 50자 이하로 생성합니다.'}
`,
      },
      {
        role: 'user',
        content: JSON.stringify({
          size1: payload.size1,
          size2: payload.size2,
          productMaterial: payload.productMaterial,
        }),
      },
    ],
    response_format: zodResponseFormat(ResponseDataType, 'data'),
  });

  const endTime = Date.now();
  const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(1));

  // 토큰 사용량 콘솔 출력
  const totalTokens = completion.usage?.total_tokens ?? -1;

  if (totalTokens === -1) {
    throw new Error('Failed to get total tokens');
  }

  const { aiTokenUsageId } = await createTokenUsage(
    totalTokens,
    durationSeconds,
    'size-comparison',
    payload.mallId,
    payload.productId
  );

  const resp = completion.choices[0].message.parsed;

  if (!resp?.compareSummaries) {
    return null;
  }

  return {
    compareSummaries: resp.compareSummaries,
  };
}
