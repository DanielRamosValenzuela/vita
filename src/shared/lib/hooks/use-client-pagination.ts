'use client'

import { useMemo, useState } from 'react'

interface UseClientPaginationOptions<T> {
  items: T[]
  pageSize?: number
  searchFields?: (keyof T)[]
  searchFn?: (item: T, query: string) => boolean
  filterFn?: (item: T) => boolean
}

interface UseClientPaginationReturn<T> {
  paginatedItems: T[]
  filteredItems: T[]
  page: number
  totalPages: number
  total: number
  from: number
  to: number
  search: string
  setPage: (page: number) => void
  setSearch: (search: string) => void
}

export function useClientPagination<T>({
  items,
  pageSize = 10,
  searchFields,
  searchFn,
  filterFn,
}: UseClientPaginationOptions<T>): UseClientPaginationReturn<T> {
  const [page, setPage] = useState(1)
  const [search, setSearchRaw] = useState('')

  const setSearch = (value: string) => {
    setSearchRaw(value)
    setPage(1)
  }

  const filteredItems = useMemo(() => {
    let result = items

    if (filterFn) result = result.filter(filterFn)

    const query = search.trim().toLowerCase()
    if (query)
      if (searchFn) result = result.filter((item) => searchFn(item, query))
      else if (searchFields)
        result = result.filter((item) =>
          searchFields.some((field) => {
            const value = item[field]
            return typeof value === 'string' && value.toLowerCase().includes(query)
          })
        )

    return result
  }, [items, search, searchFields, searchFn, filterFn])

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize))

  const safePage = Math.min(page, totalPages)
  if (safePage !== page) setPage(safePage)

  const from = filteredItems.length === 0 ? 0 : (safePage - 1) * pageSize + 1
  const to = Math.min(safePage * pageSize, filteredItems.length)

  const paginatedItems = useMemo(
    () => filteredItems.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredItems, safePage, pageSize]
  )

  return {
    paginatedItems,
    filteredItems,
    page: safePage,
    totalPages,
    total: filteredItems.length,
    from,
    to,
    search,
    setPage,
    setSearch,
  }
}
