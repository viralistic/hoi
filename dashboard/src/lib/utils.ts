import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return n.toString()
}

export function statusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-700'
    case 'draft':
      return 'bg-gray-100 text-gray-600'
    case 'scheduled':
      return 'bg-blue-100 text-blue-700'
    case 'archived':
      return 'bg-red-100 text-red-600'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    case 'in_progress':
      return 'bg-blue-100 text-blue-700'
    case 'dismissed':
      return 'bg-gray-100 text-gray-400'
    default:
      return 'bg-gray-100 text-gray-600'
  }
}

export function contentTypeIcon(type: string): string {
  switch (type) {
    case 'blog': return '📝'
    case 'page': return '📄'
    case 'social': return '💬'
    case 'email': return '✉️'
    case 'landing': return '🚀'
    default: return '📝'
  }
}
