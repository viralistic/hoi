import { cn } from '@/lib/utils'
import { scoreColor, scoreBg } from '@/lib/seo-analyzer'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { SeoScore } from '@/types'

interface Props {
  score: SeoScore
  targetKeyword: string
  allKeywords: string[]
}

export function SeoPanel({ score, targetKeyword, allKeywords }: Props) {
  const { total, details } = score

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4">
      {/* Total score */}
      <div className={cn('rounded-lg border p-4', scoreBg(total))}>
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-medium text-[#525252]">SEO Score</span>
          <span className={cn('text-2xl font-bold', scoreColor(total))}>{total}</span>
        </div>
        <Progress value={total} className="mt-2 h-1.5" />
        <p className="mt-1.5 text-[11px] text-[#737373]">
          {total >= 70 ? 'Good — content is well optimized' : total >= 40 ? 'Needs improvement' : 'Poor — needs significant work'}
        </p>
      </div>

      {/* Score breakdown */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Breakdown
        </p>
        <ScoreRow label="Keyword density" score={score.keywordDensity} max={30} />
        <ScoreRow label="Heading structure" score={score.headingUsage} max={20} />
        <ScoreRow label="Meta completeness" score={score.metaCompleteness} max={20} />
        <ScoreRow label="Word count" score={score.wordCountScore} max={15} />
        <ScoreRow label="Related terms" score={score.relatedTerms} max={15} />
      </div>

      {/* Content stats */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Content
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Stat label="Words" value={details.wordCount} target={details.targetWordCount} />
          <Stat label="H1 tags" value={details.h1Count} ideal="1" />
          <Stat label="H2 tags" value={details.h2Count} ideal="2+" />
        </div>
      </div>

      {/* Keyword tracker */}
      {(targetKeyword || allKeywords.length > 0) && (
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
            Keywords
          </p>
          <div className="flex flex-col gap-1">
            {targetKeyword && (
              <KeywordRow
                keyword={targetKeyword}
                count={details.keywordFrequency[targetKeyword] || 0}
                isTarget
              />
            )}
            {allKeywords
              .filter((kw) => kw !== targetKeyword)
              .map((kw) => (
                <KeywordRow
                  key={kw}
                  keyword={kw}
                  count={details.keywordFrequency[kw] || 0}
                />
              ))}
          </div>
        </div>
      )}

      {/* Quick checks */}
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">
          Checks
        </p>
        <Check
          label="Has target keyword"
          pass={!!targetKeyword && (details.keywordFrequency[targetKeyword] || 0) > 0}
        />
        <Check label="Has H1 heading" pass={details.h1Count === 1} warn={details.h1Count > 1} />
        <Check label="Has multiple H2s" pass={details.h2Count >= 2} />
        <Check label="Meets word count target" pass={details.wordCount >= details.targetWordCount} />
      </div>
    </div>
  )
}

function ScoreRow({ label, score, max }: { label: string; score: number; max: number }) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="flex items-center gap-2 py-0.5">
      <span className="w-32 text-xs text-[#525252] truncate">{label}</span>
      <Progress value={pct} className="flex-1 h-1" />
      <span className="w-10 text-right text-xs text-[#737373]">
        {score}/{max}
      </span>
    </div>
  )
}

function Stat({
  label,
  value,
  target,
  ideal,
}: {
  label: string
  value: number
  target?: number
  ideal?: string
}) {
  return (
    <div className="rounded-md border border-[#e5e5e5] bg-white p-2">
      <p className="text-[11px] text-[#a3a3a3]">{label}</p>
      <p className="text-base font-semibold text-[#0a0a0a]">{value}</p>
      {target !== undefined && (
        <p className="text-[11px] text-[#a3a3a3]">target: {target}</p>
      )}
      {ideal && <p className="text-[11px] text-[#a3a3a3]">ideal: {ideal}</p>}
    </div>
  )
}

function KeywordRow({
  keyword,
  count,
  isTarget,
}: {
  keyword: string
  count: number
  isTarget?: boolean
}) {
  const good = count > 0
  return (
    <div className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-[#f5f5f5]">
      <div
        className={cn(
          'h-1.5 w-1.5 rounded-full flex-shrink-0',
          good ? 'bg-green-500' : 'bg-[#e5e5e5]'
        )}
      />
      <span className={cn('flex-1 text-xs truncate', isTarget && 'font-medium')}>{keyword}</span>
      <span
        className={cn(
          'text-xs font-mono',
          count > 0 ? 'text-[#0a0a0a]' : 'text-[#a3a3a3]'
        )}
      >
        {count}×
      </span>
    </div>
  )
}

function Check({
  label,
  pass,
  warn,
}: {
  label: string
  pass: boolean
  warn?: boolean
}) {
  return (
    <div className="flex items-center gap-2 py-0.5">
      {warn ? (
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
      ) : pass ? (
        <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
      ) : (
        <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#d4d4d4]" />
      )}
      <span className={cn('text-xs', pass && !warn ? 'text-[#525252]' : 'text-[#a3a3a3]')}>
        {label}
      </span>
    </div>
  )
}
