import { Spinner } from './Common'

export default function DataTable({ columns, data, isLoading, keyField = 'id', onRowClick, emptyMessage = 'No records found.' }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-dusk-50 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-dusk-50 bg-canvas-alt/60">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            )}
            {!isLoading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-ink-soft">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {!isLoading && data.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-dusk-50 last:border-0 ${onRowClick ? 'cursor-pointer hover:bg-canvas-alt/50' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="whitespace-nowrap px-4 py-3.5 text-ink">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
