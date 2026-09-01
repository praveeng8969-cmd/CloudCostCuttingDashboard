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
      <div className="w-12 h-12 bg-slate-800/80 border border-slate-700 rounded-full flex items-center justify-center mb-3 shadow-inner">
        <Search className="w-5 h-5 text-blue-400" />
      </div>
      <p className="text-sm font-bold text-white">{title}</p>
      <p className="text-xs text-slate-400 mt-1">{description}</p>
    </div>
  )
}
