'use server';
import type { SizeData } from '../crawl/utils/types';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

export async function checkSmartfitSizeData(
  sizeData: SizeData
): Promise<SizeData | null> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `주어지는 객체는 상품의 사이즈 상세값이야. 이 객체의 프로퍼티 중 사이즈 프로퍼티가 없는 경우 객체의 맨 처음 프로퍼티를 사이즈 프로퍼티로 추가해줘.

        참고사항
        - 첫번째 프로퍼티에 key:사이즈, value: "FREE"를 추가하고 나머지 프로퍼티는 그대로 반환.
        - 만약 첫번째 프로퍼티에 사이즈를 의미하는 프로퍼티 키가 있다면, 아무 작업도 하지 않고 값을 그대로 반환.
        - 사이즈를 의미하는 프로퍼티는 "사이즈", "사이즈명", "size", 등 다양할 수 있음. "총장", "허리", "가슴" 등 상세 사항을 의미하는 프로퍼티는 사이즈 프로퍼티가 아님.
        - 반드시 유효한 JSON 배열 형태로만 반환해야 함.
        - 코드블록은 생략.
        - 다른 설명이나 텍스트는 포함하지 말고 순수한 JSON만 반환.

        반환 예시: {사이즈: "S", 총장: "100", 허리: "30", 엉덩이: "40"}
        `,
      },
      { role: 'user', content: JSON.stringify(sizeData) },
    ],
  });

  const endTime = Date.now();
  const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(1));

  const totalTokens = completion.usage?.total_tokens;

  if (totalTokens) {
    await createTokenUsage(totalTokens, durationSeconds, 'smartfit-size-data');
  }

  const resp = completion.choices[0].message.content ?? '';

  try {
    const result = JSON.parse(resp) as SizeData;
    return result;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}
