export interface IPagination<T> {
  meta: {
    total: number;
    limit: number;
    page: number;
    totalPages: number;
  };
  links: {
    first: string;
    last: string;
    current: string;
    next: string;
    previous: string;
  };
  data: T[];
}
