---
name: newsearch-component-refactor
description: Refactor Vue 2 list pages to the `newMySearch` search component pattern with consistent table sorting, dynamic table height, and `getTimeToText` time rendering. Use when replacing legacy search areas, fixing `el-table` sort behavior, adding `newMySearch` + `Pagination` integration, handling `isDrawer` or `isSrearchComp` modes, or standardizing list-page query flow in the Leisu admin codebase.
---

# newsearch-component-refactor

Refactor the target page to the shared `newMySearch` pattern used in this codebase.

Keep these constraints:
- Use Vue 2.x and Node 12 compatible syntax.
- Avoid optional chaining, nullish coalescing, and fragile chained array transforms in hot paths.
- Preserve existing business logic unless the refactor explicitly replaces it.

Use bundled references selectively:
- Read `references/reference.md` when you need full component patterns, lifecycle examples, or mode-specific snippets.
- Read `references/checklist.md` before finishing to catch integration omissions.

Follow this workflow:

## 1. Normalize imports and component setup

Add or verify:
- `Pagination` and `newMySearch`
- `getH` in `mixins`
- `getTimeToText`, `processInKeys`, `headerCellStyle`, `tableOrderbyCond` from `@/utils/tool.js`
- Required dictionary constants from `@/utils/dict.js`

Declare tool helpers and dictionaries in `data()` when the component uses them in template expressions.

## 2. Normalize state

Ensure `data()` includes:
- `refName`
- `list`, `total`, `listLoading`
- `listQuery` with `page`, `limit`, and `orderby_cond: []`
- `outParameter: {}`

Keep `refName` stable per render mode so resize observation and table height calculation resolve against the correct container.

## 3. Configure lifecycle hooks

In `created()`, set `refName` and any mode-specific `outParameter` values.

Use one of these patterns:
- Standard mode: default to `"componentContainer"`
- `isDrawer` mode: switch to a unique drawer ref and propagate `uid`-derived parameters when needed
- `isSrearchComp` mode: switch to a unique search ref and propagate `sportId` or `gameId` derived parameters when needed

In `mounted()`, call `setupResizeObserver(this.refName)` only when the referenced container exists.

## 4. Refactor the template

Wrap `newMySearch` with a container using `:ref="refName"`.

Ensure the table uses:
- `:height="heightTableMixins(refName, offset)"`
- `:header-cell-style="e => headerCellStyle(listQuery.orderby_cond, e)"`
- `@sort-change="sortChange"`

Replace legacy time rendering with `getTimeToText`.

When the page has drawer-only or selector-only behavior, gate those columns or click targets with the relevant mode flag instead of duplicating the whole table.

## 5. Refactor `getList`

Implement `getList(obj, callback)` with this behavior:
- Reset to page 1 when called from `newMySearch` via `obj.myDataSearch`
- Reuse `this.listQuery` for pagination-only reloads
- Preserve `orderby_cond` when rebuilding request payloads
- Wrap the final payload with `processInKeys(data)` before the API call
- Update `list`, `total`, and `listQuery` from the resolved payload
- Re-layout the table with `this.$refs[tableRef].doLayout()` after data changes
- Always clear loading in `finally`
- Call `callback(true)` when a callback is provided

Check `search_cond` or other nested objects before reading or mutating them.

## 6. Refactor sorting

Implement `sortChange(options)` to:
- Reset `listQuery.page` to `1`
- Recompute `listQuery.orderby_cond` with `tableOrderbyCond`
- Trigger `getList()`

Do not hand-roll sort arrays when the shared helper already handles the codebase format.

## 7. Preserve page-specific logic

When the page contains custom search conversions or unsupported fields:
- Split composite search values before the request
- Remove unsupported keys from `search_cond`
- Map status or time filters to the backend format expected by the page

Keep these transformations close to payload construction so pagination and search requests share the same normalization path.

## 8. Verify before finishing

Use `references/checklist.md` as the final pass.

Pay extra attention to:
- Missing `orderby_cond` initialization
- Missing `setupResizeObserver`
- Table ref mismatches that break `doLayout()`
- Missing `callback` guards
- Missing default branch in `isSrearchComp` mode
