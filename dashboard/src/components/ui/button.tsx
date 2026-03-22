import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-[#101010] text-[#fafafa] hover:bg-[#222] focus-visible:ring-[#101010]',
        outline: 'border border-[#e5e5e5] bg-white hover:bg-[#f5f5f5] text-[#0a0a0a] focus-visible:ring-[#101010]',
        ghost: 'hover:bg-[#f5f5f5] text-[#0a0a0a] focus-visible:ring-[#101010]',
        secondary: 'bg-[#f5f5f5] text-[#171717] hover:bg-[#e5e5e5] focus-visible:ring-[#101010]',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        link: 'text-[#0a0a0a] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-7 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
