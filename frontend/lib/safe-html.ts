const URL_PATTERN = /(https?:\/\/[^\s<]+)/g

function linkifyNode(node: ChildNode) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent ?? ""
    URL_PATTERN.lastIndex = 0
    if (!URL_PATTERN.test(text)) return
    URL_PATTERN.lastIndex = 0

    const frag = document.createDocumentFragment()
    let lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = URL_PATTERN.exec(text))) {
      if (match.index > lastIndex) {
        frag.appendChild(document.createTextNode(text.slice(lastIndex, match.index)))
      }
      const a = document.createElement("a")
      a.href = match[0]
      a.textContent = match[0]
      frag.appendChild(a)
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < text.length) {
      frag.appendChild(document.createTextNode(text.slice(lastIndex)))
    }
    node.parentNode?.replaceChild(frag, node)
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element
    if (el.tagName === "A") return
    Array.from(node.childNodes).forEach(linkifyNode)
  }
}

/** Wraps any bare http(s):// URLs found in text nodes with real <a> tags, without touching existing links or markup. */
export function linkifyHtml(html: string): string {
  if (typeof document === "undefined") return html
  const container = document.createElement("div")
  container.innerHTML = html
  Array.from(container.childNodes).forEach(linkifyNode)
  return container.innerHTML
}

export function withSafeLinks(html: string) {
  return html.replace(/<a /g, '<a target="_blank" rel="noreferrer" ')
}

export function prepareAnnouncementHtml(html: string): string {
  return withSafeLinks(linkifyHtml(html))
}
