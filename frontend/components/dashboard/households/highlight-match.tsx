interface HighlightMatchProps {
  text: string
  query: string
}

export function HighlightMatch({ text, query }: HighlightMatchProps) {
  const term = query.trim()
  if (!term) return <>{text}</>

  const index = text.toLowerCase().indexOf(term.toLowerCase())
  if (index === -1) return <>{text}</>

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-sm bg-[#FEF08A] px-0.5 text-inherit">{text.slice(index, index + term.length)}</mark>
      {text.slice(index + term.length)}
    </>
  )
}
