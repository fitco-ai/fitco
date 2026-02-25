import {
  createSearchParamsCache,
  type inferParserType,
  parseAsInteger,
  parseAsString,
} from 'nuqs/server';

export const commonParsers = {
  q: parseAsString.withDefault(''),
  qKey: parseAsString.withDefault('all'),
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(50),
  sorting: parseAsString.withDefault('createdAt.desc'),
};

export const commonCache = createSearchParamsCache(commonParsers);

export type CommonSearchParams = inferParserType<typeof commonParsers>;

export const productsParsers = {
  q: parseAsString.withDefault(''),
  qKey: parseAsString.withDefault('all'),
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(50),
  sorting: parseAsString.withDefault('productName.desc'),
};

export const productsCache = createSearchParamsCache(productsParsers);

export type ProductsSearchParams = inferParserType<typeof productsParsers>;

export const aiTokenUsageParsers = {
  q: parseAsString.withDefault(''),
  qKey: parseAsString.withDefault('all'),
  pageIndex: parseAsInteger.withDefault(0),
  pageSize: parseAsInteger.withDefault(50),
  sorting: parseAsString.withDefault('dateStr.desc'),
};

export const aiTokenUsageCache = createSearchParamsCache(aiTokenUsageParsers);

export type AiTokenUsageSearchParams = inferParserType<
  typeof aiTokenUsageParsers
>;
