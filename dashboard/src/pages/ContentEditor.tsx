import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import CharacterCount from '@tiptap/extension-character-count'
import { ChevronLeft, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { SeoPanel } from '@/components/editor/SeoPanel'
import { AiGenerateDialog } from '@/components/editor/AiGenerateDialog'
import { useContentPiece, useUpdateContent } from '@/hooks/useContent'
import { useClient } from '@/hooks/useClients'
import { useSeoScore } from '@/hooks/useSeoScore'
import type { ContentPiece } from '@/types'

const STATUS_OPTIONS = ['draft', 'published', 'scheduled', 'archived'] as const
const TYPE_OPTIONS = ['blog', 'page', 'landing', 'email', 'social'] as const

export default function ContentEditor() {
  const { clientId, contentId } = useParams<{ clientId: string; contentId: string }>()
  const navigate = useNavigate()

  const { data: piece, isLoading } = useContentPiece(contentId)
  const { data: client } = useClient(clientId)
  const { mutate: save, isPending: saving } = useUpdateContent()

  const [title, setTitle] = useState('')
  const [targetKeyword, setTargetKeyword] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState<ContentPiece['status']>('draft')
  const [contentType, setContentType] = useState<ContentPiece['content_type']>('blog')
  const [aiOpen, setAiOpen] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: 'Start writing...' }),
      Underline,
      CharacterCount,
    ],
    content: '',
    onUpdate: () => {
      // auto-save after 2s of inactivity
      if (saveTimer) clearTimeout(saveTimer)
      setSaveTimer(setTimeout(() => handleSave(), 2000))
    },
  })

  // Load piece data into state
  useEffect(() => {
    if (!piece) return
    setTitle(piece.title)
    setTargetKeyword(piece.target_keyword || '')
    setMetaTitle(piece.meta_title || '')
    setMetaDescription(piece.meta_description || '')
    setStatus(piece.status)
    setContentType(piece.content_type)
    if (editor && piece.content && editor.isEmpty) {
      editor.commands.setContent(piece.content)
    }
  }, [piece, editor])

  const allKeywords = [
    ...(client?.main_keywords || []),
    ...(client?.extra_keywords || []),
  ]

  const html = editor?.getHTML() || ''

  const seoScore = useSeoScore({
    html,
    targetKeyword,
    relatedKeywords: allKeywords.filter((k) => k !== targetKeyword),
    metaTitle,
    metaDescription,
  })

  const handleSave = useCallback(() => {
    if (!contentId || !editor) return
    save(
      {
        id: contentId,
        data: {
          title: title || 'Untitled',
          content: editor.getHTML(),
          target_keyword: targetKeyword || undefined,
          meta_title: metaTitle || undefined,
          meta_description: metaDescription || undefined,
          status,
          content_type: contentType,
          seo_score: seoScore.total,
        },
      },
      { onSuccess: () => setSavedAt(new Date()) }
    )
  }, [contentId, editor, title, targetKeyword, metaTitle, metaDescription, status, contentType, seoScore.total, save])

  function handleInsertAiContent(html: string) {
    if (!editor) return
    editor.commands.setContent(editor.getHTML() + html)
  }

  if (isLoading) {
    return <div className="flex h-full items-center justify-center text-sm text-[#a3a3a3]">Loading...</div>
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center gap-3 border-b border-[#e5e5e5] bg-white px-4 py-2.5">
        <button
          onClick={() => navigate(`/clients/${clientId}`)}
          className="flex items-center gap-1 text-xs text-[#737373] hover:text-[#0a0a0a] transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Back
        </button>

        <Separator orientation="vertical" className="h-4" />

        {/* Title input */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm font-medium text-[#0a0a0a] outline-none placeholder:text-[#a3a3a3]"
          placeholder="Untitled"
        />

        <div className="flex items-center gap-2">
          {/* Status */}
          <Select value={status} onValueChange={(v) => setStatus(v as ContentPiece['status'])}>
            <SelectTrigger className="h-7 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type */}
          <Select value={contentType} onValueChange={(v) => setContentType(v as ContentPiece['content_type'])}>
            <SelectTrigger className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_OPTIONS.map((t) => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {savedAt ? (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <Check className="h-3 w-3" />
              Saved
            </span>
          ) : null}

          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Editor area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {editor && (
            <EditorToolbar editor={editor} onAiGenerate={() => setAiOpen(true)} />
          )}

          {/* Meta fields */}
          <div className="flex gap-3 border-b border-[#f5f5f5] bg-[#fafafa] px-6 py-2.5">
            <div className="flex flex-1 items-center gap-2">
              <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] w-20">
                Target KW
              </span>
              <Input
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
                placeholder="main keyword"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] w-20">
                Meta title
              </span>
              <Input
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="SEO title (50-60 chars)"
                className="h-7 text-xs"
              />
            </div>
            <div className="flex flex-1 items-center gap-2">
              <span className="flex-shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#a3a3a3] w-20">
                Meta desc
              </span>
              <Input
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Meta description (120-160 chars)"
                className="h-7 text-xs"
              />
            </div>
          </div>

          {/* TipTap editor */}
          <div className="flex-1 overflow-y-auto px-16 py-8">
            <EditorContent editor={editor} />
          </div>
        </div>

        {/* SEO panel */}
        <div className="w-64 flex-shrink-0 border-l border-[#e5e5e5] bg-white overflow-hidden">
          <div className="border-b border-[#e5e5e5] px-4 py-2.5">
            <p className="text-xs font-semibold text-[#0a0a0a]">SEO</p>
          </div>
          <SeoPanel
            score={seoScore}
            targetKeyword={targetKeyword}
            allKeywords={allKeywords}
          />
        </div>
      </div>

      <AiGenerateDialog
        open={aiOpen}
        onOpenChange={setAiOpen}
        client={client || null}
        targetKeyword={targetKeyword}
        onInsert={handleInsertAiContent}
      />
    </div>
  )
}
