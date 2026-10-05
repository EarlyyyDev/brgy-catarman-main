export function parseCsvRecords(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ""
  let quoted = false
  const input = text.replace(/^\uFEFF/, "")

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index]
    if (quoted) {
      if (character === '"' && input[index + 1] === '"') {
        cell += '"'
        index += 1
      } else if (character === '"') {
        quoted = false
      } else {
        cell += character
      }
    } else if (character === '"' && cell.length === 0) {
      quoted = true
    } else if (character === ",") {
      row.push(cell)
      cell = ""
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && input[index + 1] === "\n") index += 1
      row.push(cell)
      if (row.some((value) => value.trim() !== "")) rows.push(row)
      row = []
      cell = ""
    } else {
      cell += character
    }
  }

  if (quoted) throw new Error("CSV contains an unclosed quoted field.")
  row.push(cell)
  if (row.some((value) => value.trim() !== "")) rows.push(row)
  if (rows.length < 2) throw new Error("CSV must include a header row and at least one record.")

  const headers = rows[0].map((header) => header.trim())
  if (headers.some((header) => !header) || new Set(headers).size !== headers.length) {
    throw new Error("CSV headers must be non-empty and unique.")
  }

  return rows.slice(1).map((values) => {
    if (values.length !== headers.length) throw new Error("CSV rows must have the same number of columns as the header.")
    return Object.fromEntries(headers.map((header, index) => [header, values[index].trim()]))
  })
}

export function createCsv(headers: string[], rows: unknown[][]): string {
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value)
    return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  return `\uFEFF${[headers, ...rows].map((row) => row.map(escape).join(",")).join("\r\n")}`
}

export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
    return entities[character]
  })
}

export function printTable(title: string, headers: string[], rows: unknown[][]) {
  const printWindow = window.open("", "_blank", "popup,width=1000,height=760")
  if (!printWindow) return false

  const tableRows = rows
    .map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`)
    .join("")
  printWindow.document.write(`<!doctype html><html><head><title>${escapeHtml(title)}</title><style>
    body{font-family:Arial,sans-serif;color:#172033;padding:28px}h1{font-size:20px;margin:0 0 6px}p{font-size:11px;color:#5b6472;margin:0 0 18px}
    table{border-collapse:collapse;width:100%;font-size:11px}th,td{border:1px solid #d7dce3;padding:7px;text-align:left;vertical-align:top}th{background:#eef2f7;font-weight:700}
    @media print{body{padding:0}thead{display:table-header-group}tr{break-inside:avoid}}
  </style></head><body><h1>${escapeHtml(title)}</h1><p>Printed ${escapeHtml(new Date().toLocaleString())} · ${rows.length} records</p>
  <table><thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead><tbody>${tableRows}</tbody></table>
  <script>window.addEventListener('load',()=>{window.focus();window.print();window.close()})</script></body></html>`)
  printWindow.document.close()
  return true
}