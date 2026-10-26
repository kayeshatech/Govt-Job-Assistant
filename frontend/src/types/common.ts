export type ApiResponse<T> = {
  data: T;
  success: boolean;
  message?: string;
  isSampleData?: boolean;
  total?: number;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type FilterOption = {
  label: string;
  value: string;
  count?: number;
};
