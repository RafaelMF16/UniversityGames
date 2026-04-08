export interface CursorPaginatedResponse<T> {
    items: T[];
    page_size: number;
    next_cursor: string | null;
    has_next: boolean;
}

export interface CursorPaginationState {
    page: number;
    pageSize: number;
    currentCursor: string | null;
    nextCursor: string | null;
    hasNext: boolean;
    cursorStack: Array<string | null>;
}

export const DEFAULT_CURSOR_PAGINATION_STATE: CursorPaginationState = {
    page: 1,
    pageSize: 10,
    currentCursor: null,
    nextCursor: null,
    hasNext: false,
    cursorStack: []
};
