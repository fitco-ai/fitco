export type ServerActionResponse<T> = Promise<{
  ok: boolean;
  data?: T;
}>;

export type MyGlobalFilter = { q: string; qKey: string };

export type MyColumnMeta = {
  name?: string;
  filterVariant?: 'text' | 'date';
};

export type PageHeaderItem = {
  title: string;
  href?: string;
};

export type ComparePeriod = '1m' | '3m' | '6m' | '1y';
