import {
  type SelectSizePrompt,
  database,
  sizePromptTable,
} from '@repo/database';
import 'server-only';

export async function resolveSizePrompt(): Promise<SelectSizePrompt> {
  let sizePrompt = await database
    .select()
    .from(sizePromptTable)
    .then((rows) => rows[0]);

  if (!sizePrompt) {
    sizePrompt = await database
      .insert(sizePromptTable)
      .values({
        prompt: '',
      })
      .returning()
      .then((rows) => rows[0]);
  }

  return sizePrompt;
}
