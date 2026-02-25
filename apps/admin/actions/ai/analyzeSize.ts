'use server';
import type { SizeResult } from '@/types/widget-request';
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
      size: z.string().describe('사이즈'),
      best: z.boolean().describe('가장 잘 맞는 사이즈 여부'),
      avgScore: z.number().describe('사이즈 핏(fit) 점수 (0~100)'),
      title: z.string().describe('분석 결과 제목'),
      subTitle: z.string().describe('분석 결과 부제목'),
      descriptions: z.array(z.string()).describe('분석 결과 설명'),
    })
  ),
});

export async function analyzeSize(payload: {
  targetProductSpecs: SelectProductSpecification[];
  memberReviews: {
    review: SelectReview;
    spec: SelectProductSpecification;
  }[];
  member: SelectMember;
  mallId: number;
  productId: number;
  productMaterial: string | null;
}): Promise<{
  sizeResult: SizeResult[];
  inputData: any;
  duration: string;
  gptModel: string;
  aiTokenUsageId: number;
} | null> {
  const gptModel = 'gpt-4.1-mini';
  const sizePromptResponse = await getSizePrompt();
  const sizePrompt = sizePromptResponse.data?.sizePrompt;

  const inputData = {
    targetProductSpecs: payload.targetProductSpecs,
    memberReviews: payload.memberReviews,
    member: payload.member,
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

- 과거 의류 착용 경험(memberReviews)에서 spec에 대한 사용자의 의견(review) 데이터를 토대로 targetProductSpecs의 각 요소를 평가합니다. 각 요소의 평가 결과 점수는 0~100점 사이로 메기고, avgScore에 저장합니다.
- descriptions에는 이전 구매한 상품의 수치와 그에 대한 평가 결과를 기준으로 spec 항목별 평가 결과를 적어주세요.(3~4개)
- 결과값 요소 중 avgScore가 가장 높은 단 한개만 반드시 best true로 설정해야 합니다. 나머지는 best false로 설정합니다.
- 결과값 요소의 크기는 targetProductSpecs의 요소의 크기와 동일해야 합니다.
- memberReviews 각 요소의 spec은 targetProductSpecs의 각 요소의 spec과 다를 수 있습니다. 이 때, memberReviews 요소의 각 spec에 대한 사용자의 의견(review.content)을 면밀히 분석하여 targetProductSpecs 요소의 각 spec에 대한 점수를 추론해야 합니다.

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
    'size-recommendation',
    payload.mallId,
    payload.productId
  );

  const resp = completion.choices[0].message.parsed;

  if (!resp?.sizeResult) {
    return null;
  }

  return {
    sizeResult: resp.sizeResult,
    duration: durationSeconds.toString(),
    gptModel,
    aiTokenUsageId,
    inputData,
  };
}
