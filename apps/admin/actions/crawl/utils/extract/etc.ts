import { createTokenUsage } from '@/actions/ai/createTokenUsage';
import OpenAI from 'openai';
import type { Page } from 'puppeteer-core';
import type { ExtractSizeDataResult } from '.';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function extractByAI(page: Page): Promise<ExtractSizeDataResult> {
  try {
    console.log('extractByAI');
    page.on('console', (msg) => {
      if (msg.text().includes('[etc]')) {
        console.log('[Browser Console]', msg.text());
      }
    });

    const crawlStart = Date.now();

    const pageText = await page.evaluate(() => {
      // const body = document.body;
      // if (!body) return '';

      // const elementsToRemove = body.querySelectorAll(
      //   'script, style, noscript, iframe, img, video, audio, svg, canvas, audio, svg, canvas, footer, header'
      // );
      // for (const el of elementsToRemove) {
      //   el.remove();
      // }
      // body.querySelector('header')?.remove();
      // body.querySelector('footer')?.remove();
      // body.querySelector('aside')?.remove();

      // body.querySelector('.worldshipLayer')?.remove();
      // body.querySelector('.xans-product-qna')?.remove();
      // body.querySelector('.xans-product-review')?.remove();
      // body.querySelector('.xans-product-relation')?.remove();
      // body.querySelector('.detail_guide')?.remove();
      // // body.querySelector('#footer')?.remove();
      // for (const el of body.querySelectorAll(
      //   '[class^="side"], [class*=" side"]'
      // )) {
      //   el.remove();
      // }

      const detailAreas = document.body.querySelectorAll(
        'div.detailArea, div#prdDetail'
      );

      if (detailAreas.length === 0) {
        return '';
      }

      // const textNodes: string[] = [];
      const textNodeSet = new Set<string>();

      for (const detailArea of detailAreas) {
        const walker = document.createTreeWalker(
          detailArea,
          NodeFilter.SHOW_TEXT,
          null
        );

        let node: Node | null = null;
        while (true) {
          node = walker.nextNode();
          if (!node) {
            break;
          }
          const text = node.textContent?.trim();
          if (text && text.length > 0) {
            textNodeSet.add(text.replace(/[^\p{L}\p{N}\s]/gu, '').trim());
          }
        }
      }

      return Array.from(textNodeSet).join('\n');
    });

    const crawlEnd = Date.now();
    console.log('crawl duration (ms)', crawlEnd - crawlStart);
    console.log('pageText', pageText);

    if (!pageText) {
      throw new Error('페이지에서 텍스트를 추출할 수 없습니다.');
    }

    const completionStart = Date.now();
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: `
당신은 웹페이지에서 의류 사이즈와 소재 정보를 정확하게 추출하는 전문가입니다. 주어지는 웹페이지 문자열 데이터에서 사이즈 정보와 소재 정보를 추출하고, 간결하게 정리해서 응답합니다.

참고사항
- 사이즈명은 반드시 객체의 프로퍼티 첫번째 요소에 하나만 존재해야 함. 사이즈 버전이 여러개인 경우(숏 version, 롱 version 등) 각각 사이즈를 객체로 나눌 것(숏S, 숏M, 롱S, 롱M 등)
- 배열의 요소가 1개이고, 프로퍼티 내에서 사이즈 자체의 이름(S, M, FREE 등)을 파악할 수 없는 경우 첫번째 프로퍼티에 사이즈: FREE를 추가할 것.

반환 예시(JSON 형태):
{
  "sizeData": [
    {
        "사이즈": "S",
        "총기장": "67",
        "어깨": "64",
        "가슴": "70",
        "밑단": "71",
        "소매길이": "51.5",
        "암홀": "28",
        "팔단면": "28",
        "소매밑단": "12"
    },
    {
        "사이즈": "M",
        ...
    },
    ...
],
  "productMaterial": "면 100%",
}

`,
        },
        {
          role: 'user',
          content: pageText,
        },
      ],
    });

    const completionEnd = Date.now();
    console.log(
      '[etc] completion duration (ms)',
      completionEnd - completionStart
    );
    const durationSeconds = Number(
      ((completionEnd - completionStart) / 1000).toFixed(1)
    );

    const totalTokens = completion.usage?.total_tokens;

    if (totalTokens) {
      await createTokenUsage(
        totalTokens,
        durationSeconds,
        'extract-etc-size-data'
      );
    }

    const result = completion.choices[0]?.message?.content || '';

    if (!result) {
      throw new Error('AI에서 사이즈 정보를 추출할 수 없습니다.');
    }

    try {
      const resultData = JSON.parse(result) as ExtractSizeDataResult;
      return resultData;
    } catch (error) {
      console.error(error);
      return null;
    }
  } catch (error) {
    console.error('AI 추출 중 오류 발생:', error);
    return null;
  }
}
