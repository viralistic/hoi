import * as React from 'react'
import { cn } from '@/lib/utils'

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2 text-sm text-[#0a0a0a] shadow-sm placeholder:text-[#a3a3a3] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101010] focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Textarea }
