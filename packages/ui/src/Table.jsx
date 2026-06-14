/**
 * A data table.
 *
 * Column-driven rather than markup-driven, so padding, alignment, header
 * treatment and the horizontal-scroll wrapper are decided once. Each column is
 * `{ key, header, render?, className?, headerClassName? }`; `render(row)` is
 * there because most real cells are not plain strings — they hold a pill, an
 * icon, a formatted date.
 *
 * Two things that are easy to leave out and matter:
 *
 *  - `caption` is rendered visually hidden. A screen reader user landing on a
 *    table hears its name; without one they hear "table, six columns" and have
 *    to infer the rest.
 *  - `scope="col"` on the headers is what lets assistive tech read the column
 *    name before each cell. A bare <th> does not do that reliably.
 *
 * The wrapper scrolls horizontally on narrow screens with `min-w`, rather than
 * collapsing to cards. Collapsing is nicer, and is a Part 9 problem — it needs
 * a per-column priority that this table does not yet have.
 */
export const Table = ({
  caption,
  columns,
  rows,
  rowKey = (row, index) => row?._id ?? index,
  minWidth = "720px",
  className = "",
}) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full text-left text-sm" style={{ minWidth }}>
      {caption && <caption className="sr-only">{caption}</caption>}

      <thead className="bg-surface-muted text-xs uppercase tracking-wide text-fg-subtle">
        <tr>
          {columns.map((column) => (
            <th
              key={column.key}
              scope="col"
              className={`px-6 py-3 font-semibold ${column.headerClassName || ""}`}
            >
              {column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody className="divide-y divide-line">
        {rows.map((row, index) => (
          <tr key={rowKey(row, index)} className="transition hover:bg-surface-muted">
            {columns.map((column) => (
              <td key={column.key} className={`px-6 py-4 ${column.className || ""}`}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
