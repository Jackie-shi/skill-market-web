export default function SkillCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/50 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="h-5 bg-gray-700 rounded w-2/3 mb-2" />
          <div className="h-3 bg-gray-800 rounded w-1/3" />
        </div>
        <div className="h-6 w-14 bg-gray-700 rounded-full" />
      </div>
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-gray-800 rounded w-full" />
        <div className="h-3 bg-gray-800 rounded w-4/5" />
      </div>
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-800 rounded-full" />
        <div className="h-5 w-12 bg-gray-800 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        <div className="h-3 bg-gray-800 rounded w-20" />
        <div className="h-3 bg-gray-800 rounded w-16" />
      </div>
    </div>
  );
}
