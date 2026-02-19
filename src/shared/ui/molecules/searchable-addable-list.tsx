'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'

import { cn } from '@/src/shared/lib/utils'

import { Input } from '../input'

interface ItemContentProps<T> {
  item: T
  render: (item: T) => React.ReactNode
}

function ItemContent<T>({ item, render }: ItemContentProps<T>) {
  return <>{render(item)}</>
}

interface SearchableAddableListProps<T> {
  items: T[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  getItemId: (item: T) => string
  getSearchableText: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  searchPlaceholder: string
  searchLabel?: string
  emptyMessage?: string
  noResultsMessage?: string
  selectedLabel?: string
  removeItemAriaLabel?: (item: T) => string
  className?: string
}

export function SearchableAddableList<T>({
  items,
  selectedIds,
  onSelectionChange,
  getItemId,
  getSearchableText,
  renderItem,
  searchPlaceholder,
  searchLabel,
  emptyMessage,
  noResultsMessage,
  selectedLabel,
  removeItemAriaLabel,
  className,
}: SearchableAddableListProps<T>) {
  const [search, setSearch] = useState('')

  const availableItems = useMemo(() => {
    return items.filter((item) => !selectedIds.has(getItemId(item)))
  }, [items, selectedIds, getItemId])

  const filteredItems = useMemo(() => {
    if (!search.trim()) return availableItems
    const q = search.trim().toLowerCase()
    return availableItems.filter((item) => getSearchableText(item).toLowerCase().includes(q))
  }, [availableItems, search, getSearchableText])

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.has(getItemId(item)))
  }, [items, selectedIds, getItemId])

  const handleAdd = (id: string) => {
    const next = new Set(selectedIds)
    next.add(id)
    onSelectionChange(next)
  }

  const handleRemove = (id: string) => {
    const next = new Set(selectedIds)
    next.delete(id)
    onSelectionChange(next)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-2">
        {searchLabel && (
          <label className="text-sm font-medium" htmlFor="search-addable">
            {searchLabel}
          </label>
        )}
        <div className="relative">
          <Search
            className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            id="search-addable"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
            aria-label={searchPlaceholder}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <div className="bg-muted/50 max-h-40 overflow-y-auto p-2">
          {filteredItems.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {availableItems.length === 0 ? emptyMessage : noResultsMessage}
            </p>
          ) : (
            <ul className="space-y-1" role="list">
              {filteredItems.map((item) => {
                const id = getItemId(item)
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => handleAdd(id)}
                      className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                    >
                      <ItemContent item={item} render={renderItem} />
                      <Plus className="text-muted-foreground h-4 w-4 shrink-0" aria-hidden />
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {selectedItems.length > 0 && (
        <div className="space-y-2">
          {selectedLabel && <p className="text-sm font-medium">{selectedLabel}</p>}
          <ul
            className="flex flex-wrap gap-2 rounded-md border bg-muted/30 p-3"
            role="list"
            aria-label={selectedLabel}
          >
            {selectedItems.map((item) => {
              const id = getItemId(item)
              return (
                <li key={id}>
                  <span
                    className={cn(
                      'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm'
                    )}
                  >
                    <ItemContent item={item} render={renderItem} />
                    <button
                      type="button"
                      onClick={() => handleRemove(id)}
                      className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
                      aria-label={removeItemAriaLabel?.(item) ?? id}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
