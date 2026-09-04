"use client"

import { useEffect, useRef, useState } from "react"
import {
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { copy } from "@/lib/i18n"

type ForumEditorProps = {
  id: string
  value: string
  placeholder: string
  invalid?: boolean
  onChange: (value: string) => void
}

type EditorCommand = {
  command: string
  icon: LucideIcon
  label: string
  value?: string
}

const inlineCommands: EditorCommand[] = [
  { command: "bold", icon: Bold, label: copy.forum.editorBold },
  { command: "italic", icon: Italic, label: copy.forum.editorItalic },
  { command: "underline", icon: Underline, label: copy.forum.editorUnderline },
]

const blockCommands: EditorCommand[] = [
  {
    command: "insertUnorderedList",
    icon: List,
    label: copy.forum.editorBulletList,
  },
  {
    command: "insertOrderedList",
    icon: ListOrdered,
    label: copy.forum.editorNumberedList,
  },
  {
    command: "formatBlock",
    icon: Quote,
    label: copy.forum.editorQuote,
    value: "blockquote",
  },
]

function normalizeValue(value: string) {
  return value === "<br>" ? "" : value
}

export function getEditorText(value: string) {
  return value
    .replace(/<br\s*\/?>(\s*)/gi, " $1")
    .replace(/<\/(p|div|li|blockquote)>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim()
}

export function ForumEditor({
  id,
  value,
  placeholder,
  invalid,
  onChange,
}: ForumEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isEmpty, setIsEmpty] = useState(!getEditorText(value))
  const [characterCount, setCharacterCount] = useState(
    getEditorText(value).length
  )

  useEffect(() => {
    const editor = editorRef.current
    if (!editor || editor.innerHTML === value) return

    editor.innerHTML = value
    const text = getEditorText(value)
    setIsEmpty(!text)
    setCharacterCount(text.length)
  }, [value])

  function syncValue(editor: HTMLDivElement) {
    const nextValue = normalizeValue(editor.innerHTML)
    const text = getEditorText(nextValue)
    onChange(nextValue)
    setIsEmpty(!text)
    setCharacterCount(text.length)
  }

  function runCommand(command: string, commandValue?: string) {
    const editor = editorRef.current
    if (!editor) return

    editor.focus()
    document.execCommand(command, false, commandValue)
    syncValue(editor)
  }

  function addLink() {
    const url = window.prompt(copy.forum.editorLinkPrompt)
    if (!url?.trim()) return

    const normalizedUrl = /^(https?:\/\/|mailto:|\/)/i.test(url.trim())
      ? url.trim()
      : `https://${url.trim()}`
    runCommand("createLink", normalizedUrl)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!event.metaKey && !event.ctrlKey) return

    const key = event.key.toLowerCase()
    const command =
      key === "b"
        ? "bold"
        : key === "i"
          ? "italic"
          : key === "u"
            ? "underline"
            : null
    if (!command) return

    event.preventDefault()
    runCommand(command)
  }

  function handlePaste(event: React.ClipboardEvent<HTMLDivElement>) {
    event.preventDefault()
    document.execCommand(
      "insertText",
      false,
      event.clipboardData.getData("text/plain")
    )

    if (editorRef.current) {
      syncValue(editorRef.current)
    }
  }

  return (
    <div className="overflow-hidden rounded-[var(--control-radius)]">
      <div
        className="glass-toolbar flex flex-wrap items-center gap-1 border border-input px-2 py-1.5"
        role="toolbar"
        aria-label={copy.forum.editorToolbar}
      >
        {inlineCommands.map(({ command, icon: Icon, label }) => (
          <Button
            key={command}
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            title={label}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => runCommand(command)}
          >
            <Icon aria-hidden="true" />
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5" />
        {blockCommands.map(
          ({ command, icon: Icon, label, value: commandValue }) => (
            <Button
              key={command}
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={label}
              title={label}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => runCommand(command, commandValue)}
            >
              <Icon aria-hidden="true" />
            </Button>
          )
        )}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.forum.editorLink}
          title={copy.forum.editorLink}
          onMouseDown={(event) => event.preventDefault()}
          onClick={addLink}
        >
          <Link2 aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.forum.editorClearFormatting}
          title={copy.forum.editorClearFormatting}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("removeFormat")}
        >
          <RemoveFormatting aria-hidden="true" />
        </Button>
        <Separator
          orientation="vertical"
          className="mx-1 hidden h-5 sm:block"
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.forum.editorUndo}
          title={copy.forum.editorUndo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("undo")}
        >
          <Undo2 aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={copy.forum.editorRedo}
          title={copy.forum.editorRedo}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => runCommand("redo")}
        >
          <Redo2 aria-hidden="true" />
        </Button>
      </div>
      <div
        ref={editorRef}
        id={id}
        className="forum-editor-content"
        contentEditable
        data-empty={isEmpty}
        data-placeholder={placeholder}
        role="textbox"
        aria-multiline="true"
        aria-invalid={invalid || undefined}
        suppressContentEditableWarning
        onInput={(event) => syncValue(event.currentTarget)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
      />
      <div className="flex items-center justify-between gap-3 border border-t-0 border-input bg-background/30 px-3 py-2 text-xs text-muted-foreground">
        <span>{copy.forum.editorHint}</span>
        <span className="shrink-0 tabular-nums">{characterCount} 字</span>
      </div>
    </div>
  )
}
