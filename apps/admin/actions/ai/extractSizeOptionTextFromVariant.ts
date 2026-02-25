import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  selectedSizeOptionText: z.string(),
});

export async function extractSizeOptionTextFromVariant(
  options: { name: string; value: string }[]
): Promise<string> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `주어진 상품의 옵션 정보들 중 사이즈에 해당하는 옵션을 찾아서 그 옵션의 값을 반환한다.
          
          참고사항
          - 객체의 name은 옵션명, value는 옵션의 값.
          - 옵션명이 사이즈, SIZE 등 사이즈와 관련있는 경우 사이즈 옵션으로 간주한다.
          - 옵션 배열 중 사이즈 옵션이라고 추론되는 옵션이 없는 경우 "FREE"를 반환한다.
          - 옵션 배열의 길이가 0인 경우 "FREE"를 반환한다.

          인풋 예시: [{ name: '사이즈', value: 'S' }, { name: '색상', value: '레드' }]
          반환 예시: S


          `,
      },
      {
        role: 'user',
        content: JSON.stringify(options),
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
      'extract-size-option-text-from-variant'
    );
  }

  const resp = completion.choices[0].message.parsed;
  return resp?.selectedSizeOptionText ?? 'FREE';
}
