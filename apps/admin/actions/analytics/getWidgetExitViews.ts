'use server';

import type { WidgetViews } from '@/const';
import type { ServerActionResponse } from '@/types';
import { analyticsTable, and, database, eq } from '@repo/database';

export type ExitView = {
  view: keyof WidgetViews;
  count: number;
};

export async function getWidgetExitViews({
  mallId,
  shopNo,
}: { mallId: number | null; shopNo: number | null }): ServerActionResponse<{
  exitViews: ExitView[];
}> {
  try {
    const data =
      mallId === null && shopNo === null
        ? await database.select().from(analyticsTable)
        : await database
            .select()
            .from(analyticsTable)
            .where(
              and(
                eq(analyticsTable.mallId, mallId as number),
                eq(analyticsTable.shopNo, shopNo as number)
              )
            );

    const obj: {
      [key: string]: number;
    } = {};

    for (const analytics of data) {
      const view = analytics.exitView as keyof WidgetViews;
      if (!view) {
        continue;
      }
      if (obj[view]) {
        obj[view] += 1;
      } else {
        obj[view] = 1;
      }
    }

    const result: ExitView[] = Object.entries(obj).map((entry) => {
      const view = entry[0] as keyof WidgetViews;
      const count = entry[1];
      return {
        view,
        count,
      };
    });

    return {
      ok: true,
      data: {
        exitViews: result,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      ok: false,
    };
  }
}
