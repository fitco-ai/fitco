'use server';

import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { openai } from './config';
import { createTokenUsage } from './createTokenUsage';

const ResponseDataType = z.object({
  selectedSizeOptionText: z.string(),
});

// COLOR=Ivory, SIZE=M, RADIOBTN=Option
export async function extractSelectedSizeOptionText(
  orderOptionValue: string
): Promise<{ selectedSizeOptionText: string } | null> {
  const startTime = Date.now();
  const completion = await openai.chat.completions.parse({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `주어진 문자열은 상품의 구매 옵션들 정보야. 이 중에서 사이즈에 해당하는 요소를 찾아서 반환해줘
          
          -참고사항
          문자열은 [옵션키]=[옵션값] 형식으로 구성되어 있음.
          사이즈 해당하는 옵션의(=) 뒤의 값을 문자열로 반환할 것.
          예시: COLOR=Ivory, SIZE=M, RADIOBTN=Option
          결과: M
          `,
      },
      { role: 'user', content: orderOptionValue },
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
      'extract-selected-size-option-text'
    );
  }

  const resp = completion.choices[0].message.parsed;
  return resp;
}
