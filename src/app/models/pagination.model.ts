export interface PaginatedResponse<T> {
    items: T[];
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

export const DEFAULT_PAGINATION_STATE: PaginationState = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 1
};
