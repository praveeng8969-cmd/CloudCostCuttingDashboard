import { Search } from 'lucide-react'

interface EmptyStateProps {
  title?: string
  description?: string
}

export default function EmptyState({
  title = 'No results found',
  description = 'Try adjusting your search or filter.',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mb-3">
        <Search className="w-4 h-4 text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="text-xs text-slate-500 mt-0.5">{description}</p>
    </div>
  )
}
