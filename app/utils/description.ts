export type DescBlock =
  | { type: 'ul', items: string[] }
  | { type: 'ol', items: string[] }
  | { type: 'p', text: string }

// Parse plain-text content into structured blocks so list-style input
// ("- item" / "1. item") can be rendered as a vertical <ul>/<ol> instead of a
// single run-together line — Tailwind's preflight strips default list styles,
// so without this list items collapse onto one line. Accepts null/undefined
// for fields that may be empty in the database.
export function parseDescription(desc: string | null | undefined): DescBlock[] {
  const blocks: DescBlock[] = []
  const lines = (desc || '').split('\n')
  let kind: 'ul' | 'ol' | 'p' | null = null
  let items: string[] = []
  let para: string[] = []
  const flush = () => {
    if (kind === 'ul') blocks.push({ type: 'ul', items })
    else if (kind === 'ol') blocks.push({ type: 'ol', items })
    else if (kind === 'p') blocks.push({ type: 'p', text: para.join('\n') })
    kind = null
    items = []
    para = []
  }
  const ulRe = /^\s*[-*+]\s+(.*)$/
  const olRe = /^\s*\d+[.)]\s+(.*)$/
  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '')
    const trimmed = line.trim()
    if (!trimmed) { flush(); continue }
    const um = ulRe.exec(line)
    const om = olRe.exec(line)
    const lineKind: 'ul' | 'ol' | 'p' = um ? 'ul' : om ? 'ol' : 'p'
    if (lineKind !== kind) { flush(); kind = lineKind }
    if (lineKind === 'p') para.push(trimmed)
    else items.push(um ? um[1]!.trim() : om![1]!.trim())
  }
  flush()
  return blocks
}
