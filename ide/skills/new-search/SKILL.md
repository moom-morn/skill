---
name: new-search
description: Refactor Vue2 list components to use `newMySearch` with standard search, sorting, pagination, responsive table height, and unified time formatting. Use when migrating list pages to `newMySearch`, fixing table sort behavior, adapting drawer or search-selector modes, or standardizing list-page search structure.
disable-model-invocation: true
---

# New Search

Refactor Vue2 list pages to the `newMySearch` pattern with a consistent structure.

## When to Use

- Migrate an existing Vue2 list page to `newMySearch`
- Fix table sorting not taking effect
- Make the table height follow the search area dynamically
- Replace old time filters such as `ParseTime`
- Adapt a page for drawer mode or search-selector mode
- Standardize list-page search, pagination, and sort behavior

## Instructions

### Core rules

- Use Vue2-compatible syntax only
- Initialize `listQuery.orderby_cond` as `[]`
- Handle sort changes with `tableOrderbyCond`
- Use `getTimeToText` for time rendering instead of `ParseTime`
- Prefer dictionary constants for status display
- Keep changes focused on the target component unless the user asks for related files too

### Refactor workflow

1. Read the target component and determine whether it is a normal list, drawer list, or search-selector list.
2. Add the base structure first: `newMySearch`, `listQuery`, `getList`, `sortChange`, `pagination`.
3. Then adapt time rendering, status dictionaries, and any API-specific search parameter transforms.
4. Validate search, sorting, pagination, and table height before finishing.

### Required implementation points

- Import `Pagination`, `newMySearch`, `getH`, `getTimeToText`, `processInKeys`, `headerCellStyle`, `tableOrderbyCond`
- Register `Pagination` and `newMySearch`, then mix in `getH`
- Add `list`, `total`, `listLoading`, `refName`, `outParameter`, `listQuery`
- In `created`, set `refName` and `outParameter` by mode
- In `mounted`, call `setupResizeObserver(this.refName)` when the ref exists
- In the template, bind `newMySearch`, `el-table`, and `pagination` to the standard methods and fields
- In `getList`, preserve `orderby_cond`, support `callback`, and call `doLayout` after rendering

### Search config

- Search fields: `src/components/newMySearch/components/searchKey/compKey/`
- Top quick-search keys: `src/components/newMySearch/components/searchTopKey/topKeyItem/`
- Build select options from dictionaries with `Object.values(...)`

### Special cases

- Drawer mode: switch `refName`, hide unneeded history, pass fixed params when needed
- Search-selector mode: support `isSrearchComp`, `sportId`, `gameId`, and emit selected row data
- API-specific search transforms: split composite fields, remove unsupported fields, or map business states to time-range params only when the API requires it

### Additional reference

For full code templates and low-frequency examples, read [references/REFERENCE.md](references/REFERENCE.md).

## Checklist

Before finishing, verify:

- `newMySearch` is wired to `getList`
- `listQuery.orderby_cond` is initialized
- Table sort is bound to `sortChange`
- Header style uses `headerCellStyle`
- Pagination is bound to `listQuery.page` and `listQuery.limit`
- Table height uses `heightTableMixins`
- `mounted` calls `setupResizeObserver`
- Time rendering uses `getTimeToText`
- Status rendering uses dictionary constants
- Search config uses the correct `sourceKey`

## Troubleshooting

### Sorting does not work

- Check whether `orderby_cond` is initialized as `[]`
- Check whether `@sort-change="sortChange"` is bound
- Check whether `headerCellStyle` is applied
- Check whether `sortChange` triggers `getList`

### Table height does not change

- Check whether `getH` is mixed in
- Check whether `setupResizeObserver` is called in `mounted`
- Check whether the search container has the correct `ref`
- Check whether the table uses `heightTableMixins`

### `Object.keys` throws an error

```javascript
if (data.search_cond && typeof data.search_cond === "object") {
    Object.keys(data.search_cond).forEach(() => {})
}
```

## Reference

For project-specific details, see `.cursor/rules/corsor.mdc`.
