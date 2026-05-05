export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface Cursor {
  after?: string
  before?: string
}

export interface PageParams {
  limit?: number
  cursor?: Cursor
}
