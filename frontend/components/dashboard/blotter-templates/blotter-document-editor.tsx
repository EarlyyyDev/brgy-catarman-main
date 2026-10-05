"use client"

import * as React from "react"
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  CalendarClock,
  ChevronDown,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Minus,
  PenLine,
  QrCode,
  Redo2,
  Stamp,
  Table as TableIcon,
  Underline,
  Undo2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScaledDocumentPreview } from "@/components/shared/scaled-document-preview"
import { PLACEHOLDER_GROUPS } from "@/lib/blotter-placeholders"
import { cn } from "@/lib/utils"

const FONT_FAMILIES = ["Georgia", "Times New Roman", "Arial", "Verdana", "Courier New"]
const FONT_SIZES = [10, 11, 12, 13, 14, 16, 18, 20, 24, 28]
const TEXT_COLORS = [
  { label: "Ink", value: "#0F172A" },
  { label: "Blue", value: "#1E40AF" },
  { label: "Red", value: "#DC2626" },
  { label: "Green", value: "#16A34A" },
  { label: "Gold", value: "#B45309" },
  { label: "Gray", value: "#64748B" },
]

const ICON_BUTTON = "size-8 rounded-md text-[#334155] hover:bg-[#F1F5F9]"

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px shrink-0 bg-border" />
}

function placeholderChip(token: string): string {
  return `<span contenteditable="false" data-token="${token}" style="display:inline-block;background:#EFF6FF;color:#1E40AF;border:1px solid #BFDBFE;border-radius:4px;padding:1px 5px;margin:0 1px;font-size:0.85em;font-family:ui-monospace,monospace;">{{${token}}}</span>&nbsp;`
}

interface BlotterDocumentEditorProps {
  html: string
  onChange: (html: string) => void
}

