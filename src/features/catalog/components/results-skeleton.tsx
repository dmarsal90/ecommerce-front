export function ResultsSkeleton() {
  return (
    <ul aria-hidden className="mt-14 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, i) => (
        <li key={i} className="animate-pulse space-y-3">
          <div className="bg-surface border-border rounded-card aspect-[4/5] border" />
          <div className="bg-surface h-3 w-1/3 rounded-full" />
          <div className="bg-surface h-4 w-2/3 rounded-full" />
        </li>
      ))}
    </ul>
  );
}
