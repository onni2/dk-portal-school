/**
 * Shared API types: the error shape thrown by the HTTP client and a generic paginated response wrapper.
 * Uses: nothing — standalone file
 * Exports: ApiError, PaginatedResponse
 * Author: Haukur — example/scaffold, use as template
 */
export interface ApiError {
  message: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
