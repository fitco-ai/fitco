import { seoulDayjs } from '@/utils/date';
import { COMPARABLE_DATE_FORMAT } from '@/utils/formatters';
import {
  type AI_TOKEN_USAGES,
  aiTokenUsageTable,
  database,
} from '@repo/database';
import 'server-only';

export async function createTokenUsage(
  token: number,
  durationSeconds: number,
  type: (typeof AI_TOKEN_USAGES)[number]['value'],
  mallId?: number,
  productId?: number
): Promise<{ aiTokenUsageId: number }> {
  const dateStr = seoulDayjs().format(COMPARABLE_DATE_FORMAT);

  const created = await database
    .insert(aiTokenUsageTable)
    .values({
      token,
      dateStr,
      durationSeconds,
      mallId: mallId ?? null,
      type,
      productId: productId ?? null,
    })
    .returning()
    .then((rows) => rows[0]);

  if (!created) {
    throw new Error('Failed to create ai token usage');
  }

  return {
    aiTokenUsageId: created.id,
  };
}