export function BlotterDocumentEditor({ html, onChange }: BlotterDocumentEditorProps) {
  const editableRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (editableRef.current && editableRef.current.innerHTML !== html) {
      editableRef.current.innerHTML = html
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  React.useEffect(() => {
    if (editableRef.current && document.activeElement !== editableRef.current && editableRef.current.innerHTML !== html) {
      editableRef.current.innerHTML = html
    }
  }, [html])

  function emitChange() {
    if (editableRef.current) onChange(editableRef.current.innerHTML)
  }

  function focusEditor() {
    editableRef.current?.focus()
  }

  function exec(command: string, value?: string) {
    focusEditor()
    document.execCommand(command, false, value)
    emitChange()
  }

  function insertHtml(snippet: string) {
    focusEditor()
    document.execCommand("insertHTML", false, snippet)
    emitChange()
  }

  function applyFontSize(px: string) {
    focusEditor()
    document.execCommand("fontSize", false, "7")
    editableRef.current?.querySelectorAll('font[size="7"]').forEach((el) => {
      const span = document.createElement("span")
      span.style.fontSize = `${px}px`
      span.innerHTML = (el as HTMLElement).innerHTML
      el.replaceWith(span)
    })
    emitChange()
  }

  function insertTable() {
    const cell = '<td style="border:1px solid #CBD5E1;padding:6px;">&nbsp;</td>'
    const row = `<tr>${cell.repeat(3)}</tr>`
    insertHtml(`<table style="width:100%;border-collapse:collapse;margin:12px 0;">${row.repeat(3)}</table><p><br/></p>`)
  }

  function insertDivider() {
    insertHtml('<hr style="margin:16px 0;border:none;border-top:2px solid #0F172A;" />')
  }

  function insertPlaceholder(token: string) {
    insertHtml(placeholderChip(token))
  }

  return (
    <div className="rounded-xl border border-border bg-white shadow-sm">
      <div className="sticky top-16 z-20 overflow-x-auto rounded-t-xl border-b border-border bg-white">
        <div className="flex min-w-max items-center gap-0.5 p-2">
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("undo")} aria-label="Undo">
            <Undo2 className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("redo")} aria-label="Redo">
            <Redo2 className="size-4" />
          </Button>

          <ToolbarDivider />

          <Select onValueChange={(v) => exec("fontName", v)}>
            <SelectTrigger className="h-8 w-36 text-xs">
              <SelectValue placeholder="Font" />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((f) => (
                <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(v) => applyFontSize(v)}>
            <SelectTrigger className="h-8 w-16 text-xs">
              <SelectValue placeholder="Size" />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ToolbarDivider />

          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("bold")} aria-label="Bold">
            <Bold className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("italic")} aria-label="Italic">
            <Italic className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("underline")} aria-label="Underline">
            <Underline className="size-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} aria-label="Text color">
                <span className="flex flex-col items-center leading-none">
                  <span className="text-xs font-bold">A</span>
                  <span className="mt-0.5 h-1 w-4 rounded-full bg-[#DC2626]" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Text Color</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {TEXT_COLORS.map((c) => (
                <DropdownMenuItem key={c.value} onClick={() => exec("foreColor", c.value)}>
                  <span className="size-3 rounded-full" style={{ backgroundColor: c.value }} />
                  {c.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarDivider />

          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("justifyLeft")} aria-label="Align left">
            <AlignLeft className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("justifyCenter")} aria-label="Align center">
            <AlignCenter className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("justifyRight")} aria-label="Align right">
            <AlignRight className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={() => exec("justifyFull")} aria-label="Justify">
            <AlignJustify className="size-4" />
          </Button>

          <ToolbarDivider />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => exec("insertUnorderedList")}
            aria-label="Bullet list"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => exec("insertOrderedList")}
            aria-label="Numbered list"
          >
            <ListOrdered className="size-4" />
          </Button>

          <ToolbarDivider />

          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={insertTable} aria-label="Insert table">
            <TableIcon className="size-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className={ICON_BUTTON} onClick={insertDivider} aria-label="Insert horizontal line">
            <Minus className="size-4" />
          </Button>

          <ToolbarDivider />

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => insertPlaceholder("barangay_logo")}
            aria-label="Insert barangay logo"
            title="Insert Barangay Logo"
          >
            <ImageIcon className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => insertPlaceholder("barangay_seal")}
            aria-label="Insert barangay seal"
            title="Insert Barangay Seal"
          >
            <Stamp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => insertPlaceholder("mediator_signature")}
            aria-label="Insert mediator signature"
            title="Insert Mediator Signature"
          >
            <PenLine className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => insertPlaceholder("hearing_schedule")}
            aria-label="Insert hearing schedule"
            title="Insert Hearing Schedule"
          >
            <CalendarClock className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={ICON_BUTTON}
            onClick={() => insertPlaceholder("qr_code")}
            aria-label="Insert QR code"
            title="Insert QR Code"
          >
            <QrCode className="size-4" />
          </Button>

          <ToolbarDivider />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8 shrink-0">
                Insert Placeholder
                <ChevronDown className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="max-h-96 w-64 overflow-y-auto">
              {PLACEHOLDER_GROUPS.map((group, idx) => (
                <React.Fragment key={group.label}>
                  {idx > 0 ? <DropdownMenuSeparator /> : null}
                  <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                  {group.items.map((item) => (
                    <DropdownMenuItem key={item.token} onClick={() => insertPlaceholder(item.token)}>
                      <span className="font-mono text-xs text-primary">{"{{" + item.token + "}}"}</span>
                      <span className="ml-auto text-xs text-muted-foreground">{item.label}</span>
                    </DropdownMenuItem>
                  ))}
                </React.Fragment>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="min-w-0 rounded-b-xl bg-secondary/30 p-4 sm:p-8">
        <ScaledDocumentPreview>
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={emitChange}
            className={cn(
              "mx-auto min-h-[297mm] w-[210mm] max-w-none bg-white p-[18mm] text-[13px] leading-relaxed text-[#0a1930] shadow-lg outline-none",
              "cert-document"
            )}
            style={{ fontFamily: "Georgia, serif" }}
          />
        </ScaledDocumentPreview>
      </div>
    </div>
  )
}
