interface TagsProps {
  tags: string[]
}

const tagStyles = [
  'border-emerald-200 bg-emerald-50 text-emerald-800',
  'border-amber-200 bg-amber-50 text-amber-800',
  'border-sky-200 bg-sky-50 text-sky-800',
  'border-rose-200 bg-rose-50 text-rose-800',
]

export default function Tags({ tags }: TagsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={tag}
          className={`rounded-full border px-3 py-1 text-sm font-medium shadow-sm ${tagStyles[index % tagStyles.length]}`}
        >
          {tag}
        </span>
      ))}
    </div>
  )
}
