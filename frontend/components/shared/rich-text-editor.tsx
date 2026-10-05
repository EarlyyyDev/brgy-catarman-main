"use client"

import * as React from "react"
import { Bold, Italic, Link2, List, ListOrdered, Underline } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

const TOOLBAR_ACTIONS = [
  { command: "bold", icon: Bold, label: "Bold" },
  { command: "italic", icon: Italic, label: "Italic" },
  { command: "underline", icon: Underline, label: "Underline" },
  { command: "insertUnorderedList", icon: List, label: "Bullet List" },
  { command: "insertOrderedList", icon: ListOrdered, label: "Numbered List" },
]

export function RichTextEditor({ value, onChange, placeholder = "Write your content here...", className }: RichTextEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null)
  const isInitialized = React.useRef(false)

  React.useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      editorRef.current.innerHTML = value || ""
      isInitialized.current = true
    }
  }, [value])

  function exec(command: string) {
    document.execCommand(command)
    editorRef.current?.focus()
    onChange(editorRef.current?.innerHTML ?? "")
  }

  function insertLink() {
    const url = window.prompt("Enter URL:")
    if (url) {
      document.execCommand("createLink", false, url)
      onChange(editorRef.current?.innerHTML ?? "")
    }
  }

  return (
    <div className={cn("overflow-hidden rounded-lg border border-input", className)}>
      <div className="flex items-center gap-0.5 border-b border-border bg-secondary/50 p-1.5">
        {TOOLBAR_ACTIONS.map((action) => (
          <Button key={action.command} type="button" variant="ghost" size="icon" className="size-8" title={action.label} onClick={() => exec(action.command)}>
            <action.icon className="size-4" />
          </Button>
        ))}
        <Button type="button" variant="ghost" size="icon" className="size-8" title="Insert Link" onClick={insertLink}>
          <Link2 className="size-4" />
        </Button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className="prose prose-sm min-h-[160px] max-w-none p-4 text-sm text-foreground focus:outline-none [&:empty]:before:text-muted-foreground [&:empty]:before:content-[attr(data-placeholder)]"
      />
    </div>
  )
}
