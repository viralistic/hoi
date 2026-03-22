import type { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  editor: Editor
  onAiGenerate: () => void
}

export function EditorToolbar({ editor, onAiGenerate }: Props) {
  const btn = (active: boolean) =>
    cn(
      'flex h-7 w-7 items-center justify-center rounded text-sm transition-colors',
      active
        ? 'bg-[#101010] text-white'
        : 'text-[#525252] hover:bg-[#f5f5f5] hover:text-[#0a0a0a]'
    )

  return (
    <div className="flex items-center gap-0.5 border-b border-[#e5e5e5] bg-white px-4 py-1.5">
      <ToolbarGroup>
        <button
          className={btn(editor.isActive('heading', { level: 1 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          title="Heading 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          className={btn(editor.isActive('heading', { level: 2 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Heading 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          className={btn(editor.isActive('heading', { level: 3 }))}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>
      </ToolbarGroup>

      <Divider />

      <ToolbarGroup>
        <button
          className={btn(editor.isActive('bold'))}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          className={btn(editor.isActive('italic'))}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          className={btn(editor.isActive('underline'))}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          title="Underline"
        >
          <Underline className="h-3.5 w-3.5" />
        </button>
      </ToolbarGroup>

      <Divider />

      <ToolbarGroup>
        <button
          className={btn(editor.isActive('bulletList'))}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet list"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          className={btn(editor.isActive('orderedList'))}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Ordered list"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
      </ToolbarGroup>

      <Divider />

      <button
        onClick={onAiGenerate}
        className="flex items-center gap-1.5 rounded-md bg-[#101010] px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-[#222]"
        title="Generate with AI"
      >
        <Sparkles className="h-3 w-3" />
        Generate
      </button>
    </div>
  )
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>
}

function Divider() {
  return <div className="mx-1.5 h-4 w-px bg-[#e5e5e5]" />
}
