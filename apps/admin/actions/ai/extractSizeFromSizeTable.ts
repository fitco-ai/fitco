'use server';
import type { SizeData } from '../crawl/utils/types';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

export async function extractSizeFromSizeTable(
  sizeTable: string
): Promise<SizeData[] | null> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `주어지는 문자열은 HTML table 태그의 outerHTML값이야. table은 상품의 사이즈 상세사항에 대한 데이터인데, 테이블의 데이터를 파싱해서 JSON 배열 형태로 반환해줘.

        참고사항
        - 모든 요소의 첫번째 프로퍼티는 "사이즈"여야 함.
        - 모든 요소의 두번째 프로퍼티부터 마지막 프로퍼티까지는 각 사이즈의 상세 사항임.
        - 반드시 유효한 JSON 배열 형태로만 반환해야 함.
        - 코드블록은 생략.
        - 다른 설명이나 텍스트는 포함하지 말고 순수한 JSON만 반환.
        
        반환 예시: [{사이즈: "S", 총장: "100", 허리: "30", 엉덩이: "40"}, {사이즈: "M", 총장: "100", 허리: "30", 엉덩이: "40"}, {사이즈: "L", 총장: "100", 허리: "30", 엉덩이: "40"}]

        
        `,
      },
      { role: 'user', content: sizeTable },
    ],
  });

  const endTime = Date.now();
  const durationSeconds = Number(((endTime - startTime) / 1000).toFixed(1));

  const totalTokens = completion.usage?.total_tokens;

  if (totalTokens) {
    await createTokenUsage(
      totalTokens,
      durationSeconds,
      'extract-size-from-size-table'
    );
  }

  const resp = completion.choices[0].message.content ?? '';

  try {
    const result = JSON.parse(resp) as SizeData[];
    return result;
  } catch (error) {
    console.error('JSON parse error:', error);
    return null;
  }
}
