'use server';
import type {
  SelectMember,
  SelectProductSpecification,
  SelectReview,
} from '@repo/database';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { getSizePrompt } from '../size-prompt/getSizePrompt';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  sizeResult: z.array(
    z.object({
      // size: z.string().describe('사이즈'),
      // best: z.boolean().describe('가장 잘 맞는 사이즈 여부'),
      // avgScore: z.number().describe('사이즈 핏(fit) 점수 (0~100)'),
      title: z.string().describe('분석 결과 제목'),
      subTitle: z.string().describe('분석 결과 부제목'),
      descriptions: z.array(z.string()).describe('분석 결과 설명'),
    })
  ),
});

export async function analyzeSizeDetail(payload: {
  targetProductSpecs: SelectProductSpecification[];
  memberReviews: {
    review: SelectReview;
    spec: SelectProductSpecification;
  }[];
  member: SelectMember;
  mallId: number;
  size: string;
  productId: number;
  productMaterial: string | null;
}): Promise<{
  title: string;
  subTitle: string;
  descriptions: string[];
  inputData: any;
} | null> {
  const gptModel = 'gpt-4.1-mini';
  const sizePromptResponse = await getSizePrompt();
  const sizePrompt = sizePromptResponse.data?.sizePrompt;
  const inputData = {
    targetProductSpecs: payload.targetProductSpecs,
    memberReviews: payload.memberReviews,
    member: payload.member,
    size: payload.size,
    productMaterial: payload.productMaterial,
  };

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
${sizePrompt.prompt}

데이터 구조:
사용자가 구매하려는 의류의 사이즈 상세정보(targetProductSpecs), 사용자의 신체 치수 정보(member), 사용자가 이전에 구매한 상품의 상세정보 및 그에 대한 리뷰(memberReviews), 상품의 소재(productMaterial)가 주어졌을 때, 리뷰 데이터와 사용자의 신체치수를 기반으로 사용자가 구매하려는 의류의 사이즈를 분석합니다.

- targetProductSpecs의 요소 중 파라미터로 전달한 size와 일치하는 요소의 title, subTitle, descriptions를 결정합니다.
`,
      },
      {
        role: 'user',
        content: JSON.stringify(inputData),
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
    'size-recommendation-detail',
    payload.mallId,
    payload.productId
  );

  const resp = completion.choices[0].message.parsed;

  if (!resp?.sizeResult[0]) {
    return null;
  }

  return {
    ...resp.sizeResult[0],
    inputData,
  };
}
