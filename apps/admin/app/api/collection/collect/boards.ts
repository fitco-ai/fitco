import { getAllMallShopsByMallId } from '@/actions/cafe24/getAllMallShopsByMallId';
import {
  resolveCafe24AccessToken,
  resolveCafe24MallId,
} from '@/actions/cafe24/utils';
import { getAllMalls } from '@/actions/malls/getAllMalls';
import { getAllMallProductsByMallId } from '@/actions/products/getAllMallProductsByMallId';
import type {
  Cafe24Board,
  Cafe24BoardArticle,
  Cafe24GetAllBoardArticlesResponse,
  Cafe24GetAllBoardsResponse,
} from '@/types';
import { seoulDayjs } from '@/utils/date';
import { boardArticleTable, database, eq, mallTable } from '@repo/database';

// 정기 수집
export async function collectBoards() {
  try {
    const allMallsResponse = await getAllMalls();
    const allMalls = allMallsResponse.data?.malls;

    if (!allMalls) {
      throw new Error('getAllMalls failed');
    }

    // 3년치 데이터를 2개월씩 나눠서 요청
    const endDate = seoulDayjs();
    const startDate = seoulDayjs().subtract(3, 'month');

    // 2개월씩 chunk로 나누기
    const dateChunks: Array<{ start: string; end: string }> = [];
    let currentStart = startDate.clone();

    while (currentStart.isBefore(endDate)) {
      const chunkEnd = currentStart.add(2, 'month').isAfter(endDate)
        ? endDate
        : currentStart.add(2, 'month');

      dateChunks.push({
        start: currentStart.format('YYYY-MM-DD'),
        end: chunkEnd.format('YYYY-MM-DD'),
      });

      currentStart = chunkEnd.add(1, 'day');
    }

    const result: (Cafe24BoardArticle & { mallId: number })[] = [];

    for (const mall of allMalls) {
      const accessToken = await resolveCafe24AccessToken(mall.id);
      const cafe24MallId = await resolveCafe24MallId(mall.id);

      if (!accessToken || !cafe24MallId) {
        throw new Error('Invalid Request');
      }

      const allProductsResponse = await getAllMallProductsByMallId(mall.id);
      const allMallProducts = allProductsResponse.data?.products ?? [];
      const { boards } = await getAllBoardsByCafe24MallId(
        accessToken,
        mall.id,
        cafe24MallId
      );
      const boardNos = boards.map((board) => board.board_no);

      // 초기 3년치 데이터 이미 수집된 경우, 어제 데이터만 수집
      if (mall.initialBoardCollected) {
        const yesterday = seoulDayjs().subtract(1, 'day').format('YYYY-MM-DD');
        for (const product of allMallProducts) {
          const { articles } = await fetchProductBoardArticles(
            cafe24MallId,
            accessToken,
            product.shopNo,
            product.productNo,
            boardNos,
            yesterday,
            yesterday
          );
          result.push(
            ...articles.map((article) => ({
              ...article,
              mallId: mall.id,
            }))
          );
        }
        continue;
      }

      for (const dateChunk of dateChunks) {
        for (const product of allMallProducts) {
          const { articles } = await fetchProductBoardArticles(
            cafe24MallId,
            accessToken,
            product.shopNo,
            product.productNo,
            boardNos,
            dateChunk.start,
            dateChunk.end
          );
          result.push(
            ...articles.map((article) => ({ ...article, mallId: mall.id }))
          );
        }
      }

      await database
        .update(mallTable)
        .set({ initialBoardCollected: true })
        .where(eq(mallTable.id, mall.id));
    }

    if (result.length > 0) {
      await insertBoardArticles(result);
    }

    console.log(`사이즈 게시판 수집 완료: count: ${result.length}`);
  } catch (error) {
    console.error(error);
  }
}

async function getAllBoardsByCafe24MallId(
  accessToken: string,
  mallId: number,
  cafe24MallId: string
): Promise<{ boards: Cafe24Board[] }> {
  try {
    const allMallShopsResponse = await getAllMallShopsByMallId(mallId);
    const allMallShops = allMallShopsResponse.data?.shops ?? [];

    const result: Cafe24Board[] = [];

    for (const shop of allMallShops) {
      const response = await fetch(
        `https://${cafe24MallId}.cafe24api.com/api/v2/admin/boards?shop_no=${shop.shopNo}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Cafe24-Api-Version': process.env.CAFE24_API_VERSION as string,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      const data = (await response.json()) as Cafe24GetAllBoardsResponse;

      result.push(...(data.boards ?? []));
    }

    return { boards: result };
  } catch (error) {
    console.error(error);
    return { boards: [] };
  }
}

async function fetchProductBoardArticles(
  cafe24MallId: string,
  accessToken: string,
  shopNo: number,
  productNo: number,
  boardNos: number[],
  startDate: string,
  endDate: string
): Promise<{ articles: Cafe24BoardArticle[] }> {
  try {
    const result: Cafe24BoardArticle[] = [];
    for (const boardNo of boardNos) {
      const response = await fetch(
        `https://${cafe24MallId}.cafe24api.com/api/v2/admin/boards/${boardNo}/articles?shop_no=${shopNo}&product_no=${productNo}&search=subject&keyword=사이즈&start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Cafe24-Api-Version': process.env.CAFE24_API_VERSION as string,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error));
      }

      const data = (await response.json()) as Cafe24GetAllBoardArticlesResponse;

      result.push(...(data.articles ?? []));
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    return { articles: result };
  } catch (error) {
    console.error(error);
    return { articles: [] };
  }
}

async function insertBoardArticles(
  boardArticles: (Cafe24BoardArticle & { mallId: number })[]
) {
  try {
    await database
      .insert(boardArticleTable)
      .values(
        boardArticles.map((a) => ({
          mallId: a.mallId,
          shopNo: a.shop_no,
          boardNo: a.board_no,
          articleNo: a.article_no,
          productNo: a.product_no,
          createdDate: seoulDayjs(a.created_date).format('YYYY-MM-DD'),
        }))
      )
      // 동일한 글 인데 서로 다른 게시판 카테고리에서 같이 조회될 수 있음?
      .onConflictDoNothing({
        target: [
          boardArticleTable.mallId,
          boardArticleTable.shopNo,
          boardArticleTable.boardNo,
          boardArticleTable.articleNo,
        ],
      });
    return {
      ok: true,
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
